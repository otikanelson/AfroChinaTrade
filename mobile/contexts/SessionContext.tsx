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

const SESSION_TIMEOUT = 60 * 60 * 1000;        // 60 min inactivity timeout
const TOKEN_REFRESH_INTERVAL = 50 * 60 * 1000; // Fallback refresh every 50 min
const ACTIVITY_CHECK_INTERVAL = 60 * 1000;     // Check inactivity every minute
const ACTIVITY_REFRESH_DEBOUNCE = 5 * 60 * 1000; // Refresh token at most once per 5 min
const LAST_ACTIVITY_KEY = 'last_activity';

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);

  // Refs for values used inside intervals/callbacks — avoids stale closures
  // without adding them to useEffect dependency arrays
  const lastActivityRef = useRef<Date | null>(null);
  const isSessionActiveRef = useRef(true);
  const lastRefreshTimeRef = useRef<number>(0);
  const logoutRef = useRef(logout);
  const userRef = useRef(user);

  // Keep refs in sync with latest values
  useEffect(() => { logoutRef.current = logout; }, [logout]);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => {
    isSessionActiveRef.current = isSessionActive;
  }, [isSessionActive]);

  // ─── Core: refresh session token ──────────────────────────────────────────

  const refreshSession = useCallback(async () => {
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (!refreshToken) return; // Normal on first mount — skip silently

      const response = await apiClient.post('/auth/refresh', { refreshToken });
      if (response.data?.token) {
        await tokenManager.setTokens(response.data.token, refreshToken);
        console.log('🔄 Session token refreshed successfully');
      }
    } catch (error: any) {
      console.error('❌ Failed to refresh session:', error);
      const status = error?.status || error?.response?.status;
      if (status === 401) {
        console.log('🔑 Refresh token rejected, logging out');
        await tokenManager.clearTokens();
        await AsyncStorage.removeItem(LAST_ACTIVITY_KEY);
        setIsSessionActive(false);
        logoutRef.current();
      }
    }
  }, []); // stable — no deps that change

  // ─── Update activity timestamp + debounced token refresh ──────────────────

  const updateActivity = useCallback(async () => {
    const now = new Date();
    lastActivityRef.current = now;
    setLastActivity(now);
    await AsyncStorage.setItem(LAST_ACTIVITY_KEY, now.toISOString());

    const nowMs = now.getTime();
    if (nowMs - lastRefreshTimeRef.current >= ACTIVITY_REFRESH_DEBOUNCE) {
      lastRefreshTimeRef.current = nowMs;
      refreshSession().catch(() => {});
    }
  }, [refreshSession]); // refreshSession is stable

  // ─── Main session lifecycle — runs only when user changes ─────────────────

  useEffect(() => {
    if (!user) {
      setIsSessionActive(false);
      setLastActivity(null);
      lastActivityRef.current = null;
      AsyncStorage.removeItem(LAST_ACTIVITY_KEY);
      return;
    }

    // User just logged in — mark session active and seed the refresh timer
    // so the first updateActivity doesn't immediately re-refresh a brand-new token
    setIsSessionActive(true);
    lastRefreshTimeRef.current = Date.now();

    // Load persisted last activity and check if session expired while app was closed
    const initSession = async () => {
      try {
        const stored = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
        if (stored) {
          const storedDate = new Date(stored);
          const elapsed = Date.now() - storedDate.getTime();
          if (elapsed > SESSION_TIMEOUT) {
            console.log('⏰ Session expired while app was closed');
            setIsSessionActive(false);
            logoutRef.current();
            return;
          }
          lastActivityRef.current = storedDate;
          setLastActivity(storedDate);
        }
      } catch {
        // ignore storage errors
      }
      // Record fresh activity now
      const now = new Date();
      lastActivityRef.current = now;
      setLastActivity(now);
      await AsyncStorage.setItem(LAST_ACTIVITY_KEY, now.toISOString());
    };

    initSession();

    // ── Inactivity check (every minute) ──
    const sessionCheckTimer = setInterval(() => {
      if (!userRef.current || !lastActivityRef.current) return;
      const elapsed = Date.now() - lastActivityRef.current.getTime();
      if (elapsed > SESSION_TIMEOUT) {
        console.log('⏰ Session expired due to inactivity');
        setIsSessionActive(false);
        logoutRef.current();
      }
    }, ACTIVITY_CHECK_INTERVAL);

    // ── Fallback token refresh (every 50 min) ──
    const tokenRefreshTimer = setInterval(() => {
      if (userRef.current && isSessionActiveRef.current) {
        refreshSession().catch(() => {});
      }
    }, TOKEN_REFRESH_INTERVAL);

    // ── App state changes ──
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active' || nextState === 'background' || nextState === 'inactive') {
        updateActivity();
        if (nextState === 'active' && lastActivityRef.current) {
          const elapsed = Date.now() - lastActivityRef.current.getTime();
          if (elapsed > SESSION_TIMEOUT) {
            console.log('⏰ Session expired while app was backgrounded');
            setIsSessionActive(false);
            logoutRef.current();
          }
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      clearInterval(sessionCheckTimer);
      clearInterval(tokenRefreshTimer);
      subscription.remove();
    };
  }, [user]); // only re-run when user logs in/out

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
