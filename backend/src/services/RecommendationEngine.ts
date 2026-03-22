import { Product, BrowsingHistory, Order, Cart, RecommendationCache } from '../models';
import mongoose from 'mongoose';

// Type definitions for recommendation system
interface UserProfile {
  userId: string;
  hasActivity: boolean;
  viewedProducts: any[];
  purchasedProducts: any[];
  categoryPreferences: Record<string, number>;
  priceRange: { min: number; max: number; average: number };
  brandPreferences: Record<string, number>;
  recentActivity: any[];
}

interface RecommendationCandidate {
  productId: any;
  product: any;
  score: number;
  algorithm: string;
  confidence: number;
}

interface RecommendationResult {
  productId: any;
  product: any;
  score: number;
  confidence: number;
  algorithm: string;
  reason?: string;
}

interface RecommendationOptions {
  limit?: number;
  excludeCart?: boolean;
  includeReasons?: boolean;
  categories?: string[];
}

export class RecommendationEngine {
  private weights = {
    collaborative: 0.4,
    contentBased: 0.35,
    popularity: 0.25
  };

  /**
   * Generate personalized recommendations for a user
   * @param userId - User ID
   * @param options - Recommendation options
   * @returns Promise<RecommendationResult[]>
   */
  async generateRecommendations(
    userId: string, 
    options: RecommendationOptions = {}
  ): Promise<RecommendationResult[]> {
    const {
      limit = 20,
      excludeCart = true,
      includeReasons = false,
      categories = []
    } = options;

    try {
      // Validate user ID
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('Invalid user ID');
      }

      // Check cache first
      const cached = await this.getCachedRecommendations(userId);
      if (cached && cached.length >= limit) {
        return cached.slice(0, limit);
      }

      // Get user profile
      const userProfile = await this.buildUserProfile(userId);
      
      if (!userProfile.hasActivity) {
        // Fallback to featured products for new users
        return this.getFallbackRecommendations(limit, categories);
      }

      // Generate recommendations using different algorithms
      const [collaborative, contentBased, popularity] = await Promise.all([
        this.getCollaborativeRecommendations(userProfile, limit * 2),
        this.getContentBasedRecommendations(userProfile, limit * 2),
        this.getPopularityBasedRecommendations(userProfile, limit * 2)
      ]);

      // Combine and score recommendations
      const combinedRecommendations = this.combineRecommendations(
        collaborative,
        contentBased,
        popularity
      );

      // Filter and rank
      let finalRecommendations = await this.filterRecommendations(
        combinedRecommendations,
        userId,
        excludeCart,
        categories
      );

      finalRecommendations = finalRecommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      // Add reasons if requested
      if (includeReasons) {
        finalRecommendations = finalRecommendations.map(rec => ({
          ...rec,
          reason: this.generateReason(rec, userProfile)
        }));
      }

      // Cache results
      await this.cacheRecommendations(userId, finalRecommendations);

      return finalRecommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  /**
   * Build user profile from browsing and purchase history
   * @param userId - User ID
   * @returns Promise<UserProfile>
   */
  private async buildUserProfile(userId: string): Promise<UserProfile> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [browsingHistory, purchaseHistory] = await Promise.all([
      BrowsingHistory.find({ userId: userObjectId })
        .populate('productId')
        .sort({ timestamp: -1 })
        .limit(100)
        .lean(),
      Order.find({ userId: userObjectId, status: 'completed' })
        .populate('items.productId')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()
    ]);

    const profile: UserProfile = {
      userId,
      hasActivity: browsingHistory.length > 0 || purchaseHistory.length > 0,
      viewedProducts: browsingHistory.map(h => h.productId).filter(Boolean),
      purchasedProducts: purchaseHistory.flatMap(order => 
        order.items.map(item => item.productId).filter(Boolean)
      ),
      categoryPreferences: this.calculateCategoryPreferences(browsingHistory, purchaseHistory),
      priceRange: this.calculatePriceRange(browsingHistory, purchaseHistory),
      brandPreferences: this.calculateBrandPreferences(browsingHistory, purchaseHistory),
      recentActivity: browsingHistory.slice(0, 20).map(h => h.productId).filter(Boolean)
    };

    return profile;
  }

