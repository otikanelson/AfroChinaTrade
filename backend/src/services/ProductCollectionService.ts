import { Product, BrowsingHistory } from '../models';
import { cacheService, CacheService } from './CacheService';
import { getDatabaseStatus } from '../config/database';
import mongoose from 'mongoose';

interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  search?: string;
  tags?: string[];
  isFeatured?: boolean;
  supplierId?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ProductResponse {
  status: 'success' | 'error';
  data: {
    products: any[];
    pagination: Pagination;
    metadata: {
      collectionType: string;
      generatedAt: string;
      cached: boolean;
    };
  };
}

export class ProductCollectionService {
  private cacheTTL = {
    trending: 1800,      // 30 minutes
    featured: 3600,      // 1 hour
    sellerFavorites: 3600, // 1 hour
    all: 900            // 15 minutes
  };
  /**
   * Get featured products
   * @param page - Page number
   * @param limit - Items per page
   * @param filters - Additional filters
   * @returns Promise<ProductResponse>
   */
  async getFeaturedProducts(
    page: number = 1,
    limit: number = 20,
    filters: ProductFilters = {}
  ): Promise<ProductResponse> {
    try {
      // Check database connection first
      const dbStatus = getDatabaseStatus();
      if (dbStatus !== 'connected') {
        console.warn('⚠️  Database not connected, returning empty featured products');
        return {
          status: 'error',
          data: {
            products: [],
            pagination: {
              page,
              limit,
              total: 0,
              pages: 0,
              hasNext: false,
              hasPrev: false
            },
            metadata: {
              collectionType: 'featured',
              generatedAt: new Date().toISOString(),
              cached: false
            }
          }
        };
      }

      const skip = (page - 1) * limit;
      
      // Build filter object
      const filter: any = { 
        isFeatured: true, 
        isActive: true,
        stock: { $gt: 0 }
      };

      // Apply additional filters
      this.applyFilters(filter, filters);

      // Execute query with timeout handling
      const queryPromise = Promise.all([
        Product.find(filter)
          .sort({ createdAt: -1, viewCount: -1 })
          .skip(skip)
          .limit(limit)
          .populate('supplierId', 'name email verified rating location responseTime')
          .lean()
          .maxTimeMS(15000), // 15 second timeout
        Product.countDocuments(filter).maxTimeMS(10000) // 10 second timeout
      ]);

      // Add timeout wrapper
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout')), 20000);
      });

      const [products, total] = await Promise.race([queryPromise, timeoutPromise]) as [any[], number];

      const pagination = this.buildPagination(page, limit, total);

      const response: ProductResponse = {
        status: 'success',
        data: {
          products,
          pagination,
          metadata: {
            collectionType: 'featured',
            generatedAt: new Date().toISOString(),
            cached: false
          }
        }
      };

