import { Request, Response } from 'express';
import { recommendationEngine } from '../services/RecommendationEngine';
import { BrowsingHistory } from '../models';
import { cacheService } from '../services/CacheService';
import mongoose from 'mongoose';

/**
 * Get personalized recommendations for a user
 * GET /api/products/recommendations/:userId
 */
export const getUserRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { 
      limit = 20, 
      excludeCart = 'true', 
      includeReasons = 'false',
      categories 
    } = req.query;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid user ID format',
        errorCode: 'INVALID_USER_ID'
      });
      return;
    }

    // Parse parameters
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 20));
    const excludeCartBool = excludeCart === 'true';
    const includeReasonsBool = includeReasons === 'true';
    const categoriesArray = categories ? 
      (Array.isArray(categories) ? categories : [categories]) : [];

    // Generate recommendations
    const recommendations = await recommendationEngine.generateRecommendations(userId, {
      limit: limitNum,
      excludeCart: excludeCartBool,
      includeReasons: includeReasonsBool,
      categories: categoriesArray as string[]
    });

    res.status(200).json({
      status: 'success',
      data: {
        recommendations,
        metadata: {
          userId,
          count: recommendations.length,
          generatedAt: new Date().toISOString(),
          parameters: {
            limit: limitNum,
            excludeCart: excludeCartBool,
            includeReasons: includeReasonsBool,
            categories: categoriesArray
          }
        }
      }
    });

  } catch (error) {
    console.error('Error getting user recommendations:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Invalid user ID') {
        res.status(400).json({
          status: 'error',
          message: 'Invalid user ID format',
          errorCode: 'INVALID_USER_ID'
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to get recommendations',
      errorCode: 'RECOMMENDATIONS_FAILED'
    });
  }
};

/**
 * Get user's browsing history
 * GET /api/users/:userId/browsing-history
 */
export const getUserBrowsingHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      interactionType,
      startDate,
      endDate
    } = req.query;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid user ID format',
        errorCode: 'INVALID_USER_ID'
      });
      return;
    }

    // Parse pagination
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Build cache key
    const cacheKey = `browsing_history:${userId}:${pageNum}:${limitNum}:${interactionType || 'all'}:${startDate || ''}:${endDate || ''}`;
    
    // Disable caching for browsing history to ensure fresh data
    // if (pageNum === 1 && !startDate && !endDate) {
    //   const cached = await cacheService.get(cacheKey);
    //   if (cached) {
    //     res.status(200).json(cached);
    //     return;
    //   }
    // }

    // Build filter
    const filter: any = { userId: new mongoose.Types.ObjectId(userId) };

    if (interactionType) {
      const validTypes = ['view', 'cart_add', 'wishlist_add', 'purchase'];
      if (validTypes.includes(interactionType as string)) {
        filter.interactionType = interactionType;
      }
    }

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate as string);
      }
    }

    // Execute query with optimizations
    const [historyRaw, total] = await Promise.all([
      BrowsingHistory.find(filter)
        .populate({
          path: 'productId',
          select: 'name price images category rating stock viewCount reviewCount description discount supplier supplierId',
          options: { lean: true },
          populate: {
            path: 'supplierId',
            select: 'name location rating verified',
            options: { lean: true }
          }
        })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
        .hint({ userId: 1, timestamp: -1 }), // Use index hint for faster queries
      // Only count on first page to reduce overhead
      pageNum === 1 ? BrowsingHistory.countDocuments(filter) : Promise.resolve(0)
    ]);

    // Filter out entries where the product has been deleted (productId is null after populate)
    const history = historyRaw.filter(entry => entry.productId && entry.productId._id);

    const pages = pageNum === 1 ? Math.ceil(total / limitNum) : 0;

    const response = {
      status: 'success',
      data: {
        history,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: pageNum === 1 ? total : undefined,
          pages: pageNum === 1 ? pages : undefined,
          hasNext: history.length === limitNum,
          hasPrev: pageNum > 1
        }
      }
    };

    // Don't cache browsing history to ensure fresh data
    // if (pageNum === 1 && !startDate && !endDate) {
    //   await cacheService.set(cacheKey, response, 300); // 5 minutes TTL
    // }

    res.status(200).json(response);

  } catch (error) {
    console.error('Error getting browsing history:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to get browsing history',
      errorCode: 'BROWSING_HISTORY_FAILED'
    });
  }
};

