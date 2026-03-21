import apiClient, { ApiResponse } from './api/apiClient';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'super_admin';
  status: 'active' | 'suspended' | 'blocked';
  addresses: Address[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateAddressData {
  addresses: Address[];
}

export interface DeleteAccountData {
  password: string;
}

class UserService {
  private readonly basePath = '/users';

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>(`${this.basePath}/profile`);
  }

  /**
   * Get users (admin only)
   */
  async getUsers(params: {
    page?: number;
    limit?: number;
    status?: string;
    role?: string;
    registrationDateFrom?: string;
    registrationDateTo?: string;
    minSpending?: number;
    maxSpending?: number;
  } = {}): Promise<ApiResponse<{ users: UserProfile[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.role) queryParams.append('role', params.role);
    if (params.registrationDateFrom) queryParams.append('registrationDateFrom', params.registrationDateFrom);
    if (params.registrationDateTo) queryParams.append('registrationDateTo', params.registrationDateTo);
    if (params.minSpending) queryParams.append('minSpending', params.minSpending.toString());
    if (params.maxSpending) queryParams.append('maxSpending', params.maxSpending.toString());
    
    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    
    return apiClient.get<{ users: UserProfile[]; pagination: any }>(url);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<UserProfile>> {
    return apiClient.put<UserProfile>(`${this.basePath}/profile`, data);
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`${this.basePath}/profile/password`, data);
  }

  /**
   * Update addresses
   */
  async updateAddresses(data: UpdateAddressData): Promise<ApiResponse<UserProfile>> {
    return apiClient.put<UserProfile>(`${this.basePath}/profile/addresses`, data);
  }

  /**
   * Delete account
   */
  async deleteAccount(data: DeleteAccountData): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/profile`, data);
  }

  /**
   * Upload avatar image
   */
  async uploadAvatar(imageFile: {
    uri: string;
    type: string;
    name: string;
  }): Promise<ApiResponse<{ imageUrl: string }>> {
    return apiClient.uploadFile('/upload/image', imageFile, { type: 'avatar' });
  }

  /**
   * Get user by ID (admin only)
   */
  async getUserById(userId: string): Promise<ApiResponse<UserProfile>> {
    return apiClient.get<UserProfile>(`${this.basePath}/${userId}`);
  }

  /**
   * Update user status (admin only)
   */
  async updateUserStatus(userId: string, data: {
    status: 'active' | 'suspended' | 'blocked';
    reason?: string;
    suspensionDuration?: string;
  }): Promise<ApiResponse<UserProfile>> {
    return apiClient.patch<UserProfile>(`${this.basePath}/${userId}/status`, data);
  }

  /**
   * Get user orders (admin only)
   */
  async getUserOrders(userId: string, params: {
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<{ orders: any[]; pagination: any }>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}/${userId}/orders?${queryString}` : `${this.basePath}/${userId}/orders`;
    
    return apiClient.get<{ orders: any[]; pagination: any }>(url);
  }

  /**
   * Get user activity (admin only)
   */
  async getUserActivity(userId: string): Promise<ApiResponse<{
    user: UserProfile;
    activity: {
      orderCount: number;
      totalSpent: number;
      joinedAt: string;
      lastActive: string;
      auditLogs: any[];
    };
  }>> {
    return apiClient.get<any>(`${this.basePath}/${userId}/activity`);
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;