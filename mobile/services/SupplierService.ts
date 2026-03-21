import apiClient, { ApiResponse } from './api/apiClient';
import { Supplier } from '../types/product';

export interface CreateSupplierData {
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  verified?: boolean;
  isActive?: boolean;
}

class SupplierService {
  private readonly basePath = '/suppliers';

  async getSuppliers(params: { page?: number; limit?: number } = {}): Promise<ApiResponse<Supplier[]>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
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
}

export const supplierService = new SupplierService();
export default supplierService;