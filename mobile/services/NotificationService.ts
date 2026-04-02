import apiClient, { ApiResponse } from './api/apiClient';

export interface Notification {
  id: string;
  type: 'refund_request' | 'order_update' | 'system' | 'general' | 'promotion' | 'price_drop' | 'new_product';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  newProducts: boolean;
  priceDrops: boolean;
  newsletter: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

class NotificationService {
  private readonly basePath = '/notifications';

  async getNotifications(params: { page?: number; limit?: number; unreadOnly?: boolean } = {}): Promise<ApiResponse<Notification[]>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.unreadOnly) queryParams.append('unreadOnly', 'true');
    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    return apiClient.get<Notification[]>(url);
  }

  async markAsRead(id: string): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(`${this.basePath}/${id}/read`, {});
  }

  async markAllAsRead(): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(`${this.basePath}/mark-all-read`, {});
  }

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.get<{ count: number }>(`${this.basePath}/unread-count`);
  }

  async getNotificationSettings(): Promise<ApiResponse<NotificationSettings>> {
    return apiClient.get<NotificationSettings>('/users/notification-settings');
  }

  async updateNotificationSettings(settings: NotificationSettings): Promise<ApiResponse<NotificationSettings>> {
    return apiClient.put<NotificationSettings>('/users/notification-settings', settings);
  }

  async registerPushToken(token: string, deviceId: string, platform: 'ios' | 'android'): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/push-tokens', { token, deviceId, platform });
  }

  async removePushToken(token: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>('/push-tokens', { data: { token } });
  }
}

export const notificationService = new NotificationService();
export default notificationService;