import mongoose from 'mongoose';
import Subcategory from '../models/Subcategory';
import { connectDatabase } from '../config/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testSubcategories() {
  try {
    console.log('🔍 Testing subcategories...');
    
    // Connect to database
    await connectDatabase();
    
    // Test: Get all subcategories for Automotive
    console.log('\n📂 Testing Automotive subcategories:');
    const automotiveSubcategories = await Subcategory.find({
      categoryName: { $regex: new RegExp('^Automotive$', 'i') },
      isActive: true,
    }).sort({ name: 1 });
    
    console.log(`Found ${automotiveSubcategories.length} subcategories for Automotive:`);
    automotiveSubcategories.forEach(sub => {
      console.log(`  • ${sub.name} (ID: ${sub._id})`);
    });
    
    // Test: Get all subcategories for Electronics
    console.log('\n💻 Testing Electronics subcategories:');
    const electronicsSubcategories = await Subcategory.find({
      categoryName: { $regex: new RegExp('^Electronics$', 'i') },
      isActive: true,
    }).sort({ name: 1 });
    
    console.log(`Found ${electronicsSubcategories.length} subcategories for Electronics:`);
    electronicsSubcategories.forEach(sub => {
      console.log(`  • ${sub.name} (ID: ${sub._id})`);
    });
    
    // Test: Total count
    const totalSubcategories = await Subcategory.countDocuments({ isActive: true });
    console.log(`\n📊 Total active subcategories: ${totalSubcategories}`);
    
    // Test: Categories with subcategories
    const categoriesWithSubs = await Subcategory.distinct('categoryName');
    console.log(`\n📋 Categories with subcategories: ${categoriesWithSubs.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error testing subcategories:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test function
if (require.main === module) {
  testSubcategories();
}

export default testSubcategories;