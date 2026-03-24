/**
 * Simple connectivity test for the Vercel backend
 */

const API_BASE_URL = 'https://afro-china-trade.vercel.app/api';

async function testConnectivity() {
  console.log('🔍 Testing backend connectivity...');
  console.log('API URL:', API_BASE_URL);
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 10 second timeout
      signal: AbortSignal.timeout(10000),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend connectivity test PASSED');
      console.log('Response:', data);
      return true;
    } else {
      console.log('❌ Backend responded with error:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend connectivity test FAILED');
    console.log('Error:', error.message);
    return false;
  }
}

// Run the test
testConnectivity().then(success => {
  process.exit(success ? 0 : 1);
});