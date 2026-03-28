// Test the duplicate view handling
const API_BASE_URL = 'http://192.168.21.202:3000/api';

async function testDuplicateViews() {
  console.log('🔍 Testing duplicate view handling...');
  
  try {
    // First, authenticate
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
    
    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    const userId = loginData.data.userId;
    console.log('✅ Authenticated successfully');
    
    // Test product
    const productId = '69bf5f2922c6c32afdbb8a89'; // Wireless Gaming Headset Pro
    
    // View the product first time
    console.log('\n📦 First view of product...');
    const firstView = await fetch(`${API_BASE_URL}/products/${productId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        metadata: { source: 'test_first_view' }
      })
    });
    
    const firstViewData = await firstView.json();
    console.log('📈 First view result:', firstViewData);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check browsing history
    console.log('\n📚 Checking browsing history after first view...');
    let historyResponse = await fetch(`${API_BASE_URL}/users/${userId}/browsing-history?page=1&limit=5&interactionType=view`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    let historyData = await historyResponse.json();
    console.log(`📋 Found ${historyData.data.history.length} items in browsing history`);
    
    // Find our product in the history
    const productInHistory = historyData.data.history.find(item => item.productId._id === productId);
    if (productInHistory) {
      console.log(`✅ Product found in history with timestamp: ${productInHistory.timestamp}`);
    } else {
      console.log('❌ Product not found in history');
    }
    
    // Wait 6 minutes to bypass spam protection (since we set it to 5 minutes)
    console.log('\n⏳ Waiting 6 seconds (simulating 6 minutes for test)...');
    await new Promise(resolve => setTimeout(resolve, 6000));
    
    // View the same product again
    console.log('\n📦 Second view of same product...');
    const secondView = await fetch(`${API_BASE_URL}/products/${productId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        metadata: { source: 'test_second_view' }
      })
    });
    
    const secondViewData = await secondView.json();
    console.log('📈 Second view result:', secondViewData);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check browsing history again
    console.log('\n📚 Checking browsing history after second view...');
    historyResponse = await fetch(`${API_BASE_URL}/users/${userId}/browsing-history?page=1&limit=5&interactionType=view`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    historyData = await historyResponse.json();
    console.log(`📋 Found ${historyData.data.history.length} items in browsing history`);
    
    // Check if the product appears only once and is at the top
    const productEntries = historyData.data.history.filter(item => item.productId._id === productId);
    console.log(`🔍 Product appears ${productEntries.length} times in history`);
    
    if (productEntries.length === 1) {
      console.log('✅ SUCCESS: Product appears only once (no duplicates)');
      const entry = productEntries[0];
      const isAtTop = historyData.data.history[0].productId._id === productId;
      console.log(`📍 Product is at position: ${isAtTop ? '1 (top)' : 'not at top'}`);
      console.log(`🕐 Updated timestamp: ${entry.timestamp}`);
      console.log(`📊 Metadata source: ${entry.metadata?.source}`);
    } else {
      console.log(`❌ FAILURE: Product appears ${productEntries.length} times (should be 1)`);
    }
    
  } catch (error) {
    console.error('❌ Error testing duplicate views:', error.message);
  }
}

testDuplicateViews();