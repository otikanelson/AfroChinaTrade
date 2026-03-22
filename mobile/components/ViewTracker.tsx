import React, { useEffect, useRef } from 'react';
import { viewTrackingService } from '../services/ViewTrackingService';
import { useAuth } from '../contexts/AuthContext';

interface ViewTrackerProps {
  productId: string;
  onViewTracked?: (newViewCount: number) => void;
  onRecommendationsRefresh?: () => void;
  source?: string;
  children?: React.ReactNode;
}

/**
 * ViewTracker component that automatically tracks product views
 * This component should wrap product detail pages or be used when a product is viewed
 */
export const ViewTracker: React.FC<ViewTrackerProps> = ({
  productId,
  onViewTracked,
  onRecommendationsRefresh,
  source = 'product_detail',
  children
}) => {
  const { user } = useAuth();
  const hasTracked = useRef(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    // Track view when component mounts (only once)
    if (!hasTracked.current && productId) {
      trackView();
      hasTracked.current = true;
    }

    // Track view duration when component unmounts
    return () => {
      if (hasTracked.current) {
        const viewDuration = Math.floor((Date.now() - startTime.current) / 1000);
        // You could send this data to analytics if needed
        console.log(`Product ${productId} viewed for ${viewDuration} seconds`);
      }
    };
  }, [productId]);

  const trackView = async () => {
    try {
      // Generate a session ID for anonymous users
      const sessionId = user?.id ? undefined : generateSessionId();
      
      const metadata = {
        source,
        viewDuration: 0, // Will be updated on unmount
        scrollDepth: 0,
        imageViews: 1
      };

      const response = await viewTrackingService.trackProductView(
        productId,
        sessionId,
        metadata
      );

      if (response.success && response.data) {
        console.log(`View tracked for product ${productId}, new count: ${response.data.newViewCount}`);
        
        // Notify parent component of new view count
        if (onViewTracked) {
          onViewTracked(response.data.newViewCount);
        }

        // Refresh recommendations if user is authenticated and view was tracked
        if (user?.id && response.data.tracked && onRecommendationsRefresh) {
          // Delay the refresh slightly to allow backend to process the browsing history
          setTimeout(() => {
            onRecommendationsRefresh();
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Failed to track product view:', error);
      // Don't throw error, view tracking is optional
    }
  };

  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // This component doesn't render anything visible
  return <>{children}</>;
};

export default ViewTracker;