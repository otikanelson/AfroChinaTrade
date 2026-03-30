import { Product } from '../types/product';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class ProductCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_CACHE_TIME = 5 * 60 * 1000; // 5 minutes
  private readonly FEATURED_CACHE_TIME = 10 * 60 * 1000; // 10 minutes for featured products
  private readonly TRENDING_CACHE_TIME = 15 * 60 * 1000; // 15 minutes for trending

  private generateKey(endpoint: string, params?: any): string {
    if (!params) return endpoint;
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as any);
    return `${endpoint}_${JSON.stringify(sortedParams)}`;
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.expiresIn;
  }

  set<T>(key: string, data: T, customCacheTime?: number): void {
    const cacheTime = customCacheTime || this.DEFAULT_CACHE_TIME;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: cacheTime,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  // Specific cache methods for different product types
  cacheFeaturedProducts(products: Product[]): void {
    this.set('featured_products', products, this.FEATURED_CACHE_TIME);
  }

  getCachedFeaturedProducts(): Product[] | null {
    return this.get<Product[]>('featured_products');
  }

  cacheTrendingProducts(products: Product[], period: string = '7d'): void {
    this.set(`trending_products_${period}`, products, this.TRENDING_CACHE_TIME);
  }

  getCachedTrendingProducts(period: string = '7d'): Product[] | null {
    return this.get<Product[]>(`trending_products_${period}`);
  }

  cacheSellerFavorites(products: Product[]): void {
    this.set('seller_favorites', products, this.FEATURED_CACHE_TIME);
  }

  getCachedSellerFavorites(): Product[] | null {
    return this.get<Product[]>('seller_favorites');
  }

  cacheDiscountedProducts(products: Product[]): void {
    this.set('discounted_products', products, this.DEFAULT_CACHE_TIME);
  }

  getCachedDiscountedProducts(): Product[] | null {
    return this.get<Product[]>('discounted_products');
  }

  cacheAllProducts(products: Product[], params?: any): void {
    const key = this.generateKey('all_products', params);
    this.set(key, products);
  }

  getCachedAllProducts(params?: any): Product[] | null {
    const key = this.generateKey('all_products', params);
    return this.get<Product[]>(key);
  }

  cacheCollectionProducts(collectionId: string, products: Product[]): void {
    this.set(`collection_${collectionId}`, products);
  }

  getCachedCollectionProducts(collectionId: string): Product[] | null {
    return this.get<Product[]>(`collection_${collectionId}`);
  }

  cacheSearchResults(query: string, products: Product[], params?: any): void {
    const key = this.generateKey(`search_${query}`, params);
    this.set(key, products);
  }

  getCachedSearchResults(query: string, params?: any): Product[] | null {
    const key = this.generateKey(`search_${query}`, params);
    return this.get<Product[]>(key);
  }

  // Cache management
  clear(): void {
    this.cache.clear();
  }

  clearExpired(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): { totalEntries: number; expiredEntries: number } {
    let expiredEntries = 0;
    for (const entry of this.cache.values()) {
      if (this.isExpired(entry)) {
        expiredEntries++;
      }
    }
    return {
      totalEntries: this.cache.size,
      expiredEntries,
    };
  }

  // Preload commonly accessed data
  async preloadEssentialData(productService: any): Promise<void> {
    try {
      // Load featured products in background if not cached
      if (!this.getCachedFeaturedProducts()) {
        const featuredResponse = await productService.getFeaturedProducts(12);
        if (featuredResponse.success && featuredResponse.data) {
          this.cacheFeaturedProducts(featuredResponse.data);
        }
      }

      // Load trending products in background if not cached
      if (!this.getCachedTrendingProducts()) {
        const trendingResponse = await productService.getTrendingProducts('7d', 1, 12);
        if (trendingResponse.success && trendingResponse.data) {
          const trendingData = Array.isArray(trendingResponse.data) 
            ? trendingResponse.data 
            : trendingResponse.data.products || [];
          this.cacheTrendingProducts(trendingData);
        }
      }
    } catch (error) {
      // Silently fail preloading - don't block the UI
    }
  }
}

export const productCacheService = new ProductCacheService();

// Clean up expired entries every 10 minutes
setInterval(() => {
  productCacheService.clearExpired();
}, 10 * 60 * 1000);