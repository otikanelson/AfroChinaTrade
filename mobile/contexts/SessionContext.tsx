import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/api/apiClient';
import { tokenManager } from '../services/api/tokenManager';
import { useAuth } from './AuthContext';

interface SessionContextType {
  isSessionActive: boolean;
  lastActivity: Date | null;
  refreshSession: () => Promise<void>;
  updateActivity: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_TIMEOUT = 60 * 60 * 1000; // 60 minutes (1 hour) in milliseconds
const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000; // Refresh token every 50 minutes
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check session every minute
const LAST_ACTIVITY_KEY = 'last_activity';

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const tokenRefreshInterval = useRef<NodeJS.Timeout | null>(null);

  // Update last activity timestamp
  const updateActivity = useCallback(async () => {
    const now = new Date();
    setLastActivity(now);
    await AsyncStorage.setItem(LAST_ACTIVITY_KEY, now.toISOString());
  }, []);

  // Load last activity from storage
  const loadLastActivity = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
      if (stored) {
        const lastActivityDate = new Date(stored);
        setLastActivity(lastActivityDate);
        
        // Check if session has expired while app was closed
        const now = new Date();
        const timeSinceActivity = now.getTime() - lastActivityDate.getTime();
        
        if (timeSinceActivity > SESSION_TIMEOUT) {
          console.log('⏰ Session expired while app was closed');
          setIsSessionActive(false);
          logout();
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to load last activity:', error);
    }
  }, [logout]);

  // Refresh session token
  const refreshSession = useCallback(async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post('/auth/refresh', { refreshToken });
      
      if (response.data?.token) {
        await tokenManager.setTokens(response.data.token, refreshToken);
        console.log('🔄 Session token refreshed successfully');
      }
    } catch (error: any) {
      console.error('❌ Failed to refresh session:', error);
      
      // If refresh fails due to invalid token, clear everything and logout
      if (error?.code === 'UNKNOWN_ERROR' && error?.status === 401) {
        console.log('🔑 Invalid refresh token, clearing all session data');
        await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'last_activity']);
      }
      
      setIsSessionActive(false);
      logout();
    }
  }, [logout]);

  // Check if session should be expired due to inactivity
  const checkSessionTimeout = useCallback(async () => {
    if (!user || !lastActivity) return;

    const now = new Date();
    const timeSinceActivity = now.getTime() - lastActivity.getTime();

    // If session has expired (60 minutes of inactivity)
    if (timeSinceActivity > SESSION_TIMEOUT) {
      console.log('⏰ Session expired due to 60 minutes of inactivity');
      setIsSessionActive(false);
      logout();
    }
  }, [user, lastActivity, logout]);

  // Handle app state changes
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App became active, update activity
      updateActivity();
      checkSessionTimeout();
    } else if (nextAppState === 'background' || nextAppState === 'inactive') {
      // App went to background, record the time
      updateActivity();
    }
  }, [updateActivity, checkSessionTimeout]);

  // Set up automatic token refresh (every 25 minutes)
  const startTokenRefresh = useCallback(() => {
    if (tokenRefreshInterval.current) {
      clearInterval(tokenRefreshInterval.current);
    }

    tokenRefreshInterval.current = setInterval(async () => {
      if (user && isSessionActive) {
        await refreshSession();
      }
    }, TOKEN_REFRESH_INTERVAL);
  }, [user, isSessionActive, refreshSession]);

  // Set up session timeout checking (every minute)
  const startSessionCheck = useCallback(() => {
    if (sessionCheckInterval.current) {
      clearInterval(sessionCheckInterval.current);
    }

    sessionCheckInterval.current = setInterval(() => {
      checkSessionTimeout();
    }, ACTIVITY_CHECK_INTERVAL);
  }, [checkSessionTimeout]);

  useEffect(() => {
    if (!user) {
      // User logged out, clear session data
      setIsSessionActive(false);
      setLastActivity(null);
      AsyncStorage.removeItem(LAST_ACTIVITY_KEY);
      
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
        sessionCheckInterval.current = null;
      }
      if (tokenRefreshInterval.current) {
        clearInterval(tokenRefreshInterval.current);
        tokenRefreshInterval.current = null;
      }
      return;
    }

    // Load last activity and start session management
    loadLastActivity();
    updateActivity();
    
    // Set up app state listener
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Start automatic token refresh and session checking
    startTokenRefresh();
    startSessionCheck();

    return () => {
      subscription?.remove();
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
        sessionCheckInterval.current = null;
      }
      if (tokenRefreshInterval.current) {
        clearInterval(tokenRefreshInterval.current);
        tokenRefreshInterval.current = null;
      }
    };
  }, [user, loadLastActivity, updateActivity, handleAppStateChange, startTokenRefresh, startSessionCheck]);

  const value: SessionContextType = {
    isSessionActive,
    lastActivity,
    refreshSession,
    updateActivity,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};