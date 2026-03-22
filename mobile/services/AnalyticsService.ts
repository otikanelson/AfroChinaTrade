import apiClient, { ApiResponse } from './api/apiClient';

export interface RevenueStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueByPeriod: Array<{
    period: string;
    revenue: number;
    orders: number;
  }>;
}

export interface OrderStats {
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  ordersByPeriod: Array<{
    period: string;
    orders: number;
  }>;
}

export interface ViewTrackingRequest {
  userId?: string;
  sessionId?: string;
  metadata?: {
    viewDuration?: number;
    scrollDepth?: number;
    imageViews?: number;
    source?: string;
    timestamp?: string;
  };
}

export interface ViewTrackingResponse {
  status: 'success' | 'error';
  data: {
    productId: string;
    newViewCount: number;
    tracked: boolean;
  };
}

export interface ProductCardInteractionRequest {
  interactionType: 'tap' | 'view' | 'add_to_cart' | 'add_to_wishlist';
  metadata?: {
    viewDuration?: number;
    scrollDepth?: number;
    imageViews?: number;
    source?: string;
    timestamp?: string;
  };
}

class AnalyticsService {
  private readonly basePath = '/analytics';

  async getRevenue(params: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  } = {}): Promise<ApiResponse<RevenueStats>> {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.groupBy) queryParams.append('groupBy', params.groupBy);
    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}/revenue?${queryString}` : `${this.basePath}/revenue`;
    return apiClient.get<RevenueStats>(url);
  }

  async getOrderStats(params: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  } = {}): Promise<ApiResponse<OrderStats>> {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.groupBy) queryParams.append('groupBy', params.groupBy);
    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}/orders?${queryString}` : `${this.basePath}/orders`;
    return apiClient.get<OrderStats>(url);
  }

  async getProductStats(): Promise<ApiResponse<any>> {
    return apiClient.get(`${this.basePath}/products`);
  }

  /**
   * Track a product view with optional metadata
   * @param productId - The ID of the product being viewed
   * @param userId - Optional user ID for authenticated users
   * @param metadata - Optional metadata about the view (duration, source, etc.)
   */
  async trackProductView(
    productId: string, 
    userId?: string, 
    metadata?: ViewTrackingRequest['metadata']
  ): Promise<ApiResponse<ViewTrackingResponse>> {
    const requestBody: ViewTrackingRequest = {
      userId,
      metadata
    };

    return apiClient.post<ViewTrackingResponse>(`/products/${productId}/view`, requestBody);
  }

  /**
   * Track product card interactions (tap, add to cart, etc.)
   * @param productId - The ID of the product
   * @param interactionType - Type of interaction
   * @param metadata - Optional metadata about the interaction
   */
  async trackProductCardInteraction(
    productId: string,
    interactionType: ProductCardInteractionRequest['interactionType'],
    metadata?: ProductCardInteractionRequest['metadata']
  ): Promise<ApiResponse<any>> {
    const requestBody: ProductCardInteractionRequest = {
      interactionType,
      metadata
    };

    return apiClient.post(`/products/${productId}/interaction`, requestBody);
  }

  /**
   * Get view analytics for a specific product (admin only)
   * @param productId - The ID of the product
   */
  async getProductAnalytics(productId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/products/${productId}/analytics`);
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;