/**
 * Add entry to user's browsing history
 * POST /api/users/:userId/browsing-history
 */
export const addBrowsingHistoryEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { productId, interactionType, sessionId, metadata } = req.body;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid user ID format',
        errorCode: 'INVALID_USER_ID'
      });
      return;
    }

    // Validate product ID
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({
        status: 'error',
        message: 'Valid product ID is required',
        errorCode: 'INVALID_PRODUCT_ID'
      });
      return;
    }

    // Validate interaction type
    const validTypes = ['view', 'cart_add', 'wishlist_add', 'purchase'];
    if (!interactionType || !validTypes.includes(interactionType)) {
      res.status(400).json({
        status: 'error',
        message: 'Valid interaction type is required (view, cart_add, wishlist_add, purchase)',
        errorCode: 'INVALID_INTERACTION_TYPE'
      });
      return;
    }

    // Create browsing history entry
    const historyEntry = await BrowsingHistory.create({
      userId: new mongoose.Types.ObjectId(userId),
      productId: new mongoose.Types.ObjectId(productId),
      interactionType,
      sessionId,
      timestamp: new Date(),
      metadata
    });

    // Invalidate cache for this user's browsing history
    await cacheService.deletePattern(`browsing_history:${userId}`);

    res.status(201).json({
      status: 'success',
      data: {
        id: historyEntry._id,
        userId,
        productId,
        interactionType,
        timestamp: historyEntry.timestamp
      }
    });

  } catch (error) {
    console.error('Error adding browsing history entry:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to add browsing history entry',
      errorCode: 'ADD_HISTORY_FAILED'
    });
  }
};

/**
 * Get recommendation statistics for a user (admin only)
 * GET /api/users/:userId/recommendation-stats
 */
export const getUserRecommendationStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid user ID format',
        errorCode: 'INVALID_USER_ID'
      });
      return;
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get user activity statistics
    const [
      totalViews,
      totalPurchases,
      uniqueCategories,
      recentActivity,
      topCategories
    ] = await Promise.all([
      BrowsingHistory.countDocuments({ userId: userObjectId, interactionType: 'view' }),
      BrowsingHistory.countDocuments({ userId: userObjectId, interactionType: 'purchase' }),
      BrowsingHistory.distinct('productId', { userId: userObjectId }).then(products => 
        BrowsingHistory.aggregate([
          { $match: { userId: userObjectId } },
          { $lookup: { from: 'products', localField: 'productId', foreignField: '_id', as: 'product' } },
          { $unwind: '$product' },
          { $group: { _id: '$product.category' } },
          { $count: 'categories' }
        ]).then(result => result[0]?.categories || 0)
      ),
      BrowsingHistory.find({ userId: userObjectId })
        .sort({ timestamp: -1 })
        .limit(10)
        .populate('productId', 'name category')
        .lean(),
      BrowsingHistory.aggregate([
        { $match: { userId: userObjectId } },
        { $lookup: { from: 'products', localField: 'productId', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' },
        { $group: { _id: '$product.category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        userId,
        statistics: {
          totalViews,
          totalPurchases,
          uniqueCategories,
          topCategories: topCategories.map(cat => ({
            category: cat._id,
            count: cat.count
          }))
        },
        recentActivity: recentActivity.map(activity => ({
          productId: (activity.productId as any)._id,
          productName: (activity.productId as any).name,
          category: (activity.productId as any).category,
          interactionType: activity.interactionType,
          timestamp: activity.timestamp
        }))
      }
    });

  } catch (error) {
    console.error('Error getting recommendation stats:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to get recommendation statistics',
      errorCode: 'RECOMMENDATION_STATS_FAILED'
    });
  }
};