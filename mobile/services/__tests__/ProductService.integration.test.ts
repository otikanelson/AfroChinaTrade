/**
 * Integration tests for ProductService API client
 * Tests the mobile app's integration with the backend API
 */

import { productService } from '../ProductService';

// Mock the API client for testing
jest.mock('../api/apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import apiClient from '../api/apiClient';

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('ProductService Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should fetch products with correct parameters', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          description: 'Test Description',
          price: 100,
          stock: 10,
          category: 'electronics',
          images: ['image1.jpg'],
          rating: 4.5,
          reviewCount: 10,
          isFeatured: true,
        },
      ];

      mockApiClient.get.mockResolvedValue({
        success: true,
        data: mockProducts,
      });

      const result = await productService.getProducts({
        page: 1,
        limit: 20,
        category: 'electronics',
        minPrice: 50,
        maxPrice: 200,
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/products?page=1&limit=20&category=electronics&minPrice=50&maxPrice=200'
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProducts);
    });

    it('should handle API errors gracefully', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(productService.getProducts()).rejects.toThrow('Network error');
    });
  });

  describe('getProductById', () => {
    it('should fetch single product by ID', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'electronics',
        images: ['image1.jpg'],
        rating: 4.5,
        reviewCount: 10,
        isFeatured: true,
      };

      mockApiClient.get.mockResolvedValue({
        success: true,
        data: mockProduct,
      });

      const result = await productService.getProductById('1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/products/1');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProduct);
    });
  });

  describe('createProduct', () => {
    it('should create product with correct data', async () => {
      const productData = {
        name: 'New Product',
        description: 'New Description',
        price: 150,
        stock: 5,
        categoryId: 'electronics',
        images: ['image1.jpg'],
        isFeatured: false,
        isActive: true,
      };

      const mockCreatedProduct = {
        id: '2',
        ...productData,
        rating: 0,
        reviewCount: 0,
      };

      mockApiClient.post.mockResolvedValue({
        success: true,
        data: mockCreatedProduct,
      });

      const result = await productService.createProduct(productData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/products', productData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedProduct);
    });
  });

  describe('updateProduct', () => {
    it('should update product with correct data', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 200,
      };

      const mockUpdatedProduct = {
        id: '1',
        name: 'Updated Product',
        description: 'Test Description',
        price: 200,
        stock: 10,
        category: 'electronics',
        images: ['image1.jpg'],
        rating: 4.5,
        reviewCount: 10,
        isFeatured: true,
      };

      mockApiClient.put.mockResolvedValue({
        success: true,
        data: mockUpdatedProduct,
      });

      const result = await productService.updateProduct('1', updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/products/1', updateData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedProduct);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product by ID', async () => {
      mockApiClient.delete.mockResolvedValue({
        success: true,
        data: undefined,
      });

      const result = await productService.deleteProduct('1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/products/1');
      expect(result.success).toBe(true);
    });
  });

  describe('getFeaturedProducts', () => {
    it('should fetch featured products with limit', async () => {
      const mockFeaturedProducts = [
        {
          id: '1',
          name: 'Featured Product',
          description: 'Featured Description',
          price: 100,
          stock: 10,
          category: 'electronics',
          images: ['image1.jpg'],
          rating: 4.5,
          reviewCount: 10,
          isFeatured: true,
        },
      ];

      mockApiClient.get.mockResolvedValue({
        success: true,
        data: mockFeaturedProducts,
      });

      const result = await productService.getFeaturedProducts(10);

      expect(mockApiClient.get).toHaveBeenCalledWith('/products/featured?limit=10');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFeaturedProducts);
    });
  });

  describe('searchProducts', () => {
    it('should search products with query and filters', async () => {
      const mockSearchResults = [
        {
          id: '1',
          name: 'Search Result',
          description: 'Search Description',
          price: 100,
          stock: 10,
          category: 'electronics',
          images: ['image1.jpg'],
          rating: 4.5,
          reviewCount: 10,
          isFeatured: false,
        },
      ];

      mockApiClient.get.mockResolvedValue({
        success: true,
        data: mockSearchResults,
      });

      const result = await productService.searchProducts({
        search: 'test query',
        category: 'electronics',
        minPrice: 50,
        maxPrice: 200,
        page: 1,
        limit: 20,
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/search/products?q=test+query&page=1&limit=20&category=electronics&minPrice=50&maxPrice=200'
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSearchResults);
    });
  });
});