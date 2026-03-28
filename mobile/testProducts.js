// Test products API
const API_BASE_URL = 'http://192.168.21.202:3000/api';

async function testProducts() {
  console.log('🔍 Testing products API...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    console.log('📊 Products response status:', response.status);
    
    const data = await response.json();
    console.log('📋 Full products response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing products:', error.message);
  }
}

testProducts();