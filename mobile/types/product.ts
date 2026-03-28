export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency?: string;
  images: string[];
  category: string;
  subcategory?: string;
  rating: number;
  reviewCount: number;
  stock: number;
  supplier?: Supplier;
  supplierId?: Supplier | string; // Handle both populated and non-populated cases
  tags?: string[];
  specifications?: Record<string, string>;
  discount?: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  imageHeight?: number;
  // New discovery fields
  viewCount?: number;
  isSellerFavorite?: boolean;
  trendingScore?: number;
  lastViewedAt?: string;
}

export interface CollectionFilter {
  type: 'category' | 'name_contains' | 'tag' | 'price_range' | 'rating_min' | 'discount_min' | 'supplier';
  value: string | number | { min?: number; max?: number };
  operator?: 'equals' | 'contains' | 'gte' | 'lte' | 'in';
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  filters: CollectionFilter[];
  isActive: boolean;
  displayOrder: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
}

export interface Supplier {
  id?: string;
  _id?: string; // MongoDB ObjectId
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  location: string;
  logo?: string; // URL to supplier logo image
  description?: string;
  website?: string;
  verified: boolean;
  rating: number;
  reviewCount?: number;
  responseTime?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories?: string[];
}

export interface CartItem {
  product: Product;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderId: string;
  userId: string | {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  address: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  postalCode: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  addresses: Address[];
  status: 'active' | 'suspended' | 'blocked';
  createdAt: string;
}

export interface Refund {
  id: string;
  orderId: string;
  type: 'full' | 'partial';
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  processedBy?: {
    id: string;
    name: string;
    email: string;
  };
  processedAt?: string;
  adminNotes?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  type: 'product' | 'user' | 'review' | 'other';
  reportedEntityId: string;
  reportedContent: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  description?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  isRead: boolean;
}

export interface MessageThread {
  id: string;
  customerId: string;
  customerName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: Message[];
}

export type TicketPriority = Ticket['priority'];
export type TicketStatus = Ticket['status'];