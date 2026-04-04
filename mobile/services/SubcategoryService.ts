import { apiClient } from './api/apiClient';

export interface Subcategory {
  _id: string;
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  categoryName: string;
  icon?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubcategoryData {
  name: string;
  description?: string;
  categoryId: string;
  icon?: string;
  imageUrl?: string;
}

export interface UpdateSubcategoryData {
  name?: string;
  description?: string;
  categoryId?: string;
  icon?: string;
  imageUrl?: string;
  isActive?: boolean;
}

class SubcategoryService {
  // Get all subcategories
  async getSubcategories(categoryId?: string, categoryName?: string) {
    try {
      const params = new URLSearchParams();
      if (categoryId) params.append('categoryId', categoryId);
      if (categoryName) params.append('categoryName', categoryName);
      
      const queryString = params.toString();
      const url = queryString ? `/subcategories?${queryString}` : '/subcategories';
      
      const response = await apiClient.get(url);
      return {
        success: true,
        data: response.data.data as Subcategory[],
      };
    } catch (error: any) {
      console.error('Error fetching subcategories:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch subcategories',
      };
    }
  }

  // Get subcategories by category name
  async getSubcategoriesByCategory(categoryName: string) {
    try {
      const url = `/subcategories/category/${encodeURIComponent(categoryName)}`;
      const response = await apiClient.get(url);
      
      return {
        success: true,
        data: response.data as Subcategory[],
      };
    } catch (error: any) {
      console.error('Error fetching subcategories by category:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch subcategories',
      };
    }
  }

  // Get subcategory by ID
  async getSubcategoryById(id: string) {
    try {
      const response = await apiClient.get(`/subcategories/${id}`);
      return {
        success: true,
        data: response.data.data as Subcategory,
      };
    } catch (error: any) {
      console.error('Error fetching subcategory:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch subcategory',
      };
    }
  }

  // Create subcategory (admin only)
  async createSubcategory(data: CreateSubcategoryData) {
    try {
      const response = await apiClient.post('/subcategories', data);
      return {
        success: true,
        data: response.data.data as Subcategory,
      };
    } catch (error: any) {
      console.error('Error creating subcategory:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create subcategory',
      };
    }
  }

  // Update subcategory (admin only)
  async updateSubcategory(id: string, data: UpdateSubcategoryData) {
    try {
      const response = await apiClient.put(`/subcategories/${id}`, data);
      return {
        success: true,
        data: response.data.data as Subcategory,
      };
    } catch (error: any) {
      console.error('Error updating subcategory:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update subcategory',
      };
    }
  }

  // Delete subcategory (admin only)
  async deleteSubcategory(id: string) {
    try {
      await apiClient.delete(`/subcategories/${id}`);
      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Error deleting subcategory:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete subcategory',
      };
    }
  }
}

export const subcategoryService = new SubcategoryService();