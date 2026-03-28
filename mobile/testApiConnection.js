// Simple test to check if the API is reachable
const API_BASE_URL = 'http://192.168.21.202:3000/api';

async function testApiConnection() {
  console.log('🔍 Testing API connection...');
  console.log('📡 API Base URL:', API_BASE_URL);
  
  try {
    // Test basic health endpoint
    const response = await fetch(`${API_BASE_URL}/health`);
    console.log('📊 Health check response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API is reachable:', data);
    } else {
      console.error('❌ API health check failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Failed to reach API:', error.message);
  }
  
  try {
    // Test products endpoint
    const response = await fetch(`${API_BASE_URL}/products?limit=1`);
    console.log('📊 Products endpoint response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Products endpoint working:', data.data?.products?.length || 0, 'products found');
    } else {
      console.error('❌ Products endpoint failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Failed to reach products endpoint:', error.message);
  }
}

testApiConnection();