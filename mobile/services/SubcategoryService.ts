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
        data: response.data as Subcategory[],
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
      const encodedCategoryName = encodeURIComponent(categoryName);
      const url = `/subcategories/category/${encodedCategoryName}`;
      
      console.log('🌐 Making subcategory API request:', {
        categoryName,
        encodedCategoryName,
        url,
        baseURL: 'Will be resolved by apiClient'
      });
      
      const response = await apiClient.get(url);
      
      console.log('📡 Subcategory API response:', {
        success: response.success,
        dataType: typeof response.data,
        dataLength: Array.isArray(response.data) ? response.data.length : 'not array',
        hasError: !!response.error
      });
      
      return {
        success: true,
        data: response.data as Subcategory[],
      };
    } catch (error: any) {
      console.error('❌ Error fetching subcategories by category:', {
        categoryName,
        error: error.message || error,
        code: error.code,
        status: error.status,
        details: error.details
      });
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch subcategories',
      };
    }
  }

  // Diagnostic function to test subcategory endpoint
  async testSubcategoryEndpoint(categoryName: string) {
    try {
      const encodedCategoryName = encodeURIComponent(categoryName);
      const url = `/subcategories/category/${encodedCategoryName}`;
      
      console.log('🧪 Testing subcategory endpoint:', {
        categoryName,
        encodedCategoryName,
        url
      });
      
      // Test the endpoint directly
      const result = await apiClient.testEndpoint(url);
      
      console.log('🧪 Endpoint test result:', result);
      
      return result;
    } catch (error: any) {
      console.error('🧪 Endpoint test failed:', error);
      return {
        success: false,
        error: error.message || 'Endpoint test failed'
      };
    }
  }

  // Get subcategory by ID
  async getSubcategoryById(id: string) {
    try {
      const response = await apiClient.get(`/subcategories/${id}`);
      return {
        success: true,
        data: response.data as Subcategory,
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
        data: response.data as Subcategory,
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
        data: response.data as Subcategory,
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