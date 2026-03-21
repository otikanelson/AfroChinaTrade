import apiClient, { ApiResponse } from './api/apiClient';

export interface Refund {
  id: string;
  orderId: string;
  type: 'full' | 'partial';
  amount: number;
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: string;
  processedAt?: string;
}

export interface CreateRefundData {
  orderId: string;
  type: 'full' | 'partial';
  amount: number;
  reason: string;
}

class RefundService {
  private readonly basePath = '/refunds';

  async getRefunds(params: { page?: number; limit?: number } = {}): Promise<ApiResponse<Refund[]>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
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

  async updateRefundStatus(id: string, status: Refund['status']): Promise<ApiResponse<Refund>> {
    return apiClient.patch<Refund>(`${this.basePath}/${id}/status`, { status });
  }
}

export const refundService = new RefundService();
export default refundService;