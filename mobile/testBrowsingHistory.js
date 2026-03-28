// Test browsing history API with authentication
const API_BASE_URL = 'http://192.168.21.202:3000/api';

async function testBrowsingHistory() {
  console.log('🔍 Testing browsing history API...');
  
  try {
    // First, authenticate with admin user
    console.log('🔐 Authenticating...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@afrochinatrade.com',
        password: 'Admin123!@#'
      })
    });
    
    console.log('📊 Login response status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('🔍 Login response data:', JSON.stringify(loginData, null, 2));
    
    if (!loginData.data?.token) {
      console.error('❌ Failed to authenticate:', loginData);
      return;
    }
    
    const token = loginData.data.token;
    const userId = loginData.data.userId;
    console.log('✅ Authenticated successfully, user ID:', userId);
    
    // Now test view tracking with authenticated user
    const productId = '69bf5f2922c6c32afdbb8a89'; // Wireless Gaming Headset Pro
    console.log('📦 Tracking view for product:', productId);
    
    const viewResponse = await fetch(`${API_BASE_URL}/products/${productId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        metadata: {
          source: 'test_authenticated',
          viewDuration: 0,
          scrollDepth: 0,
          imageViews: 1
        }
      })
    });
    
    console.log('📊 View tracking response status:', viewResponse.status);
    const viewData = await viewResponse.json();
    console.log('📈 View tracking response:', JSON.stringify(viewData, null, 2));
    
    // Wait a moment for the backend to process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Now test browsing history
    console.log('📚 Fetching browsing history...');
    const historyResponse = await fetch(`${API_BASE_URL}/users/${userId}/browsing-history?page=1&limit=20&interactionType=view`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📊 Browsing history response status:', historyResponse.status);
    const historyData = await historyResponse.json();
    console.log('📋 Browsing history response:', JSON.stringify(historyData, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing browsing history:', error.message);
  }
}

testBrowsingHistory();