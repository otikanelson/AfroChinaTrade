import apiClient from './api/apiClient';

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
  /**
   * Get all active collections
   */
  async getActiveCollections(): Promise<{ success: boolean; data?: Collection[]; error?: string }> {
    try {
      const response = await apiClient.get<{ collections: Collection[] }>('/collections');

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.collections || []
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to fetch collections'
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
   * Get all collections (both active and inactive) - Admin only
   */
  async getAllCollections(): Promise<{ success: boolean; data?: Collection[]; error?: string }> {
    try {
      const response = await apiClient.get<{ collections: Collection[] }>('/collections/admin/all');

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.collections || []
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to fetch collections'
        };
      }
    } catch (error) {
      console.error('Error fetching all collections:', error);
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
      const response = await apiClient.get<CollectionProduct>(
        `/collections/${collectionId}/products?page=${page}&limit=${limit}`
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to fetch collection products'
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
      const response = await apiClient.post<{ collection: Collection }>('/collections', {
        name,
        description,
        filters,
        displayOrder
      });

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.collection
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to create collection'
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
      const response = await apiClient.put<{ collection: Collection }>(
        `/collections/${collectionId}`,
        updates
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.collection
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to update collection'
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
      const response = await apiClient.delete(`/collections/${collectionId}`);

      if (response.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to delete collection'
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
      const response = await apiClient.patch<{ collection: Collection }>(
        `/collections/${collectionId}/status`
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.collection
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Failed to toggle collection status'
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