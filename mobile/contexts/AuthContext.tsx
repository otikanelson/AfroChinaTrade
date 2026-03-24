import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser, AuthContextType, LoginCredentials, RegisterData, AuthResponse } from '../types/auth';
import { authService } from '../services/AuthService';
import { tokenManager } from '../services/api/tokenManager';
import { APP_CONFIG } from '../constants/config';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = '@afrochinatrade:auth_user';
const GUEST_MODE_KEY = '@afrochinatrade:guest_mode';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      setAuthError(null);

      // Check if user was in guest mode
      const guestModeFlag = await AsyncStorage.getItem(GUEST_MODE_KEY);
      if (guestModeFlag === 'true') {
        console.log('👤 Continuing in guest mode');
        setIsGuestMode(true);
        setIsLoading(false);
        return;
      }

      // Initialize token manager
      await tokenManager.initialize();

      // Check if we have tokens
      if (!tokenManager.isAuthenticated()) {
        console.log('🔐 No tokens found, starting in guest mode');
        setIsGuestMode(true);
        setIsLoading(false);
        return;
      }

      // Try to load user from storage first (for faster startup)
      const storedUser = await AsyncStorage.getItem(AUTH_USER_KEY);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsGuestMode(false);
        console.log('👤 Loaded user from storage:', userData.name);
      }

      // Then refresh user data from server (but don't block startup)
      loadCurrentUser().catch(error => {
        console.warn('Failed to refresh user data:', error);
        // Don't force logout on connection errors during startup
        if (APP_CONFIG.debug) {
          console.log('🔄 Will retry user data refresh later');
        }
      });
    } catch (error) {
      console.error('Auth initialization failed:', error);
      // Allow guest mode on error
      setIsGuestMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const userProfile = await authService.getCurrentUser();
      const authUser: AuthUser = {
        id: userProfile._id,
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
        avatar: userProfile.avatar,
        role: userProfile.role,
        status: userProfile.status,
        addresses: userProfile.addresses,
        createdAt: userProfile.createdAt,
        updatedAt: userProfile.updatedAt,
      };

      setUser(authUser);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
      console.log('✅ User profile loaded:', authUser.name);
    } catch (error: any) {
      console.error('Failed to load user profile:', error);
      
      // If it's an auth error, clear everything
      if (error.code === 'NO_TOKEN' || error.status === 401) {
        await handleAuthError();
      }
    }
  };

  const handleAuthError = async () => {
    console.log('🚨 Handling auth error - clearing user data and switching to guest mode');
    setUser(null);
    setIsGuestMode(true);
    await tokenManager.clearTokens();
    await AsyncStorage.removeItem(AUTH_USER_KEY);
    await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
  };

  const login = async (credentials: LoginCredentials, onSuccess?: () => void): Promise<AuthResponse> => {
    try {
      setAuthError(null);
      const authResponse = await authService.login(credentials);
      
      const authUser: AuthUser = {
        id: authResponse.userId,
        name: authResponse.name,
        email: authResponse.email,
        role: authResponse.role,
      };

      setUser(authUser);
      setIsGuestMode(false);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      
      // Load full profile in background
      setTimeout(() => loadCurrentUser(), 100);
      
      // Call success callback if provided
      if (onSuccess) {
        setTimeout(onSuccess, 200);
      }
      
      return authResponse;
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setAuthError(errorMessage);
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
      setAuthError(null);
      const authResponse = await authService.register(data);
      
      const authUser: AuthUser = {
        id: authResponse.userId,
        name: authResponse.name,
        email: authResponse.email,
        role: authResponse.role,
      };

      setUser(authUser);
      setIsGuestMode(false);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      
      // Load full profile in background
      setTimeout(() => loadCurrentUser(), 100);
      
      return authResponse;
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      setAuthError(errorMessage);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout service failed, but continuing with local logout');
    } finally {
      setUser(null);
      setIsGuestMode(true);
      await AsyncStorage.removeItem(AUTH_USER_KEY);
      await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
    }
  };

  const forceLogout = async (): Promise<void> => {
    console.log('🔒 Force logout triggered');
    await logout();
  };

  const enableGuestMode = async (): Promise<void> => {
    console.log('👤 Enabling guest mode');
    setIsGuestMode(true);
    await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
  };

  const requireAuth = (): boolean => {
    return !!user && tokenManager.isAuthenticated();
  };

  const getCurrentUser = async (): Promise<void> => {
    await loadCurrentUser();
  };

  const updateProfile = async (data: Partial<AuthUser>): Promise<void> => {
    try {
      const updateData = {
        name: data.name,
        phone: data.phone,
        avatar: data.avatar,
      };
      
      const updatedProfile = await authService.updateProfile(updateData);
      
      const authUser: AuthUser = {
        id: updatedProfile._id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
        avatar: updatedProfile.avatar,
        role: updatedProfile.role,
        status: updatedProfile.status,
        addresses: updatedProfile.addresses,
        createdAt: updatedProfile.createdAt,
        updatedAt: updatedProfile.updatedAt,
      };

      setUser(authUser);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const clearError = () => {
    setAuthError(null);
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user && tokenManager.isAuthenticated(),
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    isLoading,
    authError,
    isGuestMode,
    login,
    register,
    logout,
    forceLogout,
    getCurrentUser,
    updateProfile,
    clearError,
    enableGuestMode,
    requireAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}