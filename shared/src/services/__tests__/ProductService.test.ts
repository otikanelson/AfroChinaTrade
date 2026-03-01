/**
 * Unit tests for ProductService
 * Tests CRUD operations, search, filtering, and error handling
 */

import { ProductService } from '../ProductService';
import { StorageAdapter, STORAGE_KEYS } from '../storage';
import { Product } from '../../types/entities';

// Mock storage adapter for testing
class MockStorageAdapter implements StorageAdapter {
  private storage: Map<string, any> = new Map();

  async get<T>(key: string): Promise<T | null> {
    return this.storage.get(key) || null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.storage.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async getAllKeys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }

  async multiGet<T>(keys: string[]): Promise<Record<string, T>> {
    const result: Record<string, T> = {};
    keys.forEach((key) => {
      const value = this.storage.get(key);
      if (value) result[key] = value;
    });
    return result;
  }

  async multiSet(items: Record<string, any>): Promise<void> {
    Object.entries(items).forEach(([key, value]) => {
      this.storage.set(key, value);
    });
  }
}

describe('ProductService', () => {
  let productService: ProductService;
  let mockStorage: MockStorageAdapter;

  beforeEach(() => {
    mockStorage = new MockStorageAdapter();
    productService = new ProductService(mockStorage);
  });

  describe('createProduct', () => {
    it('should create a product with valid data', async () => {
      const productData = {
        name: 'Test Product',
        description: 'This is a test product description',
        price: 1000,
        images: ['https://example.com/image.jpg'],
        categoryId: 'cat_123',
        supplierId: 'sup_123',
        stock: 10,
        rating: 4.5,
        reviewCount: 10,
      };

      const response = await productService.createProduct(productData);

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.name).toBe(productData.name);
      expect(response.data?.id).toBeDefined();
      expect(response.data?.createdAt).toBeDefined();
      expect(response.data?.updatedAt).toBeDefined();
    });

    it('should reject product with invalid name', async () => {
      const productData = {
        name: 'AB', // Too short
        description: 'This is a test product description',
        price: 1000,
        images: ['https://example.com/image.jpg'],
        categoryId: 'cat_123',
        supplierId: 'sup_123',
        stock: 10,
      };

      const response = await productService.createProduct(productData);

      expect(response.success).toBe(false);
      expect(response.error).toContain('at least 3 characters');
    });

    it('should reject product with invalid price', async () => {
      const productData = {
        name: 'Test Product',
        description: 'This is a test product description',
        price: -100, // Negative price
        images: ['https://example.com/image.jpg'],
        categoryId: 'cat_123',
        supplierId: 'sup_123',
        stock: 10,
      };

      const response = await productService.createProduct(productData);

      expect(response.success).toBe(false);
      expect(response.error).toContain('greater than 0');
    });

    it('should set default rating and reviewCount if not provided', async () => {
      const productData = {
        name: 'Test Product',
        description: 'This is a test product description',
        price: 1000,
        images: ['https://example.com/image.jpg'],
        categoryId: 'cat_123',
        supplierId: 'sup_123',
        stock: 10,
      };

      const response = await productService.createProduct(productData);

      expect(response.success).toBe(true);
      expect(response.data?.rating).toBe(0);
      expect(response.data?.reviewCount).toBe(0);
    });
  });

  describe('getProduct', () => {
    it('should retrieve an existing product', async () => {
      // Create a product first
      const productData = {
        name: 'Test Product',
        description: 'This is a test product description',
        price: 1000,
        images: ['https://example.com/image.jpg'],
        categoryId: 'cat_123',
        supplierId: 'sup_123',
        stock: 10,
      };

      const createResponse = await productService.createProduct(productData);
      const productId = createResponse.data!.id;

      // Retrieve the product
      const getResponse = await productService.getProduct(productId);

      expect(getResponse.success).toBe(true);
      expect(getResponse.data?.id).toBe(productId);
      expect(getResponse.data?.name).toBe(productData.name);
    });

    it('should return error for non-existent product', async () => {
      const response = await productService.getProduct('non_existent_id');

      expect(response.success).toBe(false);
      expect(response.error).toContain('not found');
    });
  });

  describe('getAllProducts', () => {
    it('should return empty array when no products exist', async () => {
      const response = await productService.getAllProducts();

      expect(response.success).toBe(true);
      expect(response.data).toEqual([]);
    });

    it('should return all products', async () => {
      // Create multiple products
      const product1 = {
        name: 'Product 1',
        description: 'Description for product 1',
        price: 1000,
        images: ['https://example.com/image1.jpg'],
        categoryId: 'cat_123',
        supplierId: 'sup_123',
        stock: 10,
      };

      const product2 = {
        name: 'Product 2',
        description: 'Description for product 2',
        price: 2000,
        images: ['https://example.com/image2.jpg'],
        categoryId: 'cat_456',
        supplierId: 'sup_456',
        stock: 20,
      };

      await productService.createProduct(product1);
      await productService.createProduct(product2);

      const response = await productService.getAllProducts();

      expect(response.success).toBe(true);
      expect(response.data?.length).toBe(2);
    });
  });

  describe('getProductsByCategory', () => {
    it('should return products filtered by category', async () => {
      // Create products in different categories
      await productService.createProduct({
        name: 'Product 1',
        description: 'Description 1',
        price: 1000,
        images: ['https://example.com/image1.jpg'],
        categoryId: 'cat_electronics',
        supplierId: 'sup_123',
        stock: 10,
      });

      await productService.createProduct({
        name: 'Product 2',
        description: 'Description 2',
        price: 2000,
        images: ['https://example.com/image2.jpg'],
        categoryId: 'cat_fashion',
        supplierId: 'sup_123',
        stock: 20,
      });

      await productService.createProduct({
        name: 'Product 3',
        description: 'Description 3',
        price: 3000,
        images: ['https://example.com/image3.jpg'],
        categoryId: 'cat_electronics',
        supplierId: 'sup_123',
        stock: 30,
      });

      const response = await productService.getProductsByCategory('cat_electronics');

      expect(response.success).toBe(true);
      expect(response.data?.length).toBe(2);
      expect(response.data?.every((p) => p.categoryId === 'cat_electronics')).toBe(true);
    });
  });

  describe('getProductsBySupplier', () => {
    it('should return products filtered by supplier', async () => {
      // Create products from different suppliers
      await productService.createProduct({
        name: 'Product 1',
        description: 'Description 1',
        price: 1000,
        images: ['https://example.com/image1.jpg'],
        categoryId: 'cat_123',
        supplierId: 'sup_alpha',
        stock: 10,
      });

      await productService.createProduct({
        name: 'Product 2',
        description: 'Description 2',
        price: 2000,
        images: ['https://example.com/image2.jpg'],
        categoryId: 'cat_123',
        supplierId: 'sup_beta',
        stock: 20,
      });

      const response = await productService.getProductsBySupplier('sup_alpha');

      expect(response.success).toBe(true);
      expect(response.data?.length).toBe(1);
      expect(response.data?.[0].supplierId).toBe('sup_alpha');
    });
  });

  describe('searchProducts', () => {
    beforeEach(async () => {
      // Create test products
      await productService.createProduct({
        name: 'Wireless Headphones',
        description: 'High quality bluetooth headphones',
        price: 5000,
        images: ['https://example.com/headphones.jpg'],
        categoryId: 'cat_electronics',
        supplierId: 'sup_123',
        stock: 10,
      });

      await productService.createProduct({
        name: 'USB Cable',
        description: 'Durable charging cable',
        price: 500,
        images: ['https://example.com/cable.jpg'],
        categoryId: 'cat_electronics',
        supplierId: 'sup_123',
        stock: 50,
      });

      await productService.createProduct({
        name: 'Cotton T-Shirt',
        description: 'Comfortable cotton shirt',
        price: 2000,
        images: ['https://example.com/shirt.jpg'],
        categoryId: 'cat_fashion',
        supplierId: 'sup_456',
        stock: 30,
      });
    });

    it('should search products by name', async () => {
      const response = await productService.searchProducts('headphones');

      expect(response.success).toBe(true);
      expect(response.data?.length).toBe(1);
      expect(response.data?.[0].name).toContain('Headphones');
    });

    it('should search products by description', async () => {
      const response = await productService.searchProducts('bluetooth');

      expect(response.success).toBe(true);
      expect(response.data?.length).toBe(1);
      expect(response.data?.[0].description).toContain('bluetooth');
    });

    it('should be case insensitive', async () => {
      const response = await productService.searchProducts('HEADPHONES');

      expect(response.success).toBe(true);
      expect(response.data?.length).toBe(1);
    });

    it('should filter by category', async () => {
      const response = await productService.searchProducts('', {
        categoryId: 'cat_electronics',
      });

      expect(response.success).toBe(true);
      expect(response.data?.length).toBe(2);
      expect(response.data?.every((p) => p.categoryId === 'cat_electronics')).toBe(true);
    });

    it('should filter by price range', async () => {
      const response = await productService.searchProducts('', {
        minPrice: 1000,
        maxPrice: 3000,
      });

      expect(response.success).toBe(true);
      expect(response.data?.length).toBe(1);
      expect(response.data?.[0].price).toBe(2000);
    });

    it('should combine search query and filters', async () => {
      const response = await productService.searchProducts('cable', {
        categoryId: 'cat_electronics',
        maxPrice: 1000,
      });

      expect(response.success).toBe(true);
      expect(response.data?.length).toBe(1);
      expect(response.data?.[0].name).toBe('USB Cable');
    });
  });

  describe('getFeaturedProducts', () => {
    it('should return products sorted by rating', async () => {
      await productService.createProduct({
        name: 'Product 1',
        description: 'Description 1',
        price: 1000,
        images: ['https://example.com/image1.jpg'],
        categoryId: 'cat_123',
        supplierId: 'sup_123',
        stock: 10,
        rating: 3.5,
        reviewCount: 10,
      });

      await productService.createProduct({
        name: 'Product 2',
        description: 'Description 2',
        price: 2000,
        images: ['https://example.com/image2.jpg'],
        categoryId: 'cat_123',
        supplierId: 'sup_123',
        stock: 20,
        rating: 4.8,
        reviewCount: 50,
      });

      await productService.createProduct({
        name: 'Product 3',
        description: 'Description 3',
        price: 3000,
        images: ['https://example.com/image3.jpg'],
        categoryId: 'cat_123',
        supplierId: 'sup_123',
        stock: 30,
        rating: 4.2,
        reviewCount: 25,
      });

      const response = await productService.getFeaturedProducts(2);

      expect(response.success).toBe(true);
      expect(response.data?.length).toBe(2);
      expect(response.data?.[0].rating).toBe(4.8);
      expect(response.data?.[1].rating).toBe(4.2);
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      // Create a product
      const createResponse = await productService.createProduct({
        name: 'Original Name',
        description: 'Original description',
        price: 1000,
        images: ['https://example.com/image.jpg'],
        categoryId: 'cat_123',
        supplierId: 'sup_123',
        stock: 10,
      });

      const productId = createResponse.data!.id;

      // Update the product
      const updateResponse = await productService.updateProduct(productId, {
        name: 'Updated Name',
        price: 1500,
      });

      expect(updateResponse.success).toBe(true);
      expect(updateResponse.data?.name).toBe('Updated Name');
      expect(updateResponse.data?.price).toBe(1500);
      expect(updateResponse.data?.description).toBe('Original description'); // Unchanged
    });

    it('should preserve createdAt timestamp', async () => {
      const createResponse = await productService.createProduct({
        name: 'Test Product',
        description: 'Test description',
        price: 1000,
        images: ['https://example.com/image.jpg'],
        categoryId: 'cat_123',
        supplierId: 'sup_123',
        stock: 10,
      });

      const productId = createResponse.data!.id;
      const originalCreatedAt = createResponse.data!.createdAt;

      // Wait a bit to ensure timestamps would differ
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updateResponse = await productService.updateProduct(productId, {
        name: 'Updated Name',
      });

      expect(updateResponse.data?.createdAt).toBe(originalCreatedAt);
      expect(updateResponse.data?.updatedAt).not.toBe(originalCreatedAt);
    });

    it('should return error for non-existent product', async () => {
      const response = await productService.updateProduct('non_existent_id', {
        name: 'Updated Name',
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('not found');
    });

    it('should validate updated product', async () => {
      const createResponse = await productService.createProduct({
        name: 'Test Product',
        description: 'Test description',
        price: 1000,
        images: ['https://example.com/image.jpg'],
        categoryId: 'cat_123',
        supplierId: 'sup_123',
        stock: 10,
      });

      const productId = createResponse.data!.id;

      const updateResponse = await productService.updateProduct(productId, {
        price: -100, // Invalid price
      });

      expect(updateResponse.success).toBe(false);
      expect(updateResponse.error).toContain('greater than 0');
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      // Create a product
      const createResponse = await productService.createProduct({
        name: 'Test Product',
        description: 'Test description',
        price: 1000,
        images: ['https://example.com/image.jpg'],
        categoryId: 'cat_123',
        supplierId: 'sup_123',
        stock: 10,
      });

      const productId = createResponse.data!.id;

      // Delete the product
      const deleteResponse = await productService.deleteProduct(productId);

      expect(deleteResponse.success).toBe(true);

      // Verify product is deleted
      const getResponse = await productService.getProduct(productId);
      expect(getResponse.success).toBe(false);
    });

    it('should return error for non-existent product', async () => {
      const response = await productService.deleteProduct('non_existent_id');

      expect(response.success).toBe(false);
      expect(response.error).toContain('not found');
    });
  });

  describe('getProductCount', () => {
    it('should return 0 when no products exist', async () => {
      const count = await productService.getProductCount();
      expect(count).toBe(0);
    });

    it('should return correct product count', async () => {
      await productService.createProduct({
        name: 'Product 1',
        description: 'Description 1',
        price: 1000,
        images: ['https://example.com/image1.jpg'],
        categoryId: 'cat_123',
        supplierId: 'sup_123',
        stock: 10,
      });

      await productService.createProduct({
        name: 'Product 2',
        description: 'Description 2',
        price: 2000,
        images: ['https://example.com/image2.jpg'],
        categoryId: 'cat_123',
        supplierId: 'sup_123',
        stock: 20,
      });

      const count = await productService.getProductCount();
      expect(count).toBe(2);
    });
  });
});
