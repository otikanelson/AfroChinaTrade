import apiClient, { ApiResponse } from './api/apiClient';
import { Product, Category } from '../types/product';

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  search?: string;
  tags?: string[];
  isFeatured?: boolean;
  isSellerFavorite?: boolean;
  supplierId?: string;
}

export interface ProductSortOptions {
  sortBy?: 'price' | 'rating' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductListParams extends ProductFilters, ProductSortOptions {
  page?: number;
  limit?: number;
  _t?: number; // Cache busting timestamp
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  categoryId: string;
  supplierId?: string;
  stock: number;
  images?: string[];
  tags?: string[];
  specifications?: Record<string, any>;
  isFeatured?: boolean;
  isActive?: boolean;
  isSellerFavorite?: boolean;
  policies?: Record<string, any>;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

class ProductService {
  private readonly basePath = '/products';

  /**
   * Get paginated list of products with filtering and sorting
   */
  async getProducts(params: ProductListParams = {}): Promise<ApiResponse<Product[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      // Add filters
      if (params.category) queryParams.append('category', params.category);
      if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
      if (params.minRating !== undefined) queryParams.append('minRating', params.minRating.toString());
      if (params.inStock !== undefined) queryParams.append('inStock', params.inStock.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.isFeatured !== undefined) queryParams.append('isFeatured', params.isFeatured.toString());
      if (params.isSellerFavorite !== undefined) queryParams.append('isSellerFavorite', params.isSellerFavorite.toString());
      
      // Add tags
      if (params.tags && params.tags.length > 0) {
        params.tags.forEach(tag => queryParams.append('tags', tag));
      }
      
      // Add sorting
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const queryString = queryParams.toString();
      const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
      
      console.log('📦 Fetching products from:', url);
      const response = await apiClient.get<Product[]>(url);
      console.log('📦 Products response:', response.success ? `${response.data?.length || 0} products` : response.error?.message);
      
      return response;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return apiClient.get<Product>(`${this.basePath}/${id}`);
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit?: number): Promise<ApiResponse<Product[]>> {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    
    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}/featured?${queryString}` : `${this.basePath}/featured`;
    
    return apiClient.get<Product[]>(url);
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: string, params: ProductListParams = {}): Promise<ApiResponse<Product[]>> {
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    // Add other filters (excluding category since it's in the path)
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.minRating !== undefined) queryParams.append('minRating', params.minRating.toString());
    if (params.inStock !== undefined) queryParams.append('inStock', params.inStock.toString());
    if (params.search) queryParams.append('search', params.search);
    
    // Add sorting
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const url = queryString ? 
      `${this.basePath}/category/${categoryId}?${queryString}` : 
      `${this.basePath}/category/${categoryId}`;
    
    return apiClient.get<Product[]>(url);
  }

  /**
   * Create a new product (admin only)
   */
  async createProduct(productData: CreateProductData): Promise<ApiResponse<Product>> {
    // Transform frontend data to match backend expectations
    const backendData = {
      ...productData,
      category: productData.categoryId, // Backend expects 'category'
      categoryId: undefined, // Remove categoryId to avoid confusion
    };
    
    // Remove undefined fields
    const cleanData = Object.fromEntries(
      Object.entries(backendData).filter(([_, value]) => value !== undefined)
    );
    
    return apiClient.post<Product>(this.basePath, cleanData);
  }

  /**
   * Update an existing product (admin only)
   */
  async updateProduct(id: string, productData: Partial<CreateProductData>): Promise<ApiResponse<Product>> {
    // Transform frontend data to match backend expectations
    const backendData = {
      ...productData,
      category: productData.categoryId, // Backend expects 'category'
      categoryId: undefined, // Remove categoryId to avoid confusion
    };
    
    // Remove undefined fields
    const cleanData = Object.fromEntries(
      Object.entries(backendData).filter(([_, value]) => value !== undefined)
    );
    
    return apiClient.put<Product>(`${this.basePath}/${id}`, cleanData);
  }

  /**
   * Delete a product (admin only)
   */
  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Search products with advanced filtering
   */
  async searchProducts(params: ProductListParams): Promise<ApiResponse<Product[]>> {
    const queryParams = new URLSearchParams();
    
    // Add search query
    if (params.search) queryParams.append('q', params.search);
    
    // Add pagination
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    // Add filters
    if (params.category) queryParams.append('categories', params.category);
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.minRating !== undefined) queryParams.append('minRating', params.minRating.toString());
    if (params.inStock !== undefined) queryParams.append('inStock', params.inStock.toString());
    
    // Add sorting
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const url = queryString ? `/search/products?${queryString}` : '/search/products';
    
    const response = await apiClient.get<{ products: Product[] }>(url);
    
    // Transform the nested response to match the expected format
    if (response.success && response.data?.products) {
      return {
        ...response,
        data: response.data.products
      };
    }
    
    return response as unknown as ApiResponse<Product[]>;
  }

  /**
   * Upload product images
   */
  async uploadProductImages(
    productId: string, 
    images: Array<{
      uri: string;
      type: string;
      name: string;
    }>
  ): Promise<ApiResponse<{ imageUrls: string[] }>> {
    const uploadPromises = images.map(image => 
      apiClient.uploadFile('/upload/image', image, { productId })
    );

    try {
      const responses = await Promise.all(uploadPromises);
      const imageUrls = responses.map(response => response.data?.imageUrl).filter(Boolean);
      
      return {
        success: true,
        data: { imageUrls }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get product recommendations based on a product
   */
  async getProductsBySupplier(supplierId: string, params: ProductListParams = {}): Promise<ApiResponse<Product[]>> {
    const queryParams = new URLSearchParams();
    
    // Add supplier filter
    queryParams.append('supplierId', supplierId);
    
    // Add other filters
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.category) queryParams.append('category', params.category);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.minRating) queryParams.append('minRating', params.minRating.toString());
    if (params.inStock) queryParams.append('inStock', params.inStock.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.tags && params.tags.length > 0) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }
    if (params.isFeatured !== undefined) queryParams.append('isFeatured', params.isFeatured.toString());

    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    
    return apiClient.get<Product[]>(url);
  }

  async getRecommendations(productId: string, limit = 10): Promise<ApiResponse<Product[]>> {
    return apiClient.get<Product[]>(`${this.basePath}/${productId}/recommendations?limit=${limit}`);
  }

  /**
   * Get recently viewed products (from local storage)
   */
  async getRecentlyViewed(): Promise<Product[]> {
    // This would typically be stored locally and then fetched from API
    // For now, return empty array - implement local storage logic as needed
    return [];
  }

  /**
   * Add product to recently viewed (local storage)
   */
  async addToRecentlyViewed(product: Product): Promise<void> {
    // Implement local storage logic for recently viewed products
    // This is typically stored client-side for privacy
  }

  /**
   * Check product availability
   */
  async checkAvailability(productId: string, quantity: number = 1): Promise<ApiResponse<{ available: boolean; stock: number }>> {
    return apiClient.get<{ available: boolean; stock: number }>(`${this.basePath}/${productId}/availability?quantity=${quantity}`);
  }

  // Admin-specific methods

  /**
   * Get all products for admin (including inactive ones)
   */
  async getAdminProducts(params: ProductListParams & { status?: 'active' | 'inactive' } = {}): Promise<ApiResponse<Product[]>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.category) queryParams.append('category', params.category);
    if (params.status) queryParams.append('status', params.status);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    
    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}/admin/all?${queryString}` : `${this.basePath}/admin/all`;
    
    return apiClient.get<Product[]>(url);
  }

  /**
   * Toggle product active status
   */
  async toggleProductStatus(productId: string, isActive: boolean): Promise<ApiResponse<Product>> {
    return apiClient.patch<Product>(`${this.basePath}/${productId}/status`, { isActive });
  }

  // Enhanced Product Discovery Methods

  /**
   * Get products by collection type
   */
  async getProductCollection(
    collectionType: 'featured' | 'trending' | 'seller_favorites' | 'all',
    params: ProductListParams & { timeframe?: string; _t?: number } = {}
  ): Promise<ApiResponse<{ products: Product[]; pagination: any; metadata: any }>> {
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    // Add cache busting timestamp
    if (params._t) queryParams.append('_t', params._t.toString());
    
    // Add filters
    if (params.category) queryParams.append('category', params.category);
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.minRating !== undefined) queryParams.append('minRating', params.minRating.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    // Add timeframe for trending collections
    if (params.timeframe && collectionType === 'trending') {
      queryParams.append('timeframe', params.timeframe);
    }
    
    // Add tags
    if (params.tags && params.tags.length > 0) {
      params.tags.forEach(tag => queryParams.append('tags', tag));
    }

    const queryString = queryParams.toString();
    const url = queryString ? 
      `/product-collections/collections/${collectionType}?${queryString}` : 
      `/product-collections/collections/${collectionType}`;
    
    return apiClient.get<{ products: Product[]; pagination: any; metadata: any }>(url);
  }

  /**
   * Get trending products with timeframe
   */
  async getTrendingProducts(
    timeframe: '1h' | '24h' | '7d' | '30d' = '24h',
    page: number = 1,
    limit: number = 20,
    filters: ProductFilters = {}
  ): Promise<ApiResponse<{ products: Product[]; pagination: any; metadata: any }>> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('timeframe', timeframe);
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    // Add filters
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.minPrice !== undefined) queryParams.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString());
    if (filters.minRating !== undefined) queryParams.append('minRating', filters.minRating.toString());

    const queryString = queryParams.toString();
    const url = `/product-collections/trending?${queryString}`;
    
    return apiClient.get<{ products: Product[]; pagination: any; metadata: any }>(url);
  }

  /**
   * Get seller favorite products
   */
  async getSellerFavorites(
    page: number = 1,
    limit: number = 20,
    filters: ProductFilters = {}
  ): Promise<ApiResponse<{ products: Product[]; pagination: any; metadata: any }>> {
    return this.getProductCollection('seller_favorites', { 
      page, 
      limit, 
      ...filters 
    });
  }

  /**
   * Get recommended products for a user
   */
  async getRecommendedProducts(
    userId: string,
    page: number = 1,
    limit: number = 20,
    excludeCart: boolean = true
  ): Promise<ApiResponse<{ products: Product[]; pagination: any; metadata: any }>> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (excludeCart) queryParams.append('excludeCart', 'true');

    const queryString = queryParams.toString();
    const url = `/products/recommendations/${userId}?${queryString}`;
    
    return apiClient.get<{ products: Product[]; pagination: any; metadata: any }>(url);
  }

  /**
   * Get most sold products based on order data
   */
  async getMostSoldProducts(
    limit: number = 20,
    timeframe: '7d' | '30d' | '90d' | 'all' = '30d'
  ): Promise<ApiResponse<Product[]>> {
    const queryParams = new URLSearchParams();
    
    queryParams.append('limit', limit.toString());
    queryParams.append('timeframe', timeframe);

    const queryString = queryParams.toString();
    const url = `/analytics/most-sold-products?${queryString}`;
    
    return apiClient.get<Product[]>(url);
  }
}

// Export singleton instance
export const productService = new ProductService();
export default productService;