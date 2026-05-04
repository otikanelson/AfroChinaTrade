export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  subcategory: string
  images: string[]
  status: 'active' | 'inactive' | 'draft'
  stock: number
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  productId: string
  quantity: number
  price: number
}

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: 'customer' | 'seller' | 'admin'
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  productCount: number
}

export interface Refund {
  id: string
  orderId: string
  amount: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  createdAt: string
}

export interface Review {
  id: string
  productId: string
  userId: string
  rating: number
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  recipientId: string
  content: string
  read: boolean
  createdAt: string
}

export interface Analytics {
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  totalProducts: number
  ordersTrend: Array<{ date: string; count: number }>
  revenueTrend: Array<{ date: string; amount: number }>
}
