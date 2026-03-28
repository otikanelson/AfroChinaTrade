import { API_BASE_URL } from '../constants/config';
import { tokenManager } from './api/tokenManager';

export interface CollectionFilter {
  type: 'category' | 'name_contains' | 'tag' | 'price_range' | 'rating_min' | 'discount_min' | 'supplier';
  value: string | number | { min?: number; max?: number };
  operator?: 'equals' | 'contains' | 'gte' | 'lte' | 'in';
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  filters: CollectionFilter[];
  isActive: boolean;
  displayOrder: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
}

export interface CollectionProduct {
  collection: Collection;
  products: any[];
  productCount: number;
}

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  status: 'success' | 'error';
  data: {
    collection?: CollectionProduct;
    products?: T[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message?: string;
}

class CollectionService {
  private baseUrl = `${API_BASE_URL}/collections`;

  /**
   * Get all active collections
   */
  async getActiveCollections(): Promise<{ success: boolean; data?: Collection[]; error?: string }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ collections: Collection[] }> = await response.json();
      
      if (result.status === 'success') {
        return {
          success: true,
          data: result.data.collections || []
        };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to fetch collections'
        };
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get products for a specific collection
   */
  async getCollectionProducts(
    collectionId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ success: boolean; data?: CollectionProduct; error?: string }> {
    try {
      const url = `${this.baseUrl}/${collectionId}/products?page=${page}&limit=${limit}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PaginatedResponse<any> = await response.json();
      
      if (result.status === 'success' && result.data.collection) {
        return {
          success: true,
          data: result.data.collection
        };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to fetch collection products'
        };
      }
    } catch (error) {
      console.error('Error fetching collection products:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Create a new collection (Admin only)
   */
  async createCollection(
    name: string,
    filters: CollectionFilter[],
    description?: string,
    displayOrder?: number
  ): Promise<{ success: boolean; data?: Collection; error?: string }> {
    try {
      const token = await tokenManager.getAccessToken();
      if (!token) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          filters,
          displayOrder
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ collection: Collection }> = await response.json();
      
      if (result.status === 'success') {
        return {
          success: true,
          data: result.data.collection
        };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to create collection'
        };
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Update a collection (Admin only)
   */
  async updateCollection(
    collectionId: string,
    updates: Partial<Collection>
  ): Promise<{ success: boolean; data?: Collection; error?: string }> {
    try {
      const token = await tokenManager.getAccessToken();
      if (!token) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      const response = await fetch(`${this.baseUrl}/${collectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ collection: Collection }> = await response.json();
      
      if (result.status === 'success') {
        return {
          success: true,
          data: result.data.collection
        };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to update collection'
        };
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Delete a collection (Admin only)
   */
  async deleteCollection(collectionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const token = await tokenManager.getAccessToken();
      if (!token) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      const response = await fetch(`${this.baseUrl}/${collectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{}> = await response.json();
      
      if (result.status === 'success') {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to delete collection'
        };
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Toggle collection status (Admin only)
   */
  async toggleCollectionStatus(collectionId: string): Promise<{ success: boolean; data?: Collection; error?: string }> {
    try {
      const token = await tokenManager.getAccessToken();
      if (!token) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      const response = await fetch(`${this.baseUrl}/${collectionId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ collection: Collection }> = await response.json();
      
      if (result.status === 'success') {
        return {
          success: true,
          data: result.data.collection
        };
      } else {
        return {
          success: false,
          error: result.message || 'Failed to toggle collection status'
        };
      }
    } catch (error) {
      console.error('Error toggling collection status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const collectionService = new CollectionService();