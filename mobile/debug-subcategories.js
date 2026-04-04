// Debug script to test subcategory API calls
// Run this with: node debug-subcategories.js

const API_BASE_URL = 'http://localhost:3000/api'; // Adjust if needed

async function testSubcategoryAPI() {
  console.log('🔍 Testing Subcategory API...');
  
  try {
    // Test 1: Get all subcategories
    console.log('\n1️⃣ Testing GET /api/subcategories');
    const allSubcategoriesResponse = await fetch(`${API_BASE_URL}/subcategories`);
    const allSubcategoriesData = await allSubcategoriesResponse.json();
    
    console.log('Status:', allSubcategoriesResponse.status);
    console.log('Response:', JSON.stringify(allSubcategoriesData, null, 2));
    
    // Test 2: Get subcategories for Automotive
    console.log('\n2️⃣ Testing GET /api/subcategories/category/Automotive');
    const automotiveResponse = await fetch(`${API_BASE_URL}/subcategories/category/Automotive`);
    const automotiveData = await automotiveResponse.json();
    
    console.log('Status:', automotiveResponse.status);
    console.log('Response:', JSON.stringify(automotiveData, null, 2));
    
    // Test 3: Get subcategories for Electronics
    console.log('\n3️⃣ Testing GET /api/subcategories/category/Electronics');
    const electronicsResponse = await fetch(`${API_BASE_URL}/subcategories/category/Electronics`);
    const electronicsData = await electronicsResponse.json();
    
    console.log('Status:', electronicsResponse.status);
    console.log('Response:', JSON.stringify(electronicsData, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    console.error('Make sure the backend server is running on http://localhost:3000');
  }
}

// Test the API
testSubcategoryAPI();