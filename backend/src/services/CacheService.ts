/**
 * Basic CacheService implementation
 * For production, this should be enhanced with Redis integration
 * Currently uses in-memory caching for development
 */

interface CacheItem {
  data: any;
  expires: number;
}

export class CacheService {
  private memoryCache: Map<string, CacheItem> = new Map();
  private defaultTTL = 3600; // 1 hour in seconds

  constructor() {
    // Start cleanup timer for memory cache
    this.startCleanupTimer();
  }

  /**
   * Get item from cache
   * @param key - Cache key
   * @returns Promise<T | null>
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Check memory cache first
      const memoryResult = this.memoryCache.get(key);
      if (memoryResult && memoryResult.expires > Date.now()) {
        return memoryResult.data;
      }

      // Remove expired item
      if (memoryResult) {
        this.memoryCache.delete(key);
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set item in cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in seconds
   */
  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const expires = Date.now() + (ttl * 1000);
      this.memoryCache.set(key, { data: value, expires });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete item from cache
   * @param key - Cache key
   */
  async delete(key: string): Promise<void> {
    try {
      this.memoryCache.delete(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Delete items matching pattern
   * @param pattern - Pattern to match (simple string matching for now)
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      const keysToDelete: string[] = [];
      
      for (const key of this.memoryCache.keys()) {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => this.memoryCache.delete(key));
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    try {
      this.memoryCache.clear();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let validItems = 0;
    let expiredItems = 0;

    for (const item of this.memoryCache.values()) {
      if (item.expires > now) {
        validItems++;
      } else {
        expiredItems++;
      }
    }

    return {
      totalItems: this.memoryCache.size,
      validItems,
      expiredItems,
      memoryUsage: process.memoryUsage()
    };
  }

  /**
   * Start cleanup timer for expired items
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];

      for (const [key, item] of this.memoryCache.entries()) {
        if (item.expires <= now) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => this.memoryCache.delete(key));
      
      if (keysToDelete.length > 0) {
        console.log(`Cache cleanup: removed ${keysToDelete.length} expired items`);
      }
    }, 60000); // Clean every minute
  }

  // Cache keys for different data types
  static keys = {
    trending: (timeframe: string) => `trending:${timeframe}`,
    recommendations: (userId: string) => `recommendations:${userId}`,
    categoryProducts: (category: string, page: number) => `category:${category}:page:${page}`,
    featuredProducts: (page: number) => `featured:page:${page}`,
    productDetails: (productId: string) => `product:${productId}`,
    userHistory: (userId: string) => `history:${userId}`,
    sellerFavorites: (page: number) => `seller_favorites:page:${page}`,
    productCollection: (type: string, page: number, filters: string) => `collection:${type}:page:${page}:${filters}`
  };
}

export const cacheService = new CacheService();
export default cacheService;