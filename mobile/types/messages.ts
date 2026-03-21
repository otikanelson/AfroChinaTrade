/**
 * Shared types and constants for the messaging feature
 */

export interface Message {
  id: string;
  threadId: string;
  senderId: string; // 'admin' or customer userId
  senderName: string;
  text: string;
  createdAt: string;
  isRead: boolean;
}

export interface MessageThread {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: 'active' | 'closed';
  messages: Message[];
}

export const MESSAGE_THREADS_KEY = 'message_threads';