      return response;
    } catch (error) {
      console.error('Error getting featured products:', error);
      
      // Return empty result instead of throwing error
      return {
        status: 'error',
        data: {
          products: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
            hasNext: false,
            hasPrev: false
          },
          metadata: {
            collectionType: 'featured',
            generatedAt: new Date().toISOString(),
            cached: false
          }
        }
      };
    }
  }

  /**
   * Get all products with filtering and pagination
   * @param page - Page number
   * @param limit - Items per page
   * @param filters - Product filters
   * @param sortBy - Sort option
   * @returns Promise<ProductResponse>
   */
  async getAllProducts(
    page: number = 1,
    limit: number = 20,
    filters: ProductFilters = {},
    sortBy: string = 'newest'
  ): Promise<ProductResponse> {
    try {
      const skip = (page - 1) * limit;
      
      // Build filter object
      const filter: any = { 
        isActive: true,
        stock: { $gt: 0 }
      };

      // Apply filters
      this.applyFilters(filter, filters);

      // Build sort object
      const sortObj = this.buildSortObject(sortBy);

      // Execute query
      const [products, total] = await Promise.all([
        Product.find(filter)
          .sort(sortObj)
          .skip(skip)
          .limit(limit)
          .populate('supplierId', 'name email verified rating location responseTime')
          .lean(),
        Product.countDocuments(filter)
      ]);

      const pagination = this.buildPagination(page, limit, total);

      return {
        status: 'success',
        data: {
          products,
          pagination,
          metadata: {
            collectionType: 'all',
            generatedAt: new Date().toISOString(),
            cached: false
          }
        }
      };
    } catch (error) {
      console.error('Error getting all products:', error);
      throw error;
    }
  }

  /**
   * Get seller favorite products
   * @param page - Page number
   * @param limit - Items per page
   * @param filters - Additional filters
   * @returns Promise<ProductResponse>
   */
  async getSellerFavorites(
    page: number = 1,
    limit: number = 20,
    filters: ProductFilters = {}
  ): Promise<ProductResponse> {
    try {
      // Check database connection first
      const dbStatus = getDatabaseStatus();
      if (dbStatus !== 'connected') {
        console.warn('⚠️  Database not connected, returning empty seller favorites');
        return {
          status: 'error',
          data: {
            products: [],
            pagination: {
              page,
              limit,
              total: 0,
              pages: 0,
              hasNext: false,
              hasPrev: false
            },
            metadata: {
              collectionType: 'seller_favorites',
              generatedAt: new Date().toISOString(),
              cached: false
            }
          }
        };
      }

      const skip = (page - 1) * limit;
      
      // Build filter object
      const filter: any = { 
        isSellerFavorite: true, 
        isActive: true,
        stock: { $gt: 0 }
      };

      // Apply additional filters
      this.applyFilters(filter, filters);

      // Execute query with timeout handling
      const queryPromise = Promise.all([
        Product.find(filter)
          .sort({ viewCount: -1, rating: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('supplierId', 'name email verified rating location responseTime')
          .lean()
          .maxTimeMS(15000), // 15 second timeout
        Product.countDocuments(filter).maxTimeMS(10000) // 10 second timeout
      ]);

      // Add timeout wrapper
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout')), 20000);
      });

      const [products, total] = await Promise.race([queryPromise, timeoutPromise]) as [any[], number];

      const pagination = this.buildPagination(page, limit, total);

      const response: ProductResponse = {
        status: 'success',
        data: {
          products,
          pagination,
          metadata: {
            collectionType: 'seller_favorites',
            generatedAt: new Date().toISOString(),
            cached: false
          }
        }
      };

      return response;
    } catch (error) {
      console.error('Error getting seller favorites:', error);
      
      // Return empty result instead of throwing error
      return {
        status: 'error',
        data: {
          products: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
            hasNext: false,
            hasPrev: false
          },
          metadata: {
            collectionType: 'seller_favorites',
            generatedAt: new Date().toISOString(),
            cached: false
          }
        }
      };
    }
  }

  /**
   * Get trending products based on view counts within timeframe
   * @param timeframe - Time period ('1h', '24h', '7d', '30d')
   * @param limit - Number of products to return
   * @param filters - Additional filters
   * @returns Promise<ProductResponse>
   */
  async getTrendingProducts(
    timeframe: string = '24h',
    limit: number = 20,
    filters: ProductFilters = {}
  ): Promise<ProductResponse> {
    try {
      // Check database connection first
      const dbStatus = getDatabaseStatus();
      if (dbStatus !== 'connected') {
        console.warn('⚠️  Database not connected, returning empty trending products');
        return {
          status: 'error',
          data: {
            products: [],
            pagination: {
              page: 1,
              limit,
              total: 0,
              pages: 0,
              hasNext: false,
              hasPrev: false
            },
            metadata: {
              collectionType: 'trending',
              generatedAt: new Date().toISOString(),
              cached: false
            }
          }
        };
      }

      // Create cache key
      const filtersKey = JSON.stringify(filters);
      const cacheKey = CacheService.keys.trending(timeframe) + `:${filtersKey}`;
      
      // Try cache first
      const cached = await cacheService.get<ProductResponse>(cacheKey);
      if (cached) {
        return { ...cached, data: { ...cached.data, metadata: { ...cached.data.metadata, cached: true } } };
      }

      // Calculate timeframe cutoff
      const timeframeDays = {
        '1h': 1/24,
        '24h': 1,
        '7d': 7,
        '30d': 30
      };

      const days = timeframeDays[timeframe as keyof typeof timeframeDays] || 1;
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Build base filter for products
      const productFilter: any = { 
        isActive: true,
        stock: { $gt: 0 }
      };

      // Apply additional filters
      this.applyFilters(productFilter, filters);

      // Get trending products using aggregation pipeline
      const trendingData = await BrowsingHistory.aggregate([
        // Match recent interactions
        {
          $match: {
            interactionType: 'view',
            timestamp: { $gte: cutoffDate }
          }
        },
        // Group by product and calculate metrics
        {
          $group: {
            _id: '$productId',
            viewCount: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' }
          }
        },
        // Calculate trending score
        {
          $addFields: {
            uniqueUserCount: { $size: '$uniqueUsers' },
            trendingScore: {
              $multiply: [
                '$viewCount',
                { $add: [1, { $divide: ['$uniqueUserCount', 10] }] }
              ]
            }
          }
        },
        // Sort by trending score
        { $sort: { trendingScore: -1 } },
        { $limit: limit * 2 }, // Get more to filter later
        // Lookup product details
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: '$product' },
        // Apply product filters
        {
          $match: {
            'product.isActive': true,
            'product.stock': { $gt: 0 },
            ...this.buildProductFilterForAggregation(productFilter)
          }
        },
        // Lookup supplier details
        {
          $lookup: {
            from: 'suppliers',
            localField: 'product.supplierId',
            foreignField: '_id',
            as: 'product.supplierId',
            pipeline: [
              {
                $project: {
                  name: 1,
                  email: 1,
                  verified: 1,
                  rating: 1,
                  location: 1,
                  responseTime: 1
                }
              }
            ]
          }
        },
        {
          $addFields: {
            'product.supplierId': { $arrayElemAt: ['$product.supplierId', 0] }
          }
        },
        // Project final result
        {
          $project: {
            _id: '$product._id',
            name: '$product.name',
            description: '$product.description',
            price: '$product.price',
            currency: '$product.currency',
            images: '$product.images',
            category: '$product.category',
            subcategory: '$product.subcategory',
            rating: '$product.rating',
            reviewCount: '$product.reviewCount',
            stock: '$product.stock',
            tags: '$product.tags',
            specifications: '$product.specifications',
            policies: '$product.policies',
            discount: '$product.discount',
            isNewProduct: '$product.isNewProduct',
            isFeatured: '$product.isFeatured',
            isActive: '$product.isActive',
            viewCount: '$product.viewCount',
            isSellerFavorite: '$product.isSellerFavorite',
            trendingScore: '$trendingScore',
            lastViewedAt: '$product.lastViewedAt',
            supplierId: '$product.supplierId',
            createdAt: '$product.createdAt',
            updatedAt: '$product.updatedAt'
          }
        },
        { $limit: limit }
      ]).maxTimeMS(20000); // 20 second timeout for aggregation

      const response: ProductResponse = {
        status: 'success',
        data: {
          products: trendingData,
          pagination: {
            page: 1,
            limit,
            total: trendingData.length,
            pages: 1,
            hasNext: false,
            hasPrev: false
          },
          metadata: {
            collectionType: 'trending',
            generatedAt: new Date().toISOString(),
            cached: false
          }
        }
      };

      // Cache the result
      await cacheService.set(cacheKey, response, this.cacheTTL.trending);

      return response;
    } catch (error) {
      console.error('Error getting trending products:', error);
      
      // Return empty result instead of throwing error
      return {
        status: 'error',
        data: {
          products: [],
          pagination: {
            page: 1,
            limit,
            total: 0,
            pages: 0,
            hasNext: false,
            hasPrev: false
          },
          metadata: {
            collectionType: 'trending',
            generatedAt: new Date().toISOString(),
            cached: false
          }
        }
      };
    }
  }

  /**
   * Apply filters to the base filter object
   * @param filter - Base filter object
   * @param filters - Filters to apply
   */
  private applyFilters(filter: any, filters: ProductFilters): void {
    if (filters.category) {
      filter.category = filters.category;
    }

    if (filters.supplierId) {
      filter.supplierId = new mongoose.Types.ObjectId(filters.supplierId);
    }

    if (filters.minPrice || filters.maxPrice) {
      filter.price = {};
      if (filters.minPrice) filter.price.$gte = filters.minPrice;
      if (filters.maxPrice) filter.price.$lte = filters.maxPrice;
    }

    if (filters.minRating) {
      filter.rating = { $gte: filters.minRating };
    }

    if (filters.search) {
      filter.$text = { $search: filters.search };
    }

    if (filters.tags && filters.tags.length > 0) {
      filter.tags = { $in: filters.tags };
    }

    if (filters.isFeatured !== undefined) {
      filter.isFeatured = filters.isFeatured;
    }
  }

  /**
   * Build product filter for aggregation pipeline
   * @param filter - Filter object
   * @returns Aggregation filter
   */
  private buildProductFilterForAggregation(filter: any): any {
    const aggFilter: any = {};
    
    if (filter.category) {
      aggFilter['product.category'] = filter.category;
    }
    
    if (filter.supplierId) {
      aggFilter['product.supplierId'] = filter.supplierId;
    }
    
    if (filter.price) {
      aggFilter['product.price'] = filter.price;
    }
    
    if (filter.rating) {
      aggFilter['product.rating'] = filter.rating;
    }
    
    if (filter.tags) {
      aggFilter['product.tags'] = filter.tags;
    }
    
    if (filter.isFeatured !== undefined) {
      aggFilter['product.isFeatured'] = filter.isFeatured;
    }
    
    return aggFilter;
  }

  /**
   * Build sort object based on sort option
   * @param sortBy - Sort option
   * @returns Sort object
   */
  private buildSortObject(sortBy: string): any {
    switch (sortBy) {
      case 'price_asc':
        return { price: 1 };
      case 'price_desc':
        return { price: -1 };
      case 'rating':
        return { rating: -1, reviewCount: -1 };
      case 'trending':
        return { viewCount: -1, trendingScore: -1 };
      case 'newest':
      default:
        return { createdAt: -1 };
    }
  }

  /**
   * Build pagination object
   * @param page - Current page
   * @param limit - Items per page
   * @param total - Total items
   * @returns Pagination object
   */
  private buildPagination(page: number, limit: number, total: number): Pagination {
    const pages = Math.ceil(total / limit);
    
    return {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1
    };
  }
}

export const productCollectionService = new ProductCollectionService();
export default productCollectionService;