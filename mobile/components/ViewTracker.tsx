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
    console.log(`🔍 ViewTracker mounted for product: ${productId}`);
    console.log(`👤 User: ${user?.id ? `${user.name} (${user.id})` : 'anonymous'}`);
    
    // Track view when component mounts (only once)
    if (!hasTracked.current && productId) {
      console.log(`🎯 ViewTracker: About to track view...`);
      trackView();
      hasTracked.current = true;
    } else {
      console.log(`⚠️ ViewTracker: Not tracking - hasTracked: ${hasTracked.current}, productId: ${productId}`);
    }

    // Track view duration when component unmounts
    return () => {
      if (hasTracked.current) {
        const viewDuration = Math.floor((Date.now() - startTime.current) / 1000);
        // You could send this data to analytics if needed
        console.log(`⏱️ Product ${productId} viewed for ${viewDuration} seconds`);
      }
    };
  }, [productId]);

  const trackView = async () => {
    try {
      console.log(`🎯 ViewTracker: Starting to track view for product ${productId}`);
      console.log(`👤 User ID: ${user?.id || 'anonymous'}`);
      
      // Generate a session ID for anonymous users
      const sessionId = user?.id ? undefined : generateSessionId();
      console.log(`🔑 Session ID: ${sessionId || 'none (authenticated user)'}`);
      
      const metadata = {
        source,
        viewDuration: 0, // Will be updated on unmount
        scrollDepth: 0,
        imageViews: 1
      };

      console.log(`📊 Calling viewTrackingService.trackProductView...`);
      const response = await viewTrackingService.trackProductView(
        productId,
        sessionId,
        metadata
      );

      console.log(`📈 ViewTracker API response:`, response);

      if (response.success && response.data) {
        console.log(`✅ View tracked for product ${productId}, new count: ${response.data.newViewCount}`);
        
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
        
        // Add a small delay to ensure backend has processed the browsing history
        console.log('⏳ Waiting for backend to process browsing history...');
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.warn(`⚠️ View tracking failed or returned no data:`, response);
      }
    } catch (error) {
      console.error('❌ Failed to track product view:', error);
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