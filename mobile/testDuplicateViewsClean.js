// Test the duplicate view handling with a clean slate
const API_BASE_URL = 'http://192.168.21.202:3000/api';

async function testDuplicateViewsClean() {
  console.log('🔍 Testing duplicate view handling (clean test)...');
  
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
    
    // Use a different product for this test to avoid existing history
    const productId = '69baca14236fd965aa90bd57'; // Premium Wireless Bluetooth Headphones Pro Max
    
    // Check initial browsing history for this specific product
    console.log('\n📚 Checking initial browsing history...');
    let historyResponse = await fetch(`${API_BASE_URL}/users/${userId}/browsing-history?page=1&limit=10&interactionType=view`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    let historyData = await historyResponse.json();
    const initialProductEntries = historyData.data.history.filter(item => item.productId._id === productId);
    console.log(`📋 Initial: Product appears ${initialProductEntries.length} times in history`);
    
    // View the product first time
    console.log('\n📦 First view of product...');
    const firstView = await fetch(`${API_BASE_URL}/products/${productId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        metadata: { source: 'test_first_view', timestamp: Date.now() }
      })
    });
    
    const firstViewData = await firstView.json();
    console.log('📈 First view result:', firstViewData);
    
    // Wait a moment for backend processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check browsing history after first view
    console.log('\n📚 Checking browsing history after first view...');
    historyResponse = await fetch(`${API_BASE_URL}/users/${userId}/browsing-history?page=1&limit=10&interactionType=view&_t=${Date.now()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    historyData = await historyResponse.json();
    let productEntries = historyData.data.history.filter(item => item.productId._id === productId);
    console.log(`📋 After first view: Product appears ${productEntries.length} times in history`);
    
    if (productEntries.length > 0) {
      console.log(`🕐 First entry timestamp: ${productEntries[0].timestamp}`);
      console.log(`📊 First entry metadata: ${JSON.stringify(productEntries[0].metadata)}`);
    }
    
    // Wait 10 seconds and view again (this should update the existing entry, not create new one)
    console.log('\n⏳ Waiting 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // View the same product again
    console.log('\n📦 Second view of same product...');
    const secondView = await fetch(`${API_BASE_URL}/products/${productId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        metadata: { source: 'test_second_view', timestamp: Date.now() }
      })
    });
    
    const secondViewData = await secondView.json();
    console.log('📈 Second view result:', secondViewData);
    
    // Wait a moment for backend processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check browsing history after second view
    console.log('\n📚 Checking browsing history after second view...');
    historyResponse = await fetch(`${API_BASE_URL}/users/${userId}/browsing-history?page=1&limit=10&interactionType=view&_t=${Date.now()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    historyData = await historyResponse.json();
    productEntries = historyData.data.history.filter(item => item.productId._id === productId);
    console.log(`📋 After second view: Product appears ${productEntries.length} times in history`);
    
    if (productEntries.length === 1) {
      console.log('✅ SUCCESS: Product appears only once (no duplicates)');
      const entry = productEntries[0];
      console.log(`🕐 Updated timestamp: ${entry.timestamp}`);
      console.log(`📊 Updated metadata: ${JSON.stringify(entry.metadata)}`);
      
      // Check if it's at the top
      const isAtTop = historyData.data.history[0].productId._id === productId;
      console.log(`📍 Product is at position: ${isAtTop ? '1 (top)' : 'not at top'}`);
    } else if (productEntries.length === 0) {
      console.log('❌ FAILURE: Product not found in history');
    } else {
      console.log(`❌ FAILURE: Product appears ${productEntries.length} times (should be 1)`);
      productEntries.forEach((entry, index) => {
        console.log(`  Entry ${index + 1}: ${entry.timestamp} - ${JSON.stringify(entry.metadata)}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing duplicate views:', error.message);
  }
}

testDuplicateViewsClean();