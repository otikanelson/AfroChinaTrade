import apiClient, { ApiResponse } from './api/apiClient';
import { Product } from '../types/product';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RecommendationOptions {
  limit?: number;
  excludeCart?: boolean;
  includeReasons?: boolean;
  categories?: string[];
}

export interface RecommendationResult {
  productId: string;
  product: Product;
  score: number;
  reason?: string;
  algorithm: 'collaborative' | 'content-based' | 'popularity';
  confidence: number;
}

export interface RecommendationResponse {
  status: 'success' | 'error';
  data: {
    recommendations: RecommendationResult[];
    metadata: {
      userId: string;
      generatedAt: string;
      cached: boolean;
      totalCount: number;
    };
  };
}

class RecommendationService {
  private readonly basePath = '/products/recommendations';
  private readonly cachePrefix = 'recommendations_';
  private readonly cacheExpiry = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

  /**
   * Get personalized recommendations for a user
   */
  async getUserRecommendations(
    userId: string,
    options: RecommendationOptions = {}
  ): Promise<ApiResponse<RecommendationResult[]>> {
    const {
      limit = 20,
      excludeCart = true,
      includeReasons = false,
      categories = []
    } = options;

    // Check cache first
    const cachedRecommendations = await this.getCachedRecommendations(userId);
    if (cachedRecommendations && cachedRecommendations.length >= limit) {
      return {
        success: true,
        data: cachedRecommendations.slice(0, limit)
      };
    }

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('limit', limit.toString());
      if (excludeCart) queryParams.append('excludeCart', 'true');
      if (includeReasons) queryParams.append('includeReasons', 'true');
      
      categories.forEach(category => {
        queryParams.append('categories', category);
      });

      const queryString = queryParams.toString();
      const url = `${this.basePath}/${userId}?${queryString}`;

      const response = await apiClient.get<RecommendationResponse>(url);

      if (response.success && response.data?.data?.recommendations) {
        const recommendations = response.data.data.recommendations;
        
        // Cache the recommendations
        await this.cacheRecommendations(userId, recommendations);
        
        return {
          success: true,
          data: recommendations
        };
      }

      return {
        success: false,
        message: response.message || 'Failed to get recommendations'
      };
    } catch (error) {
      console.error('Failed to get user recommendations:', error);
      
      // Return cached recommendations as fallback
      if (cachedRecommendations && cachedRecommendations.length > 0) {
        return {
          success: true,
          data: cachedRecommendations.slice(0, limit)
        };
      }

      return {
        success: false,
        message: 'Failed to get recommendations'
      };
    }
  }

  /**
   * Get product-based recommendations (similar products)
   */
  async getProductRecommendations(
    productId: string,
    limit: number = 10
  ): Promise<ApiResponse<Product[]>> {
    try {
      const response = await apiClient.get<Product[]>(
        `/products/${productId}/recommendations?limit=${limit}`
      );

      return response;
    } catch (error) {
      console.error('Failed to get product recommendations:', error);
      return {
        success: false,
        message: 'Failed to get product recommendations'
      };
    }
  }

  /**
   * Refresh recommendations for a user (clear cache and fetch new)
   */
  async refreshUserRecommendations(
    userId: string,
    options: RecommendationOptions = {}
  ): Promise<ApiResponse<RecommendationResult[]>> {
    // Clear cache first
    await this.clearCachedRecommendations(userId);
    
    // Fetch fresh recommendations
    return this.getUserRecommendations(userId, options);
  }

  /**
   * Get trending recommendations (popular products)
   */
  async getTrendingRecommendations(
    timeframe: '1h' | '24h' | '7d' | '30d' = '24h',
    limit: number = 20,
    category?: string
  ): Promise<ApiResponse<Product[]>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('timeframe', timeframe);
      queryParams.append('limit', limit.toString());
      if (category) queryParams.append('category', category);

      const queryString = queryParams.toString();
      const url = `/products/trending?${queryString}`;

      const response = await apiClient.get<{ products: Product[] }>(url);

      if (response.success && response.data?.products) {
        return {
          success: true,
          data: response.data.products
        };
      }

      return {
        success: false,
        message: response.message || 'Failed to get trending recommendations'
      };
    } catch (error) {
      console.error('Failed to get trending recommendations:', error);
      return {
        success: false,
        message: 'Failed to get trending recommendations'
      };
    }
  }

  /**
   * Get category-based recommendations
   */
  async getCategoryRecommendations(
    category: string,
    limit: number = 20,
    excludeProductIds: string[] = []
  ): Promise<ApiResponse<Product[]>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('category', category);
      queryParams.append('limit', limit.toString());
      
      excludeProductIds.forEach(id => {
        queryParams.append('exclude', id);
      });

      const queryString = queryParams.toString();
      const url = `/products?${queryString}`;

      const response = await apiClient.get<Product[]>(url);

      return response;
    } catch (error) {
      console.error('Failed to get category recommendations:', error);
      return {
        success: false,
        message: 'Failed to get category recommendations'
      };
    }
  }

  /**
   * Track user interaction for improving recommendations
   */
  async trackUserInteraction(
    userId: string,
    productId: string,
    interactionType: 'view' | 'cart_add' | 'wishlist_add' | 'purchase',
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await apiClient.post(`/users/${userId}/interactions`, {
        productId,
        interactionType,
        metadata,
        timestamp: new Date().toISOString()
      });

      // Clear cached recommendations to ensure fresh data on next request
      await this.clearCachedRecommendations(userId);
    } catch (error) {
      console.error('Failed to track user interaction:', error);
      // Don't throw error as this is not critical for user experience
    }
  }

  /**
   * Get recommendation statistics for a user
   */
  async getRecommendationStats(userId: string): Promise<ApiResponse<{
    totalRecommendations: number;
    clickThroughRate: number;
    conversionRate: number;
    topCategories: string[];
  }>> {
    try {
      const response = await apiClient.get(`${this.basePath}/${userId}/stats`);
      return response;
    } catch (error) {
      console.error('Failed to get recommendation stats:', error);
      return {
        success: false,
        message: 'Failed to get recommendation statistics'
      };
    }
  }

  // Private cache management methods

  private async getCachedRecommendations(userId: string): Promise<RecommendationResult[] | null> {
    try {
      const cacheKey = `${this.cachePrefix}${userId}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedData) return null;

      const { recommendations, timestamp } = JSON.parse(cachedData);
      
      // Check if cache is expired
      if (Date.now() - timestamp > this.cacheExpiry) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }

      return recommendations;
    } catch (error) {
      console.error('Failed to get cached recommendations:', error);
      return null;
    }
  }

  private async cacheRecommendations(userId: string, recommendations: RecommendationResult[]): Promise<void> {
    try {
      const cacheKey = `${this.cachePrefix}${userId}`;
      const cacheData = {
        recommendations,
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache recommendations:', error);
      // Don't throw error as caching is not critical
    }
  }

  private async clearCachedRecommendations(userId: string): Promise<void> {
    try {
      const cacheKey = `${this.cachePrefix}${userId}`;
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Failed to clear cached recommendations:', error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Clear all cached recommendations (useful for logout)
   */
  async clearAllCachedRecommendations(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const recommendationKeys = keys.filter(key => key.startsWith(this.cachePrefix));
      
      if (recommendationKeys.length > 0) {
        await AsyncStorage.multiRemove(recommendationKeys);
      }
    } catch (error) {
      console.error('Failed to clear all cached recommendations:', error);
    }
  }

  /**
   * Preload recommendations for better performance
   */
  async preloadRecommendations(userId: string): Promise<void> {
    try {
      // Preload in background without waiting
      this.getUserRecommendations(userId, { limit: 50 });
    } catch (error) {
      console.error('Failed to preload recommendations:', error);
      // Silent fail for preloading
    }
  }
}

// Export singleton instance
export const recommendationService = new RecommendationService();
export default recommendationService;