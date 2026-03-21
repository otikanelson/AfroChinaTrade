import { ApiResponse } from './api/apiClient';
import { Product } from '../types/product';
import { mockProducts, mockCategories } from '../data/mockData';
import { ProductListParams } from './ProductService';

class MockProductService {
  private readonly delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  /**
   * Get paginated list of products with filtering and sorting
   */
  async getProducts(params: ProductListParams = {}): Promise<ApiResponse<Product[]>> {
    await this.delay(500); // Simulate network delay

    let filteredProducts = [...mockProducts];

    // Apply filters
    if (params.category && params.category !== 'All') {
      filteredProducts = filteredProducts.filter(p => p.category === params.category);
    }

    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (params.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price >= params.minPrice!);
    }

    if (params.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price <= params.maxPrice!);
    }

    if (params.minRating !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.rating >= params.minRating!);
    }

    if (params.inStock) {
      filteredProducts = filteredProducts.filter(p => p.stock > 0);
    }

    if (params.isFeatured) {
      filteredProducts = filteredProducts.filter(p => p.isFeatured);
    }

    // Apply sorting
    if (params.sortBy) {
      filteredProducts.sort((a, b) => {
        const order = params.sortOrder === 'desc' ? -1 : 1;
        
        switch (params.sortBy) {
          case 'price':
            return (a.price - b.price) * order;
          case 'rating':
            return (a.rating - b.rating) * order;
          case 'name':
            return a.name.localeCompare(b.name) * order;
          default:
            return 0;
        }
      });
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginatedProducts,
      pagination: {
        page,
        limit,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit)
      }
    };
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    await this.delay(300);

    const product = mockProducts.find(p => p.id === id);
    
    if (!product) {
      return {
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      };
    }

    return {
      success: true,
      data: product
    };
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit?: number): Promise<ApiResponse<Product[]>> {
    await this.delay(400);

    let featuredProducts = mockProducts.filter(p => p.isFeatured);
    
    if (limit) {
      featuredProducts = featuredProducts.slice(0, limit);
    }

    return {
      success: true,
      data: featuredProducts
    };
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: string, params: ProductListParams = {}): Promise<ApiResponse<Product[]>> {
    const categoryName = mockCategories.find(c => c.id === categoryId)?.name;
    
    if (!categoryName) {
      return {
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found'
        }
      };
    }

    return this.getProducts({ ...params, category: categoryName });
  }

  /**
   * Search products with advanced filtering
   */
  async searchProducts(params: ProductListParams): Promise<ApiResponse<Product[]>> {
    return this.getProducts(params);
  }
}

// Export singleton instance
export const mockProductService = new MockProductService();
export default mockProductService;