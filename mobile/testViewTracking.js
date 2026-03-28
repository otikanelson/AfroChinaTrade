// Test view tracking API directly
const API_BASE_URL = 'http://192.168.21.202:3000/api';

async function testViewTracking() {
  console.log('🔍 Testing view tracking API...');
  
  try {
    // Use a known product ID from the products we just saw
    const productId = '69bf5f2922c6c32afdbb8a89'; // Wireless Gaming Headset Pro
    console.log('📦 Testing with product ID:', productId);
    
    // Test view tracking (anonymous user)
    const viewResponse = await fetch(`${API_BASE_URL}/products/${productId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: 'test-session-' + Date.now(),
        metadata: {
          source: 'test_script',
          viewDuration: 0,
          scrollDepth: 0,
          imageViews: 1
        }
      })
    });
    
    console.log('📊 View tracking response status:', viewResponse.status);
    const viewData = await viewResponse.json();
    console.log('📈 View tracking response:', JSON.stringify(viewData, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing view tracking:', error.message);
  }
}

testViewTracking();