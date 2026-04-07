#!/usr/bin/env node

/**
 * Test script to verify mobile app connectivity to backend
 * Run with: node test-mobile-connectivity.js
 */

const http = require('http');

// Use the same API URL as the mobile app
const API_BASE = 'http://192.168.100.14:3000/api';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${path}`;
    console.log(`Testing: ${url}`);
    
    const startTime = Date.now();
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: parsed,
            path,
            duration
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            path,
            duration,
            error: 'Invalid JSON'
          });
        }
      });
    }).on('error', (err) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      reject({ path, error: err.message, duration });
    });
  });
}

async function testMobileConnectivity() {
  console.log('🧪 Testing Mobile App Connectivity to Backend...');
  console.log(`📡 API Base URL: ${API_BASE}`);
  console.log('');

  const endpoints = [
    '/health',
    '/products/featured?limit=5',
    '/products?limit=5',
    '/product-collections/trending?timeframe=7d&limit=5',
    '/product-collections/seller-favorites?limit=5'
  ];

  let successCount = 0;
  let totalTests = endpoints.length;

  for (const endpoint of endpoints) {
    try {
      const result = await makeRequest(endpoint);
      
      if (result.status === 200) {
        console.log(`✅ ${endpoint} - OK (${result.duration}ms)`);
        
        if (result.data.status === 'success' || result.data.status === 'ok') {
          let dataInfo = '';
          if (Array.isArray(result.data.data)) {
            dataInfo = `${result.data.data.length} items`;
          } else if (result.data.data && result.data.data.products) {
            dataInfo = `${result.data.data.products.length} items`;
          } else if (result.data.message) {
            dataInfo = result.data.message;
          }
          console.log(`   Response: ${result.data.status}, Data: ${dataInfo}`);
          successCount++;
        } else {
          console.log(`   ⚠️  Unexpected response format: ${JSON.stringify(result.data).substring(0, 100)}...`);
        }
      } else {
        console.log(`❌ ${endpoint} - Status: ${result.status} (${result.duration}ms)`);
        console.log(`   Error: ${result.data.message || result.data}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - Connection Error (${error.duration || 'timeout'}ms)`);
      console.log(`   Error: ${error.error}`);
    }
    console.log('');
  }

  console.log('🏁 Test Summary:');
  console.log(`✅ Successful: ${successCount}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - successCount}/${totalTests}`);
  
  if (successCount === totalTests) {
    console.log('🎉 All endpoints are working! The issue might be in the mobile app code.');
  } else if (successCount === 0) {
    console.log('🚨 No endpoints are working! Check if the backend server is running.');
  } else {
    console.log('⚠️  Some endpoints are failing. Check the specific errors above.');
  }
}

testMobileConnectivity();