import apiClient, { ApiResponse } from './api/apiClient';
import { Category } from '../types/product';

export interface CreateCategoryData {
  name: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  subcategories?: string[];
  isActive?: boolean;
}

class CategoryService {
  private readonly basePath = '/categories';

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return apiClient.get<Category[]>(this.basePath);
  }

  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    return apiClient.get<Category>(`${this.basePath}/${id}`);
  }

  async createCategory(categoryData: CreateCategoryData): Promise<ApiResponse<Category>> {
    return apiClient.post<Category>(this.basePath, categoryData);
  }

  async updateCategory(id: string, categoryData: Partial<CreateCategoryData>): Promise<ApiResponse<Category>> {
    return apiClient.put<Category>(`${this.basePath}/${id}`, categoryData);
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  async getCategoryProducts(id: string, params: { page?: number; limit?: number } = {}): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}/${id}/products?${queryString}` : `${this.basePath}/${id}/products`;
    return apiClient.get(url);
  }
}

export const categoryService = new CategoryService();
export default categoryService;