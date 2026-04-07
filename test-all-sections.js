#!/usr/bin/env node

/**
 * Test script to verify all product sections work
 * Run with: node test-all-sections.js
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

async function testAllSections() {
  const sections = [
    {
      name: 'Featured Products',
      endpoint: '/products/featured?limit=12'
    },
    {
      name: 'Trending Products',
      endpoint: '/product-collections/trending?timeframe=7d&limit=12'
    },
    {
      name: 'Seller Favorites',
      endpoint: '/product-collections/seller-favorites?limit=12'
    },
    {
      name: 'All Products (Newest)',
      endpoint: '/products?limit=12&sortBy=newest'
    },
    {
      name: 'Products (Price Desc)',
      endpoint: '/products?limit=12&sortBy=price_desc&minPrice=1'
    }
  ];

  console.log('🧪 Testing All Product Sections...\n');

  for (const section of sections) {
    try {
      const result = await makeRequest(section.endpoint);
      
      if (result.status === 200) {
        console.log(`✅ ${section.name} - OK`);
        
        if (result.data.status === 'success' || result.data.status === 'ok') {
          let dataLength = 'N/A';
          let hasProducts = false;
          
          if (Array.isArray(result.data.data)) {
            dataLength = result.data.data.length;
            hasProducts = result.data.data.length > 0;
          } else if (result.data.data && result.data.data.products) {
            dataLength = result.data.data.products.length;
            hasProducts = result.data.data.products.length > 0;
          }
          
          console.log(`   Response: ${result.data.status}, Products: ${dataLength}`);
          
          if (hasProducts) {
            console.log(`   ✓ Section will be visible with products`);
          } else {
            console.log(`   ⚠️  Section will be hidden (no products)`);
          }
        }
      } else {
        console.log(`❌ ${section.name} - Status: ${result.status}`);
        console.log(`   Error: ${result.data.message || result.data}`);
      }
    } catch (error) {
      console.log(`❌ ${section.name} - Connection Error: ${error.error}`);
    }
    console.log('');
  }

  console.log('🏁 Test completed!');
  console.log('\n📝 Summary:');
  console.log('- Sections with products will be visible with "Seller Pick" badges on favorites');
  console.log('- Sections without products will be completely hidden');
  console.log('- If all sections are hidden, an empty state message will appear');
  console.log('- If any section shows connection errors, check if the backend is running');
}

testAllSections();