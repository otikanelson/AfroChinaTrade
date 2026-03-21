import apiClient, { ApiResponse } from './api/apiClient';
import { Order, OrderStatus, Address, CartItem } from '../types/product';

export interface OrderFilters {
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  customerId?: string;
}

export interface OrderListParams extends OrderFilters {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'total' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateOrderData {
  items: Array<{
    productId: string;
    quantity: number;
    price?: number; // Optional, will be fetched from product if not provided
  }>;
  deliveryAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  notes?: string;
}

export interface UpdateOrderStatusData {
  status: OrderStatus;
  notes?: string;
}

export interface UpdateTrackingData {
  trackingNumber: string;
  carrier?: string;
  notes?: string;
}

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

class OrderService {
  private readonly basePath = '/orders';

  /**
   * Get paginated list of orders with filtering
   * Customers see only their orders, admins see all orders
   */
  async getOrders(params: OrderListParams = {}): Promise<ApiResponse<Order[]>> {
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    // Add filters
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.customerId) queryParams.append('customerId', params.customerId);
    
    // Add sorting
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    
    return apiClient.get<Order[]>(url);
  }

  /**
   * Get a single order by ID
   */
  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    return apiClient.get<Order>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new order
   */
  async createOrder(orderData: CreateOrderData): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(this.basePath, orderData);
  }

  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(id: string, statusData: UpdateOrderStatusData): Promise<ApiResponse<Order>> {
    return apiClient.patch<Order>(`${this.basePath}/${id}/status`, statusData);
  }

  /**
   * Update tracking number (admin only)
   */
  async updateTrackingNumber(id: string, trackingData: UpdateTrackingData): Promise<ApiResponse<Order>> {
    return apiClient.patch<Order>(`${this.basePath}/${id}/tracking`, trackingData);
  }

  /**
   * Cancel an order
   */
  async cancelOrder(id: string, reason?: string): Promise<ApiResponse<Order>> {
    return apiClient.delete<Order>(`${this.basePath}/${id}`, {
      data: { reason }
    });
  }

  /**
   * Calculate order summary before placing order
   */
  async calculateOrderSummary(items: CreateOrderData['items'], deliveryAddress: Address): Promise<ApiResponse<OrderSummary>> {
    return apiClient.post<OrderSummary>(`${this.basePath}/calculate`, {
      items,
      deliveryAddress
    });
  }

  /**
   * Get order history for current user
   */
  async getOrderHistory(params: OrderListParams = {}): Promise<ApiResponse<Order[]>> {
    return this.getOrders(params);
  }

  /**
   * Get order statistics (admin only)
   */
  async getOrderStatistics(params: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  } = {}): Promise<ApiResponse<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<OrderStatus, number>;
    revenueByPeriod?: Array<{
      period: string;
      revenue: number;
      orders: number;
    }>;
  }>> {
    const queryParams = new URLSearchParams();
    
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.groupBy) queryParams.append('groupBy', params.groupBy);

    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}/statistics?${queryString}` : `${this.basePath}/statistics`;
    
    return apiClient.get(url);
  }

  /**
   * Search orders (admin only)
   */
  async searchOrders(params: {
    query?: string;
    orderNumber?: string;
    customerName?: string;
    customerEmail?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Order[]>> {
    const queryParams = new URLSearchParams();
    
    if (params.query) queryParams.append('q', params.query);
    if (params.orderNumber) queryParams.append('orderNumber', params.orderNumber);
    if (params.customerName) queryParams.append('customerName', params.customerName);
    if (params.customerEmail) queryParams.append('customerEmail', params.customerEmail);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `/search/orders?${queryString}` : '/search/orders';
    
    return apiClient.get<Order[]>(url);
  }

  /**
   * Get order tracking information
   */
  async getOrderTracking(id: string): Promise<ApiResponse<{
    trackingNumber?: string;
    carrier?: string;
    status: OrderStatus;
    timeline: Array<{
      status: OrderStatus;
      timestamp: string;
      notes?: string;
    }>;
    estimatedDelivery?: string;
  }>> {
    return apiClient.get(`${this.basePath}/${id}/tracking`);
  }

  /**
   * Request order refund
   */
  async requestRefund(orderId: string, data: {
    reason: string;
    items?: Array<{
      productId: string;
      quantity: number;
      reason?: string;
    }>;
    refundAmount?: number;
  }): Promise<ApiResponse<{
    refundId: string;
    status: string;
    estimatedProcessingTime: string;
  }>> {
    return apiClient.post(`${this.basePath}/${orderId}/refund`, data);
  }

  /**
   * Reorder items from a previous order
   */
  async reorder(orderId: string, deliveryAddress?: Address): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(`${this.basePath}/${orderId}/reorder`, {
      deliveryAddress
    });
  }

  /**
   * Get recommended products based on order history
   */
  async getRecommendedProducts(limit = 10): Promise<ApiResponse<any[]>> {
    return apiClient.get(`${this.basePath}/recommendations?limit=${limit}`);
  }

  /**
   * Validate order items before checkout
   */
  async validateOrderItems(items: CreateOrderData['items']): Promise<ApiResponse<{
    valid: boolean;
    issues?: Array<{
      productId: string;
      issue: 'out_of_stock' | 'price_changed' | 'unavailable';
      currentStock?: number;
      currentPrice?: number;
    }>;
  }>> {
    return apiClient.post(`${this.basePath}/validate`, { items });
  }

  /**
   * Apply coupon or discount code
   */
  async applyCoupon(couponCode: string, items: CreateOrderData['items']): Promise<ApiResponse<{
    valid: boolean;
    discount: number;
    discountType: 'percentage' | 'fixed';
    message: string;
  }>> {
    return apiClient.post(`${this.basePath}/apply-coupon`, {
      couponCode,
      items
    });
  }
}

// Export singleton instance
export const orderService = new OrderService();
export default orderService;