import { apiClient as api } from './api/apiClient';
// import { ApiResponse } from '../types/api'; // File not found

// Define ApiResponse locally
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
import { Message, MessageThread, SendMessageRequest } from '../types/message';

class MessageService {
  async getThreads(page = 1, limit = 20): Promise<ApiResponse<MessageThread[]>> {
    try {
      const response = await api.get('/messages/threads', {
        params: { page, limit }
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching threads:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error.response?.data?.error?.message || 'Failed to fetch threads'
        }
      };
    }
  }

  async getThreadMessages(threadId: string, page = 1, limit = 50): Promise<ApiResponse<{
    thread: MessageThread;
    messages: Message[];
  }>> {
    try {
      const response = await api.get(`/messages/threads/${threadId}`, {
        params: { page, limit }
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching thread messages:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error.response?.data?.error?.message || 'Failed to fetch messages'
        }
      };
    }
  }

  async sendMessage(request: SendMessageRequest): Promise<ApiResponse<Message>> {
    try {
      console.log('MessageService: Sending message', { threadId: request.threadId, textLength: request.text.length });
      
      const response = await api.post('/messages', request);
      
      console.log('MessageService: Send message response', response);
      return response;
    } catch (error: any) {
      console.error('MessageService: Error sending message:', error);
      return {
        success: false,
        error: {
          code: 'SEND_ERROR',
          message: error.response?.data?.error?.message || error.message || 'Failed to send message'
        }
      };
    }
  }

  async createProductThread(productId: string, initialMessage: string, threadType: 'product_inquiry' | 'quote_request' = 'product_inquiry'): Promise<ApiResponse<{
    thread: MessageThread;
    isExisting: boolean;
  }>> {
    try {
      console.log('MessageService: Creating product thread', { productId, threadType });
      
      const response = await api.post('/messages/product-thread', {
        productId,
        initialMessage,
        threadType
      });
      
      console.log('MessageService: Product thread response', response);
      return response;
    } catch (error: any) {
      console.error('MessageService: Error creating product thread:', error);
      return {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error.response?.data?.error?.message || error.message || 'Failed to create thread'
        }
      };
    }
  }

  async markAsRead(messageId: string): Promise<ApiResponse<Message>> {
    try {
      const response = await api.patch(`/messages/${messageId}/read`);
      return response;
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error.response?.data?.error?.message || 'Failed to mark as read'
        }
      };
    }
  }

  async getUnreadCount(): Promise<ApiResponse<{ unreadCount: number }>> {
    try {
      const response = await api.get('/messages/unread-count');
      return response;
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error.response?.data?.error?.message || 'Failed to fetch unread count'
        }
      };
    }
  }

  async clearHistory(): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.delete('/messages');
      return response;
    } catch (error: any) {
      console.error('Error clearing message history:', error);
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error.response?.data?.error?.message || 'Failed to clear message history'
        }
      };
    }
  }
}

export const messageService = new MessageService();