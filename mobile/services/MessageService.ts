import apiClient, { ApiResponse } from './api/apiClient';
import { MessageThread } from '../types/messages';

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'admin';
  text: string;
  isRead: boolean;
  createdAt: string;
}

export interface CreateMessageData {
  threadId: string;
  text: string;
}

class MessageService {
  private readonly basePath = '/messages';

  /**
   * Get user's message threads
   */
  async getThreads(params: {
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<MessageThread[]>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}/threads?${queryString}` : `${this.basePath}/threads`;
    
    return apiClient.get<MessageThread[]>(url);
  }

  /**
   * Get messages in a specific thread
   */
  async getThreadMessages(threadId: string, params: {
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<Message[]>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString ? 
      `${this.basePath}/threads/${threadId}?${queryString}` : 
      `${this.basePath}/threads/${threadId}`;
    
    return apiClient.get<Message[]>(url);
  }

  /**
   * Send a message
   */
  async sendMessage(messageData: CreateMessageData): Promise<ApiResponse<Message>> {
    return apiClient.post<Message>(this.basePath, messageData);
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(`${this.basePath}/${messageId}/read`);
  }

  /**
   * Mark all messages in thread as read
   */
  async markThreadAsRead(threadId: string): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(`${this.basePath}/threads/${threadId}/read`);
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.get<{ count: number }>(`${this.basePath}/unread-count`);
  }

  /**
   * Create a new message thread (typically done automatically when sending first message)
   */
  async createThread(data: {
    subject?: string;
    initialMessage: string;
    recipientId?: string;
  }): Promise<ApiResponse<MessageThread>> {
    return apiClient.post<MessageThread>(`${this.basePath}/threads`, data);
  }

  /**
   * Delete a message (soft delete)
   */
  async deleteMessage(messageId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${messageId}`);
  }
}

// Export singleton instance
export const messageService = new MessageService();
export default messageService;