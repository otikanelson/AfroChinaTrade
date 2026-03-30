import { productService } from './ProductService';
import { categoryService } from './CategoryService';
import { collectionService } from './CollectionService';
import { productCacheService } from './ProductCacheService';

class PreloadService {
  private isPreloading = false;
  private preloadPromise: Promise<void> | null = null;

  async preloadEssentialData(): Promise<void> {
    if (this.isPreloading || this.preloadPromise) {
      return this.preloadPromise || Promise.resolve();
    }

    this.isPreloading = true;
    this.preloadPromise = this.performPreload();
    
    try {
      await this.preloadPromise;
    } finally {
      this.isPreloading = false;
      this.preloadPromise = null;
    }
  }

  private async performPreload(): Promise<void> {
    try {
      // Preload in parallel for better performance
      const preloadTasks = [
        this.preloadCategories(),
        this.preloadFeaturedProducts(),
        this.preloadTrendingProducts(),
        this.preloadCollections(),
      ];

      await Promise.allSettled(preloadTasks);
    } catch (error) {
      // Silently fail preloading - don't block the UI
    }
  }

  private async preloadCategories(): Promise<void> {
    try {
      const response = await categoryService.getCategories();
      if (response.success && response.data) {
        // Categories are usually cached by the service itself
      }
    } catch (error) {
      // Silently fail
    }
  }

  private async preloadFeaturedProducts(): Promise<void> {
    try {
      // Only preload if not already cached
      if (!productCacheService.getCachedFeaturedProducts()) {
        const response = await productService.getFeaturedProducts(12);
        if (response.success && response.data) {
          productCacheService.cacheFeaturedProducts(response.data);
        }
      }
    } catch (error) {
      // Silently fail
    }
  }

  private async preloadTrendingProducts(): Promise<void> {
    try {
      // Only preload if not already cached
      if (!productCacheService.getCachedTrendingProducts()) {
        const response = await productService.getTrendingProducts('7d', 1, 12);
        if (response.success && response.data) {
          const trendingData = Array.isArray(response.data) 
            ? response.data 
            : response.data.products || [];
          productCacheService.cacheTrendingProducts(trendingData);
        }
      }
    } catch (error) {
      // Silently fail
    }
  }

  private async preloadCollections(): Promise<void> {
    try {
      const response = await collectionService.getActiveCollections();
      if (response.success && response.data) {
        // Preload first few collection products
        const collections = response.data.slice(0, 3); // Only first 3 collections
        
        const collectionTasks = collections.map(async (collection) => {
          try {
            if (!productCacheService.getCachedCollectionProducts(collection.id)) {
              const productsResponse = await collectionService.getCollectionProducts(collection.id, 1, 6);
              if (productsResponse.success && productsResponse.data) {
                const products = productsResponse.data.products || [];
                productCacheService.cacheCollectionProducts(collection.id, products);
              }
            }
          } catch (error) {
            // Silently fail individual collection
          }
        });

        await Promise.allSettled(collectionTasks);
      }
    } catch (error) {
      // Silently fail
    }
  }

  // Preload data for specific sections
  async preloadBuyNowData(): Promise<void> {
    try {
      const tasks = [
        this.preloadSellerFavorites(),
        this.preloadDiscountedProducts(),
      ];

      await Promise.allSettled(tasks);
    } catch (error) {
      // Silently fail
    }
  }

  private async preloadSellerFavorites(): Promise<void> {
    try {
      if (!productCacheService.getCachedSellerFavorites()) {
        const response = await productService.getSellerFavorites(1, 12);
        if (response.success && response.data) {
          const sellerData = Array.isArray(response.data) 
            ? response.data 
            : response.data.products || [];
          productCacheService.cacheSellerFavorites(sellerData);
        }
      }
    } catch (error) {
      // Silently fail
    }
  }

  private async preloadDiscountedProducts(): Promise<void> {
    try {
      if (!productCacheService.getCachedDiscountedProducts()) {
        const response = await productService.getProducts({ limit: 12, minPrice: 1, sortBy: 'price_desc' as any });
        if (response.success && response.data) {
          const products = Array.isArray(response.data) ? response.data : response.data || [];
          const withDiscounts = products.filter((product: any) => product.discount && product.discount > 0);
          productCacheService.cacheDiscountedProducts(withDiscounts);
        }
      }
    } catch (error) {
      // Silently fail
    }
  }

  // Check if essential data is already cached
  isEssentialDataCached(): boolean {
    return !!(
      productCacheService.getCachedFeaturedProducts() &&
      productCacheService.getCachedTrendingProducts()
    );
  }

  // Get cache statistics
  getCacheStats() {
    return productCacheService.getStats();
  }

  // Clear all cached data
  clearCache(): void {
    productCacheService.clear();
  }
}

export const preloadService = new PreloadService();