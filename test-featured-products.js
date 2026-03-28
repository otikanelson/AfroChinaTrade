#!/usr/bin/env node

/**
 * Test script specifically for featured products endpoint
 * Run with: node test-featured-products.js
 */

const http = require('http');

const API_BASE = 'http://localhost:3000/api';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${path}`;
    console.log(`Testing: ${url}`);
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: parsed,
            path
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            path,
            error: 'Invalid JSON'
          });
        }
      });
    }).on('error', (err) => {
      reject({ path, error: err.message });
    });
  });
}

async function testFeaturedProducts() {
  console.log('🧪 Testing Featured Products Endpoint...\n');

  try {
    const result = await makeRequest('/products/featured?limit=20');
    
    console.log(`Status: ${result.status}`);
    console.log(`Response structure:`, {
      hasStatus: 'status' in result.data,
      status: result.data.status,
      hasData: 'data' in result.data,
      dataType: Array.isArray(result.data.data) ? 'array' : typeof result.data.data,
      dataLength: Array.isArray(result.data.data) ? result.data.data.length : 'N/A',
      hasPagination: 'pagination' in result.data,
      paginationKeys: result.data.pagination ? Object.keys(result.data.pagination) : 'N/A'
    });

    if (result.data.data && Array.isArray(result.data.data) && result.data.data.length > 0) {
      console.log('\nFirst product structure:');
      const firstProduct = result.data.data[0];
      console.log({
        hasId: 'id' in firstProduct || '_id' in firstProduct,
        hasName: 'name' in firstProduct,
        hasPrice: 'price' in firstProduct,
        hasImages: 'images' in firstProduct,
        keys: Object.keys(firstProduct).slice(0, 10) // First 10 keys
      });
    }

    if (result.status !== 200) {
      console.log('❌ Error response:', result.data);
    } else {
      console.log('✅ Featured products endpoint working correctly');
    }

  } catch (error) {
    console.log('❌ Connection Error:', error.error);
  }

  console.log('\n🏁 Test completed!');
}

testFeaturedProducts();