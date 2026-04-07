import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser, AuthContextType, LoginCredentials, RegisterData, AuthResponse } from '../types/auth';
import { authService } from '../services/AuthService';
import { tokenManager } from '../services/api/tokenManager';
import { APP_CONFIG } from '../constants/config';
import { UserStatusModal } from '../components/modals/UserStatusModal';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = '@afrochinatrade:auth_user';
const GUEST_MODE_KEY = '@afrochinatrade:guest_mode';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userStatusModal, setUserStatusModal] = useState<{
    visible: boolean;
    status: 'suspended' | 'blocked';
    reason?: string;
    suspensionDuration?: string;
  }>({
    visible: false,
    status: 'suspended',
  });

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

      // Only update state if the data has actually changed
      setUser(prevUser => {
        if (!prevUser) return authUser;
        
        // Check if any relevant fields have changed
        const hasChanged = 
          prevUser.id !== authUser.id ||
          prevUser.name !== authUser.name ||
          prevUser.email !== authUser.email ||
          prevUser.phone !== authUser.phone ||
          prevUser.avatar !== authUser.avatar ||
          prevUser.role !== authUser.role ||
          prevUser.status !== authUser.status;
        
        if (!hasChanged) {
          return prevUser; // Return same reference to prevent re-renders
        }
        
        return authUser;
      });
      
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
      console.log('✅ User profile loaded:', authUser.name);

      // Register push token after successful user load (dynamic import to avoid Expo Go errors)
      (async () => {
        try {
          const Constants = await import('expo-constants');
          const isExpoGo = Constants.default.appOwnership === 'expo';
          if (isExpoGo) return; // Skip in Expo Go
          
          const { pushTokenService } = await import('../services/PushTokenService');
          await pushTokenService.register();
        } catch (error) {
          // Silently skip push token registration
        }
      })();
    } catch (error: any) {
      console.error('Failed to load user profile:', error);
      
      // Check if it's a user status error first
      if (handleUserStatusError(error)) {
        return; // Status modal will be shown
      }
      
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

  const handleUserStatusError = (error: any) => {
    if (error.code === 'ACCOUNT_SUSPENDED' || error.code === 'ACCOUNT_BLOCKED') {
      const statusData = error.data;
      setUserStatusModal({
        visible: true,
        status: statusData.status,
        reason: statusData.reason,
        suspensionDuration: statusData.suspensionDuration,
      });
      return true; // Indicates status error was handled
    }
    return false; // Not a status error
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
      
      // Register push token after successful login (dynamic import to avoid Expo Go errors)
      (async () => {
        try {
          const Constants = await import('expo-constants');
          const isExpoGo = Constants.default.appOwnership === 'expo';
          if (isExpoGo) return; // Skip in Expo Go
          
          const { pushTokenService } = await import('../services/PushTokenService');
          await pushTokenService.register();
        } catch (error) {
          // Silently skip push token registration
        }
      })();

      // Load full profile in background
      setTimeout(() => loadCurrentUser(), 100);
      
      // Call success callback if provided
      if (onSuccess) {
        setTimeout(onSuccess, 200);
      }
      
      return authResponse;
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      
      // Check if it's a user status error first
      if (handleUserStatusError(error)) {
        throw error; // Re-throw so caller knows about status issue
      }
      
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
      // Unregister push token before logout (dynamic import to avoid Expo Go errors)
      try {
        const Constants = await import('expo-constants');
        const isExpoGo = Constants.default.appOwnership === 'expo';
        if (!isExpoGo) {
          const { pushTokenService } = await import('../services/PushTokenService');
          await pushTokenService.unregister();
        }
      } catch (error) {
        // Silently skip push token unregistration
      }

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

      // Only update state if the data has actually changed
      setUser(prevUser => {
        if (!prevUser) return authUser;
        
        // Check if any relevant fields have changed
        const hasChanged = 
          prevUser.name !== authUser.name ||
          prevUser.phone !== authUser.phone ||
          prevUser.avatar !== authUser.avatar ||
          prevUser.email !== authUser.email ||
          prevUser.role !== authUser.role ||
          prevUser.status !== authUser.status;
        
        if (!hasChanged) {
          return prevUser; // Return same reference to prevent re-renders
        }
        
        return authUser;
      });
      
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const clearError = () => {
    setAuthError(null);
  };

  const closeUserStatusModal = () => {
    setUserStatusModal(prev => ({ ...prev, visible: false }));
  };

  const handleAppealSubmitted = () => {
    closeUserStatusModal();
    // Optionally show a success message or navigate somewhere
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
      <UserStatusModal
        visible={userStatusModal.visible}
        status={userStatusModal.status}
        reason={userStatusModal.reason}
        suspensionDuration={userStatusModal.suspensionDuration}
        onClose={closeUserStatusModal}
        onAppealSubmitted={handleAppealSubmitted}
      />
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