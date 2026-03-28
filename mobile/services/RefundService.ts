import apiClient, { ApiResponse } from './api/apiClient';

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

export interface CreateRefundData {
  orderId: string;
  type: 'full' | 'partial';
  amount: number;
  reason: string;
}

export interface RefundStats {
  total: {
    totalRefunds: number;
    totalAmount: number;
    avgAmount: number;
  };
  byStatus: Record<string, {
    count: number;
    totalAmount: number;
  }>;
}

class RefundService {
  private readonly basePath = '/refunds';

  async getRefunds(params: { page?: number; limit?: number; status?: string } = {}): Promise<ApiResponse<Refund[]>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    return apiClient.get<Refund[]>(url);
  }

  async getRefundById(id: string): Promise<ApiResponse<Refund>> {
    return apiClient.get<Refund>(`${this.basePath}/${id}`);
  }

  async createRefund(refundData: CreateRefundData): Promise<ApiResponse<Refund>> {
    return apiClient.post<Refund>(this.basePath, refundData);
  }

  async updateRefundStatus(id: string, status: Refund['status'], adminNotes?: string): Promise<ApiResponse<Refund>> {
    return apiClient.patch<Refund>(`${this.basePath}/${id}/status`, { status, adminNotes });
  }

  // Customer endpoints
  async getUserRefunds(params: { page?: number; limit?: number; status?: string } = {}): Promise<ApiResponse<Refund[]>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}/user/my-refunds?${queryString}` : `${this.basePath}/user/my-refunds`;
    return apiClient.get<Refund[]>(url);
  }

  async createRefundRequest(refundData: CreateRefundData): Promise<ApiResponse<Refund>> {
    return apiClient.post<Refund>(`${this.basePath}/request`, refundData);
  }

  // Admin endpoints
  async getRefundStats(period: 'today' | 'week' | 'month' | 'all' = 'month'): Promise<ApiResponse<RefundStats>> {
    return apiClient.get<RefundStats>(`${this.basePath}/stats?period=${period}`);
  }
}

export const refundService = new RefundService();
export default refundService;