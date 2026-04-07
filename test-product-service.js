#!/usr/bin/env node

/**
 * Test script to verify ProductService methods work correctly
 * Run with: node test-product-service.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://192.168.100.14:3000/api';

// Simulate the ProductService class
class TestProductService {
  constructor() {
    this.basePath = '/products';
    this.apiClient = new TestApiClient();
  }

  async getFeaturedProducts(limit = 10) {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    
    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}/featured?${queryString}` : `${this.basePath}/featured`;
    
    return this.apiClient.get(url);
  }

  async getProducts(params = {}) {
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
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const queryString = queryParams.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;
    
    return this.apiClient.get(url);
  }

  async getTrendingProducts(timeframe = '24h', page = 1, limit = 20, filters = {}) {
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
    
    return this.apiClient.get(url);
  }

  async getSellerFavorites(page = 1, limit = 20, filters = {}) {
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    
    // Add filters
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.minPrice !== undefined) queryParams.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString());
    if (filters.minRating !== undefined) queryParams.append('minRating', filters.minRating.toString());

    const queryString = queryParams.toString();
    const url = `/product-collections/seller-favorites?${queryString}`;
    
    return this.apiClient.get(url);
  }
}

// Simulate the API client
class TestApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async makeRequest(requestFn) {
    try {
      const response = await requestFn();
      const backendResponse = response.data;
      
      // Handle backend response format (same as mobile app)
      if (backendResponse && typeof backendResponse === 'object') {
        if (backendResponse.status === 'success' || backendResponse.success === true) {
          return {
            success: true,
            data: backendResponse.data,
            pagination: backendResponse.pagination
          };
        } else if (backendResponse.status === 'error') {
          return {
            success: false,
            error: {
              code: backendResponse.errorCode || 'API_ERROR',
              message: backendResponse.message || 'API request failed'
            }
          };
        }
      }
      
      // Direct data response
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message || 'An error occurred'
        }
      };
    }
  }

  async get(url) {
    return this.makeRequest(() => this.client.get(url));
  }
}

async function testProductService() {
  console.log('🧪 Testing ProductService Methods...');
  console.log(`📡 API Base URL: ${API_BASE_URL}`);
  console.log('');

  const productService = new TestProductService();

  const tests = [
    {
      name: 'Featured Products',
      test: () => productService.getFeaturedProducts(5)
    },
    {
      name: 'All Products',
      test: () => productService.getProducts({ limit: 5, sortBy: 'newest' })
    },
    {
      name: 'Discounted Products',
      test: () => productService.getProducts({ limit: 5, sortBy: 'price_desc' })
    },
    {
      name: 'Trending Products',
      test: () => productService.getTrendingProducts('7d', 1, 5)
    },
    {
      name: 'Seller Favorites',
      test: () => productService.getSellerFavorites(1, 5)
    },
    {
      name: 'Category Products',
      test: () => productService.getProducts({ limit: 5, category: 'Electronics' })
    }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const result = await test.test();
      
      if (result.success) {
        const dataLength = Array.isArray(result.data) ? result.data.length : 
                          (result.data && result.data.products ? result.data.products.length : 'unknown');
        console.log(`✅ ${test.name}: Success, Data: ${dataLength} items`);
        
        if (result.pagination) {
          console.log(`   Pagination: page ${result.pagination.page}, total ${result.pagination.total}`);
        }
      } else {
        console.log(`❌ ${test.name}: Failed`);
        console.log(`   Error: ${result.error.message} (${result.error.code})`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Exception`);
      console.log(`   Error: ${error.message}`);
    }
    console.log('');
  }
}

// Check if axios is available
try {
  require('axios');
  testProductService();
} catch (e) {
  console.log('❌ axios not found. Install with: npm install axios');
  console.log('This test simulates the mobile app\'s ProductService behavior.');
}