import { useCallback } from 'react';
import { analyticsService } from '../services/AnalyticsService';

interface ViewMetadata {
  viewDuration?: number;
  scrollDepth?: number;
  imageViews?: number;
  source?: string;
  timestamp?: string;
}

/**
 * useViewTracking Hook
 * 
 * A custom hook that provides view tracking functionality for products.
 * Integrates with the analytics service to track product views with metadata.
 * 
 * Features:
 * - Track product views with optional metadata
 * - Silent error handling to not disrupt user experience
 * - Support for view duration, scroll depth, and other analytics
 */
export const useViewTracking = () => {
  const trackView = useCallback(async (
    productId: string, 
    userId?: string, 
    metadata?: ViewMetadata
  ) => {
    try {
      await analyticsService.trackProductView(productId, userId, metadata);
    } catch (error) {
      console.error('Failed to track view:', error);
      // Fail silently to not disrupt user experience
    }
  }, []);

  const trackProductCardInteraction = useCallback(async (
    productId: string,
    interactionType: 'tap' | 'view' | 'add_to_cart' | 'add_to_wishlist',
    metadata?: ViewMetadata
  ) => {
    try {
      await analyticsService.trackProductCardInteraction(productId, interactionType, metadata);
    } catch (error) {
      console.error('Failed to track product card interaction:', error);
      // Fail silently to not disrupt user experience
    }
  }, []);

  return { 
    trackView,
    trackProductCardInteraction
  };
};

export default useViewTracking;