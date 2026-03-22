import { Request, Response } from 'express';
import { viewTrackingService } from '../services/ViewTrackingService';

/**
 * Track a product view
 * POST /api/products/:productId/view
 */
export const trackProductView = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { sessionId, metadata } = req.body;
    
    // Get user ID from authenticated request (optional)
    const userId = req.userId;

    if (!productId) {
      res.status(400).json({
        status: 'error',
        message: 'Product ID is required',
        errorCode: 'MISSING_PRODUCT_ID'
      });
      return;
    }

    const result = await viewTrackingService.trackProductView(
      productId,
      userId,
      sessionId,
      metadata
    );

    res.status(200).json({
      status: 'success',
      data: {
        productId,
        newViewCount: result.newViewCount,
        tracked: result.tracked
      }
    });

  } catch (error) {
    console.error('Error tracking product view:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Invalid product ID') {
        res.status(400).json({
          status: 'error',
          message: 'Invalid product ID format',
          errorCode: 'INVALID_PRODUCT_ID'
        });
        return;
      }
      
      if (error.message === 'Product not found') {
        res.status(404).json({
          status: 'error',
          message: 'Product not found',
          errorCode: 'PRODUCT_NOT_FOUND'
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to track product view',
      errorCode: 'VIEW_TRACKING_FAILED'
    });
  }
};

/**
 * Get product analytics (admin only)
 * GET /api/products/:productId/analytics
 */
export const getProductAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    if (!productId) {
      res.status(400).json({
        status: 'error',
        message: 'Product ID is required',
        errorCode: 'MISSING_PRODUCT_ID'
      });
      return;
    }

    const analytics = await viewTrackingService.getProductAnalytics(productId);

    res.status(200).json({
      status: 'success',
      data: analytics
    });

  } catch (error) {
    console.error('Error getting product analytics:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Invalid product ID') {
        res.status(400).json({
          status: 'error',
          message: 'Invalid product ID format',
          errorCode: 'INVALID_PRODUCT_ID'
        });
        return;
      }
      
      if (error.message === 'Product not found') {
        res.status(404).json({
          status: 'error',
          message: 'Product not found',
          errorCode: 'PRODUCT_NOT_FOUND'
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to get product analytics',
      errorCode: 'ANALYTICS_FAILED'
    });
  }
};

/**
 * Record user interaction (cart add, wishlist, purchase)
 * POST /api/products/:productId/interaction
 */
export const recordInteraction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { interactionType, sessionId, metadata } = req.body;
    
    // Get user ID from authenticated request (required for interactions)
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required',
        errorCode: 'AUTHENTICATION_REQUIRED'
      });
      return;
    }

    if (!productId) {
      res.status(400).json({
        status: 'error',
        message: 'Product ID is required',
        errorCode: 'MISSING_PRODUCT_ID'
      });
      return;
    }

    if (!interactionType || !['cart_add', 'wishlist_add', 'purchase'].includes(interactionType)) {
      res.status(400).json({
        status: 'error',
        message: 'Valid interaction type is required (cart_add, wishlist_add, purchase)',
        errorCode: 'INVALID_INTERACTION_TYPE'
      });
      return;
    }

    await viewTrackingService.recordInteraction(
      userId,
      productId,
      interactionType,
      sessionId,
      metadata
    );

    res.status(200).json({
      status: 'success',
      data: {
        productId,
        interactionType,
        recorded: true
      }
    });

  } catch (error) {
    console.error('Error recording interaction:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid product ID') || error.message.includes('Invalid user ID')) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid product ID or user ID format',
          errorCode: 'INVALID_ID_FORMAT'
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to record interaction',
      errorCode: 'INTERACTION_RECORDING_FAILED'
    });
  }
};