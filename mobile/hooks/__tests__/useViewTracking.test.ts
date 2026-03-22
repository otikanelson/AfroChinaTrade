import { renderHook } from '@testing-library/react-native';
import { useViewTracking } from '../useViewTracking';
import { analyticsService } from '../../services/AnalyticsService';

// Mock the analytics service
jest.mock('../../services/AnalyticsService');
const mockAnalyticsService = jest.mocked(analyticsService);

describe('useViewTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('trackView', () => {
    it('should call analyticsService.trackProductView with correct parameters', async () => {
      mockAnalyticsService.trackProductView.mockResolvedValue({
        success: true,
        data: {
          status: 'success',
          data: {
            productId: 'test-product',
            newViewCount: 1,
            tracked: true
          }
        }
      });

      const { result } = renderHook(() => useViewTracking());
      
      await result.current.trackView('test-product', 'test-user', {
        viewDuration: 5000,
        source: 'home_featured'
      });

      expect(mockAnalyticsService.trackProductView).toHaveBeenCalledWith(
        'test-product',
        'test-user',
        {
          viewDuration: 5000,
          source: 'home_featured'
        }
      );
    });

    it('should handle errors gracefully without throwing', async () => {
      mockAnalyticsService.trackProductView.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useViewTracking());
      
      // Should not throw
      await expect(result.current.trackView('test-product')).resolves.toBeUndefined();
      
      expect(console.error).toHaveBeenCalledWith('Failed to track view:', expect.any(Error));
    });

    it('should work without optional parameters', async () => {
      mockAnalyticsService.trackProductView.mockResolvedValue({
        success: true,
        data: {
          status: 'success',
          data: {
            productId: 'test-product',
            newViewCount: 1,
            tracked: true
          }
        }
      });

      const { result } = renderHook(() => useViewTracking());
      
      await result.current.trackView('test-product');

      expect(mockAnalyticsService.trackProductView).toHaveBeenCalledWith(
        'test-product',
        undefined,
        undefined
      );
    });
  });

  describe('trackProductCardInteraction', () => {
    it('should call analyticsService.trackProductCardInteraction with correct parameters', async () => {
      mockAnalyticsService.trackProductCardInteraction.mockResolvedValue({
        success: true,
        data: {}
      });

      const { result } = renderHook(() => useViewTracking());
      
      await result.current.trackProductCardInteraction('test-product', 'tap', {
        source: 'home_featured'
      });

      expect(mockAnalyticsService.trackProductCardInteraction).toHaveBeenCalledWith(
        'test-product',
        'tap',
        {
          source: 'home_featured'
        }
      );
    });

    it('should handle errors gracefully without throwing', async () => {
      mockAnalyticsService.trackProductCardInteraction.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useViewTracking());
      
      // Should not throw
      await expect(
        result.current.trackProductCardInteraction('test-product', 'add_to_cart')
      ).resolves.toBeUndefined();
      
      expect(console.error).toHaveBeenCalledWith(
        'Failed to track product card interaction:', 
        expect.any(Error)
      );
    });

    it('should work with all interaction types', async () => {
      mockAnalyticsService.trackProductCardInteraction.mockResolvedValue({
        success: true,
        data: {}
      });

      const { result } = renderHook(() => useViewTracking());
      
      const interactionTypes = ['tap', 'view', 'add_to_cart', 'add_to_wishlist'] as const;
      
      for (const interactionType of interactionTypes) {
        await result.current.trackProductCardInteraction('test-product', interactionType);
        
        expect(mockAnalyticsService.trackProductCardInteraction).toHaveBeenCalledWith(
          'test-product',
          interactionType,
          undefined
        );
      }

      expect(mockAnalyticsService.trackProductCardInteraction).toHaveBeenCalledTimes(4);
    });
  });

  it('should return stable function references', () => {
    const { result, rerender } = renderHook(() => useViewTracking());
    
    const firstRender = result.current;
    
    rerender();
    
    const secondRender = result.current;
    
    expect(firstRender.trackView).toBe(secondRender.trackView);
    expect(firstRender.trackProductCardInteraction).toBe(secondRender.trackProductCardInteraction);
  });
});