#!/usr/bin/env node

/**
 * Simple test script to verify product endpoints are working
 * Run with: node test-product-endpoints.js
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

async function testEndpoints() {
  const endpoints = [
    '/health',
    '/products',
    '/products/featured',
    '/categories',
    '/product-collections/trending?timeframe=7d&limit=5',
    '/product-collections/featured-collection?limit=5'
  ];

  console.log('🧪 Testing Product API Endpoints...\n');

  for (const endpoint of endpoints) {
    try {
      const result = await makeRequest(endpoint);
      
      if (result.status === 200) {
        console.log(`✅ ${endpoint} - OK`);
        if (result.data.status === 'success' || result.data.status === 'ok') {
          const dataLength = Array.isArray(result.data.data) ? result.data.data.length : 'N/A';
          console.log(`   Response: ${result.data.status}, Data items: ${dataLength}`);
        }
      } else {
        console.log(`❌ ${endpoint} - Status: ${result.status}`);
        console.log(`   Error: ${result.data.message || result.data}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Connection Error: ${error.error}`);
    }
    console.log('');
  }

  console.log('🏁 Test completed!');
}

testEndpoints();