import { Product, BrowsingHistory, ProductViewCache } from '../models';
import { cacheService, CacheService } from './CacheService';
import mongoose from 'mongoose';

interface ViewMetadata {
  viewDuration?: number;
  scrollDepth?: number;
  imageViews?: number;
  source?: string;
}

interface ViewTrackingResult {
  success: boolean;
  newViewCount: number;
  tracked: boolean;
}

export class ViewTrackingService {
  /**
   * Track a product view and increment view count
   * @param productId - The product ID to track
   * @param userId - Optional user ID for authenticated users
   * @param sessionId - Optional session ID for anonymous users
   * @param metadata - Optional metadata about the view
   * @returns Promise with tracking result
   */
  async trackProductView(
    productId: string,
    userId?: string,
    sessionId?: string,
    metadata?: ViewMetadata
  ): Promise<ViewTrackingResult> {
    try {
      // Validate product ID
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Invalid product ID');
      }

      // Check if this is a unique view (prevent spam)
      const isUniqueView = await this.isUniqueView(productId, userId, sessionId);
      
      if (!isUniqueView) {
        const currentCount = await this.getViewCount(productId);
        return { success: false, newViewCount: currentCount, tracked: false };
      }

      // Update product view count atomically
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { 
          $inc: { viewCount: 1 },
          $set: { lastViewedAt: new Date() }
        },
        { new: true }
      );

      if (!updatedProduct) {
        throw new Error('Product not found');
      }

      // Update view cache for trending calculations
      await this.updateViewCache(productId);

      // Record browsing history if user is authenticated
      if (userId) {
        await this.recordBrowsingHistory(userId, productId, 'view', sessionId, metadata);
      }

      // Invalidate relevant caches
      await this.invalidateProductCaches(productId, updatedProduct.category);

