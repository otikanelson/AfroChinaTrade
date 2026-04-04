import { apiClient as api, ApiResponse } from './api/apiClient';
import { Message, MessageThread, SendMessageRequest } from '../types/message';

class MessageService {
  async getThreads(page = 1, limit = 20, threadType?: string): Promise<ApiResponse<MessageThread[]>> {
    const params: any = { page, limit };
    if (threadType) {
      params.threadType = threadType;
    }
    
    const response = await api.get('/messages/threads', {
      params
    });
    return response;
  }

  async getThreadMessages(threadId: string, page = 1, limit = 50): Promise<ApiResponse<{
    thread: MessageThread;
    messages: Message[];
  }>> {
    const response = await api.get(`/messages/threads/${threadId}`, {
      params: { page, limit }
    });
    return response;
  }

  async sendMessage(request: SendMessageRequest): Promise<ApiResponse<Message>> {
    console.log('MessageService: Sending message', { 
      threadId: request.threadId, 
      textLength: request.text.length,
      hasProductInfo: !!(request.productId || request.productName),
      threadType: request.threadType
    });
    
    const response = await api.post('/messages', request);
    
    console.log('MessageService: Send message response', response);
    return response;
  }

  async createProductThread(productId: string, initialMessage: string, threadType: 'product_inquiry' | 'quote_request' = 'product_inquiry'): Promise<ApiResponse<{
    thread: MessageThread;
    isExisting: boolean;
  }>> {
    console.log('MessageService: Creating product thread', { productId, threadType });
    
    const response = await api.post('/messages/product-thread', {
      productId,
      initialMessage,
      threadType
    });
    
    console.log('MessageService: Product thread response', response);
    return response;
  }

  async markAsRead(messageId: string): Promise<ApiResponse<Message>> {
    const response = await api.patch(`/messages/${messageId}/read`, {});
    return response;
  }

  async getUnreadCount(): Promise<ApiResponse<{ unreadCount: number }>> {
    const response = await api.get('/messages/unread-count');
    return response;
  }

  async deleteThread(threadId: string): Promise<ApiResponse<{ threadId: string; messagesDeleted: number; threadDeleted: boolean }>> {
    console.log('MessageService: Deleting thread', { threadId });
    
    const response = await api.delete(`/messages/threads/${threadId}`);
    
    console.log('MessageService: Delete thread response', response);
    return response;
  }

  async clearHistory(): Promise<ApiResponse<{ message: string }>> {
    const response = await api.delete('/messages');
    return response;
  }
}

export const messageService = new MessageService();