import mongoose from 'mongoose';
import { viewTrackingService } from '../services/ViewTrackingService';
import { Product, User, BrowsingHistory } from '../models';
import { connectDatabase } from '../config/database';

async function testViewTracking() {
  try {
    console.log('🔍 Testing view tracking functionality...');
    
    // Connect to database
    await connectDatabase();
    console.log('✅ Connected to database');

    // Find a test user and product
    const testUser = await User.findOne().limit(1);
    const testProduct = await Product.findOne().limit(1);

    if (!testUser || !testProduct) {
      console.error('❌ No test user or product found in database');
      return;
    }

    console.log(`📊 Test user: ${testUser.name} (${testUser._id})`);
    console.log(`📦 Test product: ${testProduct.name} (${testProduct._id})`);

    // Test view tracking
    console.log('\n🎯 Testing view tracking...');
    const result = await viewTrackingService.trackProductView(
      testProduct._id.toString(),
      testUser._id.toString(),
      undefined,
      { source: 'test_script' }
    );

    console.log('📈 View tracking result:', result);

    // Check browsing history
    console.log('\n📚 Checking browsing history...');
    const browsingHistory = await BrowsingHistory.find({ 
      userId: testUser._id,
      productId: testProduct._id 
    }).sort({ timestamp: -1 });

    console.log(`📋 Found ${browsingHistory.length} browsing history entries:`);
    browsingHistory.forEach((entry, index) => {
      console.log(`  ${index + 1}. ${entry.interactionType} at ${entry.timestamp}`);
    });

    // Check product view count
    const updatedProduct = await Product.findById(testProduct._id);
    console.log(`👁️ Product view count: ${updatedProduct?.viewCount || 0}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testViewTracking();