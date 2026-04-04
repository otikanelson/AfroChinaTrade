import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import Ad from '../models/Ad';

dotenv.config();

async function testSplashAds() {
  try {
    console.log('🎯 Testing splash ads functionality...');
    
    // Connect to database
    await connectDatabase();
    console.log('✅ Connected to database');

    // Create a test splash ad
    console.log('\n📱 Creating test splash ad...');
    const testSplashAd = await Ad.create({
      title: 'Welcome to Our App!',
      description: 'Discover amazing products and deals just for you.',
      imageUrl: 'https://via.placeholder.com/720x1280/4F46E5/FFFFFF?text=Welcome+Splash+Ad',
      linkPath: '/product-listing',
      displayOrder: 0,
      isActive: true,
      placement: {
        app: 'splash'
      },
      splashFrequency: 'daily',
      splashDuration: 4000
    });

    console.log(`✅ Created splash ad: ${testSplashAd.title} (${testSplashAd._id})`);

    // Test querying splash ads
    console.log('\n🔍 Testing splash ad queries...');
    const splashAds = await Ad.find({
      isActive: true,
      'placement.app': 'splash'
    }).sort({ displayOrder: 1, createdAt: -1 });

    console.log(`📊 Found ${splashAds.length} active splash ads:`);
    splashAds.forEach(ad => {
      console.log(`  - ${ad.title} (${ad.splashFrequency}, ${ad.splashDuration}ms)`);
    });

    // Test general ad query (should include splash ads)
    console.log('\n📋 Testing general ad query...');
    const allAds = await Ad.find({ isActive: true });
    console.log(`📊 Total active ads: ${allAds.length}`);
    
    const adsByPlacement = allAds.reduce((acc, ad) => {
      Object.keys(ad.placement || {}).forEach(placement => {
        acc[placement] = (acc[placement] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    console.log('📍 Ads by placement:');
    Object.entries(adsByPlacement).forEach(([placement, count]) => {
      console.log(`  - ${placement}: ${count}`);
    });

    console.log('\n✅ Splash ads test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
if (require.main === module) {
  testSplashAds();
}

export default testSplashAds;