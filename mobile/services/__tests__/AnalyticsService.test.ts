import { analyticsService } from '../AnalyticsService';
import apiClient from '../api/apiClient';

// Mock the API client
jest.mock('../api/apiClient');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackProductView', () => {
    it('should make POST request to correct endpoint with proper payload', async () => {
      const mockResponse = {
        success: true,
        data: {
          status: 'success' as const,
          data: {
            productId: 'test-product',
            newViewCount: 5,
            tracked: true
          }
        }
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await analyticsService.trackProductView(
        'test-product',
        'test-user',
        {
          viewDuration: 3000,
          scrollDepth: 75,
          source: 'home_featured'
        }
      );

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/products/test-product/view',
        {
          userId: 'test-user',
          metadata: {
            viewDuration: 3000,
            scrollDepth: 75,
            source: 'home_featured'
          }
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should work with minimal parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          status: 'success' as const,
          data: {
            productId: 'test-product',
            newViewCount: 1,
            tracked: true
          }
        }
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      await analyticsService.trackProductView('test-product');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/products/test-product/view',
        {
          userId: undefined,
          metadata: undefined
        }
      );
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Network error');
      mockApiClient.post.mockRejectedValue(mockError);

      await expect(
        analyticsService.trackProductView('test-product')
      ).rejects.toThrow('Network error');
    });
  });

  describe('trackProductCardInteraction', () => {
    it('should make POST request to correct endpoint with proper payload', async () => {
      const mockResponse = {
        success: true,
        data: {}
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await analyticsService.trackProductCardInteraction(
        'test-product',
        'tap',
        {
          source: 'home_trending',
          timestamp: '2024-01-01T00:00:00Z'
        }
      );

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/products/test-product/interaction',
        {
          interactionType: 'tap',
          metadata: {
            source: 'home_trending',
            timestamp: '2024-01-01T00:00:00Z'
          }
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should work with all interaction types', async () => {
      const mockResponse = { success: true, data: {} };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const interactionTypes = ['tap', 'view', 'add_to_cart', 'add_to_wishlist'] as const;

      for (const interactionType of interactionTypes) {
        await analyticsService.trackProductCardInteraction('test-product', interactionType);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/products/test-product/interaction',
          {
            interactionType,
            metadata: undefined
          }
        );
      }

      expect(mockApiClient.post).toHaveBeenCalledTimes(4);
    });
  });

  describe('getProductAnalytics', () => {
    it('should make GET request to correct endpoint', async () => {
      const mockResponse = {
        success: true,
        data: {
          productId: 'test-product',
          totalViews: 100,
          uniqueViews: 75,
          viewsByTimeframe: {
            hourly: { '2024-01-01-10': 5 },
            daily: { '2024-01-01': 20 },
            weekly: { '2024-01': 100 }
          },
          trendingScore: 85.5,
          averageViewDuration: 4500
        }
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await analyticsService.getProductAnalytics('test-product');

      expect(mockApiClient.get).toHaveBeenCalledWith('/products/test-product/analytics');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getRevenue', () => {
    it('should make GET request with query parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          totalRevenue: 10000,
          totalOrders: 50,
          averageOrderValue: 200,
          revenueByPeriod: []
        }
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      await analyticsService.getRevenue({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        groupBy: 'day'
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/analytics/revenue?startDate=2024-01-01&endDate=2024-01-31&groupBy=day'
      );
    });

    it('should work without parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          totalRevenue: 10000,
          totalOrders: 50,
          averageOrderValue: 200,
          revenueByPeriod: []
        }
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      await analyticsService.getRevenue();

      expect(mockApiClient.get).toHaveBeenCalledWith('/analytics/revenue');
    });
  });

  describe('getOrderStats', () => {
    it('should make GET request with query parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          totalOrders: 100,
          ordersByStatus: { completed: 80, pending: 20 },
          ordersByPeriod: []
        }
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      await analyticsService.getOrderStats({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        groupBy: 'week'
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/analytics/orders?startDate=2024-01-01&endDate=2024-01-31&groupBy=week'
      );
    });
  });

  describe('getProductStats', () => {
    it('should make GET request to products analytics endpoint', async () => {
      const mockResponse = {
        success: true,
        data: {
          totalProducts: 500,
          activeProducts: 450,
          topCategories: []
        }
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await analyticsService.getProductStats();

      expect(mockApiClient.get).toHaveBeenCalledWith('/analytics/products');
      expect(result).toEqual(mockResponse);
    });
  });
});