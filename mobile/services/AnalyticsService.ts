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
}

export const analyticsService = new AnalyticsService();
export default analyticsService;