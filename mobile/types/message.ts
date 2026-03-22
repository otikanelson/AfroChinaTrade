export interface Message {
  _id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'admin';
  text: string;
  productImage?: string;
  productName?: string;
  isRead: boolean;
  createdAt: string;
}

export interface MessageThread {
  _id: string;
  threadId: string;
  customerId: string;
  customerName: string;
  productId?: string;
  productName?: string;
  productImage?: string;
  threadType: 'general' | 'product_inquiry' | 'quote_request';
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  threadId: string;
  text: string;
  recipientId?: string;
  productId?: string;
  productImage?: string;
  productName?: string;
  threadType?: 'general' | 'product_inquiry' | 'quote_request';
}