      return { success: true, newViewCount: updatedProduct.viewCount, tracked: true };
    } catch (error) {
      console.error('Error tracking product view:', error);
      throw error;
    }
  }

  /**
   * Check if this is a unique view (user has never viewed this product before)
   * @param productId - Product ID
   * @param userId - User ID (optional)
   * @param sessionId - Session ID (optional)
   * @returns Promise<boolean> - true if unique view
   */
  private async isUniqueView(
    productId: string,
    userId?: string,
    sessionId?: string
  ): Promise<boolean> {
    const query: any = {
      productId: new mongoose.Types.ObjectId(productId),
      interactionType: 'view'
      // No timestamp filter - check if user has EVER viewed this product
    };

    if (userId) {
      query.userId = new mongoose.Types.ObjectId(userId);
    } else if (sessionId) {
      query.sessionId = sessionId;
    } else {
      // If no user or session, allow the view (anonymous users without session)
      return true;
    }

    const existingView = await BrowsingHistory.findOne(query);
    return !existingView;
  }

  /**
   * Update view cache for trending calculations
   * @param productId - Product ID
   */
  private async updateViewCache(productId: string): Promise<void> {
    const now = new Date();
    const hourKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
    const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    const weekKey = `${now.getFullYear()}-${Math.floor(now.getDate() / 7)}`;

    await ProductViewCache.findOneAndUpdate(
      { productId: new mongoose.Types.ObjectId(productId) },
      {
        $inc: {
          totalViews: 1,
          [`hourlyViews.${hourKey}`]: 1,
          [`dailyViews.${dayKey}`]: 1,
          [`weeklyViews.${weekKey}`]: 1
        },
        $set: { lastUpdated: now }
      },
      { upsert: true }
    );
  }

  /**
   * Record browsing history for authenticated users
   * @param userId - User ID
   * @param productId - Product ID
   * @param interactionType - Type of interaction
   * @param sessionId - Session ID (optional)
   * @param metadata - View metadata (optional)
   */
  private async recordBrowsingHistory(
    userId: string,
    productId: string,
    interactionType: string,
    sessionId?: string,
    metadata?: ViewMetadata
  ): Promise<void> {
    await BrowsingHistory.create({
      userId: new mongoose.Types.ObjectId(userId),
      productId: new mongoose.Types.ObjectId(productId),
      interactionType,
      sessionId,
      timestamp: new Date(),
      metadata
    });
  }

  /**
   * Invalidate product-related caches
   * @param productId - Product ID
   * @param category - Product category
   */
  private async invalidateProductCaches(productId: string, category: string): Promise<void> {
    try {
      // Invalidate trending caches
      await cacheService.deletePattern('trending:');
      
      // Invalidate category-specific caches
      await cacheService.deletePattern(`category:${category}`);
      
      // Invalidate product-specific cache
      await cacheService.delete(CacheService.keys.productDetails(productId));
      
      // Invalidate collection caches that might include this product
      await cacheService.deletePattern('featured:');
      await cacheService.deletePattern('seller_favorites:');
      await cacheService.deletePattern('collection:');
    } catch (error) {
      console.error('Error invalidating caches:', error);
      // Don't throw error, cache invalidation is optional
    }
  }

  /**
   * Get current view count for a product
   * @param productId - Product ID
   * @returns Promise<number> - Current view count
   */
  async getViewCount(productId: string): Promise<number> {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error('Invalid product ID');
    }

    const product = await Product.findById(productId).select('viewCount');
    return product?.viewCount || 0;
  }

  /**
   * Get view analytics for a product (admin only)
   * @param productId - Product ID
   * @returns Promise with analytics data
   */
  async getProductAnalytics(productId: string) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error('Invalid product ID');
    }

    const [product, viewCache, recentViews] = await Promise.all([
      Product.findById(productId).select('viewCount lastViewedAt'),
      ProductViewCache.findOne({ productId: new mongoose.Types.ObjectId(productId) }),
      BrowsingHistory.countDocuments({
        productId: new mongoose.Types.ObjectId(productId),
        interactionType: 'view',
        timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      })
    ]);

    if (!product) {
      throw new Error('Product not found');
    }

    // Calculate unique views from browsing history
    const uniqueViews = await BrowsingHistory.distinct('userId', {
      productId: new mongoose.Types.ObjectId(productId),
      interactionType: 'view'
    });

    // Calculate average view duration
    const viewsWithDuration = await BrowsingHistory.find({
      productId: new mongoose.Types.ObjectId(productId),
      interactionType: 'view',
      'metadata.viewDuration': { $exists: true, $gt: 0 }
    }).select('metadata.viewDuration');

    const avgViewDuration = viewsWithDuration.length > 0
      ? viewsWithDuration.reduce((sum, view) => sum + (view.metadata?.viewDuration || 0), 0) / viewsWithDuration.length
      : 0;

    return {
      productId,
      totalViews: product.viewCount,
      uniqueViews: uniqueViews.length,
      recentViews,
      viewsByTimeframe: {
        hourly: viewCache?.hourlyViews || new Map(),
        daily: viewCache?.dailyViews || new Map(),
        weekly: viewCache?.weeklyViews || new Map()
      },
      trendingScore: viewCache?.trendingScore || 0,
      averageViewDuration: Math.round(avgViewDuration),
      lastViewedAt: product.lastViewedAt
    };
  }

  /**
   * Record other types of interactions (cart add, wishlist, purchase)
   * @param userId - User ID
   * @param productId - Product ID
   * @param interactionType - Type of interaction
   * @param sessionId - Session ID (optional)
   * @param metadata - Additional metadata (optional)
   */
  async recordInteraction(
    userId: string,
    productId: string,
    interactionType: 'cart_add' | 'wishlist_add' | 'purchase',
    sessionId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid product ID or user ID');
    }

    await BrowsingHistory.create({
      userId: new mongoose.Types.ObjectId(userId),
      productId: new mongoose.Types.ObjectId(productId),
      interactionType,
      sessionId,
      timestamp: new Date(),
      metadata
    });
  }
}

export const viewTrackingService = new ViewTrackingService();
export default viewTrackingService;