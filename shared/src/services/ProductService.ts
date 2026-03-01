import { Product } from '../types/entities';
import { StorageAdapter, STORAGE_KEYS } from './storage';
import { MockDataGenerator } from './MockDataGenerator';

/**
 * ProductService provides methods to manage products in the demo
 * Handles product retrieval and mock data initialization
 */
export class ProductService {
  private storage: StorageAdapter;

  constructor(storage: StorageAdapter) {
    this.storage = storage;
  }

  /**
   * Initialize mock data if not already initialized
   */
  async initializeMockData(): Promise<void> {
    const initialized = await this.storage.get<boolean>(STORAGE_KEYS.INITIALIZED);
    if (!initialized) {
      await MockDataGenerator.initializeMockData(this.storage);
    }
  }

  /**
   * Get all products from storage
   * @returns Array of all products
   */
  async getAllProducts(): Promise<Product[]> {
    await this.initializeMockData();
    const products = await this.storage.get<Product[]>(STORAGE_KEYS.PRODUCTS);
    return products || [];
  }

  /**
   * Get featured products (first 10 products)
   * @returns Array of featured products
   */
  async getFeaturedProducts(): Promise<Product[]> {
    const allProducts = await this.getAllProducts();
    return allProducts.slice(0, 10);
  }
}
