import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3000';

// Test credentials - you'll need to replace these with actual test user credentials
const TEST_ADMIN_TOKEN = 'your-admin-token-here';
const TEST_USER_TOKEN = 'your-user-token-here';

async function testTicketEndpoints() {
  console.log('🎫 Testing Ticket Endpoints...\n');

  try {
    // Test 1: Get all tickets (admin endpoint)
    console.log('1. Testing GET /api/tickets (admin)...');
    try {
      const adminResponse = await fetch(`${API_BASE_URL}/api/tickets`, {
        headers: {
          'Authorization': `Bearer ${TEST_ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        console.log('✅ Admin tickets endpoint working');
        console.log(`   Found ${adminData.data?.tickets?.length || 0} tickets`);
      } else {
        console.log(`❌ Admin tickets endpoint failed: ${adminResponse.status}`);
        const errorData = await adminResponse.json();
        console.log(`   Error: ${errorData.message}`);
      }
    } catch (error) {
      console.log(`❌ Admin tickets endpoint error: ${error.message}`);
    }

    // Test 2: Get user tickets (customer endpoint)
    console.log('\n2. Testing GET /api/tickets/my-tickets (customer)...');
    try {
      const userResponse = await fetch(`${API_BASE_URL}/api/tickets/my-tickets`, {
        headers: {
          'Authorization': `Bearer ${TEST_USER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('✅ User tickets endpoint working');
        console.log(`   Found ${userData.data?.length || 0} user tickets`);
      } else {
        console.log(`❌ User tickets endpoint failed: ${userResponse.status}`);
        const errorData = await userResponse.json();
        console.log(`   Error: ${errorData.message}`);
      }
    } catch (error) {
      console.log(`❌ User tickets endpoint error: ${error.message}`);
    }

    // Test 3: Test without authentication (should handle gracefully)
    console.log('\n3. Testing endpoints without authentication...');
    try {
      const noAuthResponse = await fetch(`${API_BASE_URL}/api/tickets`);
      console.log(`   No auth response status: ${noAuthResponse.status}`);
      
      if (noAuthResponse.status === 401) {
        console.log('✅ Proper authentication required');
      } else {
        console.log('⚠️  Unexpected response for no auth');
      }
    } catch (error) {
      console.log(`❌ No auth test error: ${error.message}`);
    }

    console.log('\n🎫 Ticket endpoint tests completed!');

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Instructions for running the test
console.log('📋 To run this test:');
console.log('1. Make sure the backend server is running on port 3000');
console.log('2. Replace TEST_ADMIN_TOKEN and TEST_USER_TOKEN with actual tokens');
console.log('3. Run: npm run ts-node src/scripts/testTicketEndpoints.ts\n');

// Uncomment the line below to run the test
// testTicketEndpoints();

export default testTicketEndpoints;