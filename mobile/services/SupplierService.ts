import apiClient, { ApiResponse } from './api/apiClient';
import { Supplier } from '../types/product';

export interface CreateSupplierData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  location?: string;
  logo?: string;
  description?: string;
  website?: string;
  responseTime?: string;
  verified?: boolean;
}

export interface SupplierReview {
  _id: string;
  supplierId: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierReviewData {
  rating: number;
  comment?: string;
}

class SupplierService {
  private readonly basePath = '/suppliers';

  async getSuppliers(params: { page?: number; limit?: number; verified?: boolean } = {}): Promise<ApiResponse<Supplier[]>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.verified !== undefined) queryParams.append('verified', params.verified.toString());
    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    return apiClient.get<Supplier[]>(url);
  }

  async getSupplierById(id: string): Promise<ApiResponse<Supplier>> {
    return apiClient.get<Supplier>(`${this.basePath}/${id}`);
  }

  async createSupplier(supplierData: CreateSupplierData): Promise<ApiResponse<Supplier>> {
    return apiClient.post<Supplier>(this.basePath, supplierData);
  }

  async updateSupplier(id: string, supplierData: Partial<CreateSupplierData>): Promise<ApiResponse<Supplier>> {
    return apiClient.put<Supplier>(`${this.basePath}/${id}`, supplierData);
  }

  async deleteSupplier(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  // Supplier Reviews
  async createSupplierReview(supplierId: string, reviewData: CreateSupplierReviewData): Promise<ApiResponse<SupplierReview>> {
    return apiClient.post<SupplierReview>(`${this.basePath}/${supplierId}/reviews`, reviewData);
  }

  async getSupplierReviews(supplierId: string, params: { page?: number; limit?: number } = {}): Promise<ApiResponse<SupplierReview[]>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}/${supplierId}/reviews?${queryString}` : `${this.basePath}/${supplierId}/reviews`;
    return apiClient.get<SupplierReview[]>(url);
  }

  async updateSupplierReview(supplierId: string, reviewId: string, reviewData: CreateSupplierReviewData): Promise<ApiResponse<SupplierReview>> {
    return apiClient.put<SupplierReview>(`${this.basePath}/${supplierId}/reviews/${reviewId}`, reviewData);
  }
}

export const supplierService = new SupplierService();
export default supplierService;