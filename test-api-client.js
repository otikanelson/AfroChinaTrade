#!/usr/bin/env node

/**
 * Test script to simulate the mobile app's API client behavior
 * Run with: node test-api-client.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://192.168.100.14:3000/api';

// Simulate the mobile app's API client
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

async function testApiClient() {
  console.log('🧪 Testing API Client (Mobile App Simulation)...');
  console.log(`📡 API Base URL: ${API_BASE_URL}`);
  console.log('');

  const apiClient = new TestApiClient();

  const tests = [
    { name: 'Featured Products', url: '/products/featured?limit=5' },
    { name: 'Regular Products', url: '/products?limit=5' },
    { name: 'Trending Products', url: '/product-collections/trending?timeframe=7d&limit=5' },
    { name: 'Seller Favorites', url: '/product-collections/seller-favorites?limit=5' }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      const result = await apiClient.get(test.url);
      
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
  testApiClient();
} catch (e) {
  console.log('❌ axios not found. Install with: npm install axios');
  console.log('This test simulates the mobile app\'s API client behavior.');
}