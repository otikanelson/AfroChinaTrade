import apiClient, { ApiResponse } from './api/apiClient';
import { tokenManager } from './api/tokenManager';
import { AuthUser, LoginCredentials, RegisterData, AuthResponse } from '../types/auth';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'super_admin';
  status: 'active' | 'suspended' | 'blocked';
  addresses?: any[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

class SimpleAuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<any>('/auth/login', credentials);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Login failed');
    }

    const responseData = response.data.data || response.data;
    const { token, refreshToken } = responseData;
    const user = responseData.user || responseData; // Handle both nested and flat user data
    
    // Save tokens
    await tokenManager.setTokens(token, refreshToken);
    
    return {
      userId: user._id || user.id || responseData.userId,
      name: user.name || responseData.name,
      email: user.email || responseData.email,
      role: user.role || responseData.role,
      token,
      refreshToken
    };
  }

  /**
   * Register user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<any>('/auth/register', data);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Registration failed');
    }

    const responseData = response.data.data || response.data;
    const { token, refreshToken } = responseData;
    const user = responseData.user || responseData; // Handle both nested and flat user data
    
    // Save tokens
    await tokenManager.setTokens(token, refreshToken);
    
    return {
      userId: user._id || user.id || responseData.userId,
      name: user.name || responseData.name,
      email: user.email || responseData.email,
      role: user.role || responseData.role,
      token,
      refreshToken
    };
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/users/profile');
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to get user profile');
    }

    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: {
    name?: string;
    phone?: string;
    avatar?: string;
  }): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/users/profile', data);
    
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to update profile');
    }

    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Try to call logout endpoint (optional)
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignore logout endpoint errors
      console.warn('Logout endpoint failed, but continuing with local logout');
    } finally {
      // Always clear local tokens
      await tokenManager.clearTokens();
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenManager.isAuthenticated();
  }

  /**
   * Test connection to backend
   */
  async testConnection(): Promise<any> {
    return apiClient.testConnection();
  }
}

export const authService = new SimpleAuthService();
export default authService;