  /**
   * Get collaborative filtering recommendations
   * @param userProfile - User profile
   * @param limit - Number of recommendations
   * @returns Promise<RecommendationCandidate[]>
   */
  private async getCollaborativeRecommendations(
    userProfile: UserProfile, 
    limit: number
  ): Promise<RecommendationCandidate[]> {
    try {
      // Find users with similar viewing patterns
      const similarUsers = await this.findSimilarUsers(
        userProfile.userId, 
        userProfile.viewedProducts
      );
      
      if (similarUsers.length === 0) {
        return [];
      }

      // Get products viewed by similar users but not by current user
      const viewedProductIds = userProfile.viewedProducts.map(p => p._id);
      
      const recommendations = await BrowsingHistory.aggregate([
        {
          $match: {
            userId: { $in: similarUsers.map(u => new mongoose.Types.ObjectId(u.userId)) },
            productId: { $nin: viewedProductIds },
            interactionType: { $in: ['view', 'purchase'] }
          }
        },
        {
          $group: {
            _id: '$productId',
            score: { $sum: 1 },
            interactions: { $push: '$interactionType' }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        {
          $unwind: '$product'
        },
        {
          $match: {
            'product.isActive': true,
            'product.stock': { $gt: 0 }
          }
        },
        {
          $sort: { score: -1 }
        },
        {
          $limit: limit
        }
      ]);

      return recommendations.map(rec => ({
        productId: rec._id,
        product: rec.product,
        score: rec.score * this.weights.collaborative,
        algorithm: 'collaborative',
        confidence: Math.min(rec.score / 10, 1) // Normalize confidence
      }));
    } catch (error) {
      console.error('Error in collaborative filtering:', error);
      return [];
    }
  }

  /**
   * Get content-based filtering recommendations
   * @param userProfile - User profile
   * @param limit - Number of recommendations
   * @returns Promise<RecommendationCandidate[]>
   */
  private async getContentBasedRecommendations(
    userProfile: UserProfile, 
    limit: number
  ): Promise<RecommendationCandidate[]> {
    try {
      const viewedProductIds = userProfile.viewedProducts.map(p => p._id);
      
      // Build content similarity query based on user preferences
      const categoryFilter = Object.keys(userProfile.categoryPreferences).length > 0 
        ? { category: { $in: Object.keys(userProfile.categoryPreferences) } }
        : {};

      const priceFilter = userProfile.priceRange.min && userProfile.priceRange.max
        ? { 
            price: { 
              $gte: userProfile.priceRange.min * 0.7, 
              $lte: userProfile.priceRange.max * 1.3 
            } 
          }
        : {};

      const products = await Product.find({
        _id: { $nin: viewedProductIds },
        isActive: true,
        stock: { $gt: 0 },
        ...categoryFilter,
        ...priceFilter
      })
      .limit(limit * 3)
      .populate('supplierId')
      .lean();

      // Calculate content similarity scores
      const recommendations = products.map(product => {
        let score = 0;
        
        // Category preference score
        const categoryScore = userProfile.categoryPreferences[product.category] || 0;
        score += categoryScore * 0.4;
        
        // Price preference score
        if (userProfile.priceRange.min && userProfile.priceRange.max) {
          const priceScore = this.calculatePriceScore(
            product.price, 
            userProfile.priceRange.min, 
            userProfile.priceRange.max
          );
          score += priceScore * 0.3;
        }
        
        // Rating score
        score += (product.rating / 5) * 0.2;
        
        // Popularity score
        score += Math.min((product.viewCount || 0) / 1000, 1) * 0.1;

        return {
          productId: product._id,
          product,
          score: score * this.weights.contentBased,
          algorithm: 'content-based',
          confidence: score
        };
      });

      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error in content-based filtering:', error);
      return [];
    }
  }

  /**
   * Get popularity-based recommendations
   * @param userProfile - User profile
   * @param limit - Number of recommendations
   * @returns Promise<RecommendationCandidate[]>
   */
  private async getPopularityBasedRecommendations(
    userProfile: UserProfile, 
    limit: number
  ): Promise<RecommendationCandidate[]> {
    try {
      const viewedProductIds = userProfile.viewedProducts.map(p => p._id);
      
      // Get trending products from the last 7 days
      const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const trendingProducts = await Product.find({
        _id: { $nin: viewedProductIds },
        isActive: true,
        stock: { $gt: 0 },
        lastViewedAt: { $gte: cutoffDate }
      })
      .sort({ viewCount: -1, rating: -1 })
      .limit(limit)
      .populate('supplierId')
      .lean();

      return trendingProducts.map((product, index) => ({
        productId: product._id,
        product,
        score: (limit - index) / limit * this.weights.popularity,
        algorithm: 'popularity',
        confidence: Math.min((product.viewCount || 0) / 100, 1)
      }));
    } catch (error) {
      console.error('Error in popularity-based filtering:', error);
      return [];
    }
  }

  /**
   * Combine recommendations from different algorithms
   * @param collaborative - Collaborative recommendations
   * @param contentBased - Content-based recommendations
   * @param popularity - Popularity-based recommendations
   * @returns Map<string, RecommendationCandidate>
   */
  private combineRecommendations(
    collaborative: RecommendationCandidate[],
    contentBased: RecommendationCandidate[],
    popularity: RecommendationCandidate[]
  ): Map<string, RecommendationCandidate> {
    const combined = new Map<string, RecommendationCandidate>();

    // Combine all recommendations, summing scores for duplicates
    [collaborative, contentBased, popularity].forEach(recommendations => {
      recommendations.forEach(rec => {
        const key = rec.productId.toString();
        const existing = combined.get(key);
        
        if (existing) {
          existing.score += rec.score;
          existing.confidence = Math.max(existing.confidence, rec.confidence);
          existing.algorithm = `${existing.algorithm}, ${rec.algorithm}`;
        } else {
          combined.set(key, { ...rec });
        }
      });
    });

    return combined;
  }

  /**
   * Filter recommendations based on user preferences and constraints
   * @param recommendations - Combined recommendations
   * @param userId - User ID
   * @param excludeCart - Whether to exclude cart items
   * @param categories - Category filters
   * @returns Promise<RecommendationResult[]>
   */
  private async filterRecommendations(
    recommendations: Map<string, RecommendationCandidate>,
    userId: string,
    excludeCart: boolean,
    categories: string[]
  ): Promise<RecommendationResult[]> {
    let filtered = Array.from(recommendations.values());

    // Filter by categories if specified
    if (categories.length > 0) {
      filtered = filtered.filter(rec => 
        categories.includes(rec.product.category)
      );
    }

    // Exclude cart items if requested
    if (excludeCart) {
      try {
        const cart = await Cart.findOne({ userId: new mongoose.Types.ObjectId(userId) })
          .select('items.productId')
          .lean();
        
        if (cart && cart.items) {
          const cartProductIds = cart.items.map(item => item.productId.toString());
          filtered = filtered.filter(rec => 
            !cartProductIds.includes(rec.productId.toString())
          );
        }
      } catch (error) {
        console.error('Error filtering cart items:', error);
        // Continue without cart filtering if there's an error
      }
    }

    return filtered.map(rec => ({
      productId: rec.productId,
      product: rec.product,
      score: rec.score,
      confidence: rec.confidence,
      algorithm: rec.algorithm
    }));
  }

  /**
   * Get fallback recommendations for users with no activity
   * @param limit - Number of recommendations
   * @param categories - Category filters
   * @returns Promise<RecommendationResult[]>
   */
  private async getFallbackRecommendations(
    limit: number, 
    categories: string[]
  ): Promise<RecommendationResult[]> {
    try {
      const filter: any = { isFeatured: true, isActive: true, stock: { $gt: 0 } };
      
      if (categories.length > 0) {
        filter.category = { $in: categories };
      }

      const products = await Product.find(filter)
        .sort({ rating: -1, viewCount: -1 })
        .limit(limit)
        .populate('supplierId')
        .lean();

      return products.map((product, index) => ({
        productId: product._id,
        product,
        score: (limit - index) / limit,
        confidence: 0.5,
        algorithm: 'fallback-featured'
      }));
    } catch (error) {
      console.error('Error getting fallback recommendations:', error);
      return [];
    }
  }

  // Helper methods will be continued in the next part...
  
  /**
   * Find users with similar viewing patterns
   * @param userId - Current user ID
   * @param viewedProducts - User's viewed products
   * @returns Promise<{userId: string, similarity: number}[]>
   */
  private async findSimilarUsers(
    userId: string, 
    viewedProducts: any[]
  ): Promise<{ userId: string; similarity: number }[]> {
    try {
      const viewedProductIds = viewedProducts.map(p => p._id);
      
      if (viewedProductIds.length === 0) {
        return [];
      }

      // Find users who viewed similar products
      const similarUsers = await BrowsingHistory.aggregate([
        {
          $match: {
            userId: { $ne: new mongoose.Types.ObjectId(userId) },
            productId: { $in: viewedProductIds },
            interactionType: 'view'
          }
        },
        {
          $group: {
            _id: '$userId',
            commonProducts: { $addToSet: '$productId' },
            totalViews: { $sum: 1 }
          }
        },
        {
          $addFields: {
            similarity: {
              $divide: [
                { $size: '$commonProducts' },
                { $add: [viewedProductIds.length, '$totalViews'] }
              ]
            }
          }
        },
        {
          $match: {
            similarity: { $gte: 0.1 } // Minimum 10% similarity
          }
        },
        {
          $sort: { similarity: -1 }
        },
        {
          $limit: 50
        }
      ]);

      return similarUsers.map(user => ({
        userId: user._id.toString(),
        similarity: user.similarity
      }));
    } catch (error) {
      console.error('Error finding similar users:', error);
      return [];
    }
  }

  /**
   * Calculate category preferences from user history
   * @param browsingHistory - User's browsing history
   * @param purchaseHistory - User's purchase history
   * @returns Category preferences object
   */
  private calculateCategoryPreferences(
    browsingHistory: any[], 
    purchaseHistory: any[]
  ): Record<string, number> {
    const preferences: Record<string, number> = {};
    
    // Weight purchases higher than views
    browsingHistory.forEach(item => {
      const category = item.productId?.category;
      if (category) {
        preferences[category] = (preferences[category] || 0) + 1;
      }
    });
    
    purchaseHistory.forEach(order => {
      order.items.forEach((item: any) => {
        const category = item.productId?.category;
        if (category) {
          preferences[category] = (preferences[category] || 0) + 3; // Higher weight
        }
      });
    });
    
    // Normalize scores
    const maxScore = Math.max(...Object.values(preferences));
    if (maxScore > 0) {
      Object.keys(preferences).forEach(key => {
        preferences[key] = preferences[key] / maxScore;
      });
    }
    
    return preferences;
  }

  /**
   * Calculate price range preferences from user history
   * @param browsingHistory - User's browsing history
   * @param purchaseHistory - User's purchase history
   * @returns Price range object
   */
  private calculatePriceRange(
    browsingHistory: any[], 
    purchaseHistory: any[]
  ): { min: number; max: number; average: number } {
    const prices: number[] = [];
    
    browsingHistory.forEach(item => {
      if (item.productId?.price) {
        prices.push(item.productId.price);
      }
    });
    
    purchaseHistory.forEach(order => {
      order.items.forEach((item: any) => {
        if (item.productId?.price) {
          prices.push(item.productId.price);
        }
      });
    });
    
    if (prices.length === 0) {
      return { min: 0, max: 0, average: 0 };
    }
    
    prices.sort((a, b) => a - b);
    const min = prices[Math.floor(prices.length * 0.1)]; // 10th percentile
    const max = prices[Math.floor(prices.length * 0.9)]; // 90th percentile
    const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    return { min, max, average };
  }

  /**
   * Calculate brand preferences from user history
   * @param browsingHistory - User's browsing history
   * @param purchaseHistory - User's purchase history
   * @returns Brand preferences object
   */
  private calculateBrandPreferences(
    browsingHistory: any[], 
    purchaseHistory: any[]
  ): Record<string, number> {
    const preferences: Record<string, number> = {};
    
    // Extract brand from supplier information
    browsingHistory.forEach(item => {
      const brand = item.productId?.supplierId?.name;
      if (brand) {
        preferences[brand] = (preferences[brand] || 0) + 1;
      }
    });
    
    purchaseHistory.forEach(order => {
      order.items.forEach((item: any) => {
        const brand = item.productId?.supplierId?.name;
        if (brand) {
          preferences[brand] = (preferences[brand] || 0) + 3;
        }
      });
    });
    
    return preferences;
  }

  /**
   * Calculate price score based on user preferences
   * @param productPrice - Product price
   * @param userMinPrice - User's minimum price preference
   * @param userMaxPrice - User's maximum price preference
   * @returns Price score (0-1)
   */
  private calculatePriceScore(
    productPrice: number, 
    userMinPrice: number, 
    userMaxPrice: number
  ): number {
    const userAverage = (userMinPrice + userMaxPrice) / 2;
    const userRange = userMaxPrice - userMinPrice;
    
    if (userRange === 0) return 1;
    
    const distance = Math.abs(productPrice - userAverage);
    const normalizedDistance = distance / (userRange / 2);
    
    return Math.max(0, 1 - normalizedDistance);
  }

  /**
   * Generate reason for recommendation
   * @param recommendation - Recommendation result
   * @param userProfile - User profile
   * @returns Reason string
   */
  private generateReason(
    recommendation: RecommendationResult, 
    userProfile: UserProfile
  ): string {
    const algorithms = recommendation.algorithm.split(', ');
    
    if (algorithms.includes('collaborative')) {
      return 'Customers with similar interests also viewed this';
    }
    
    if (algorithms.includes('content-based')) {
      const category = recommendation.product.category;
      if (userProfile.categoryPreferences[category]) {
        return `Based on your interest in ${category}`;
      }
      return 'Matches your preferences';
    }
    
    if (algorithms.includes('popularity')) {
      return 'Trending now';
    }
    
    return 'Featured product';
  }

  /**
   * Cache recommendations for a user
   * @param userId - User ID
   * @param recommendations - Recommendations to cache
   */
  private async cacheRecommendations(
    userId: string, 
    recommendations: RecommendationResult[]
  ): Promise<void> {
    try {
      const cacheData = recommendations.map(rec => ({
        productId: rec.productId,
        score: rec.score,
        reason: rec.reason || this.generateReason(rec, { categoryPreferences: {} } as UserProfile)
      }));

      await RecommendationCache.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId) },
        {
          recommendations: cacheData,
          generatedAt: new Date(),
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
          version: 1
        },
        { upsert: true }
      );
    } catch (error) {
      console.error('Error caching recommendations:', error);
      // Don't throw error, caching is optional
    }
  }

  /**
   * Get cached recommendations for a user
   * @param userId - User ID
   * @returns Promise<RecommendationResult[] | null>
   */
  private async getCachedRecommendations(userId: string): Promise<RecommendationResult[] | null> {
    try {
      const cached = await RecommendationCache.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        expiresAt: { $gt: new Date() }
      }).populate('recommendations.productId').lean();

      if (!cached) {
        return null;
      }

      return cached.recommendations.map(rec => ({
        productId: rec.productId._id,
        product: rec.productId,
        score: rec.score,
        confidence: 0.8, // Cached recommendations have high confidence
        algorithm: 'cached',
        reason: rec.reason
      }));
    } catch (error) {
      console.error('Error getting cached recommendations:', error);
      return null;
    }
  }
}

export const recommendationEngine = new RecommendationEngine();
export default recommendationEngine;