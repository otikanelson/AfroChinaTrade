import mongoose from 'mongoose';
import Category from '../models/Category';
import { connectDatabase } from '../config/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Default subcategories for categories that might not have any
const defaultSubcategories: { [key: string]: string[] } = {
  'Electronics': ['General', 'Mobile Phones', 'Computers', 'Audio', 'Gaming'],
  'Fashion': ['General', 'Men\'s Clothing', 'Women\'s Clothing', 'Shoes', 'Accessories'],
  'Automotive': ['General', 'Car Parts', 'Accessories', 'Tools'],
  'Books and Media': ['General', 'Fiction', 'Non-Fiction', 'Educational'],
  'Furniture': ['General', 'Living Room', 'Bedroom', 'Office'],
  'Home & Garden': ['General', 'Home Decor', 'Garden Tools', 'Kitchen & Dining'],
  'Sports': ['General', 'Fitness Equipment', 'Sports Apparel'],
  'Health & Beauty': ['General', 'Skincare', 'Health Supplements'],
  'Toys & Games': ['General', 'Educational Toys', 'Board Games']
};

async function ensureCategorySubcategories() {
  try {
    console.log('🔄 Ensuring all categories have subcategories...');
    
    // Connect to database
    await connectDatabase();
    
    // Find categories without subcategories or with empty subcategories
    const categoriesWithoutSubs = await Category.find({
      $or: [
        { subcategories: { $exists: false } },
        { subcategories: { $size: 0 } },
        { subcategories: [] }
      ]
    });

    console.log(`📊 Found ${categoriesWithoutSubs.length} categories without subcategories`);

    let updatedCount = 0;

    for (const category of categoriesWithoutSubs) {
      try {
        const defaultSubs = defaultSubcategories[category.name] || ['General'];
        
        await Category.findByIdAndUpdate(category._id, {
          subcategories: defaultSubs
        });
        
        console.log(`✅ Updated "${category.name}" with subcategories: ${defaultSubs.join(', ')}`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Failed to update category "${category.name}":`, error);
      }
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`📊 Categories updated: ${updatedCount}`);
    
    // Verify all categories now have subcategories
    const categoriesStillWithoutSubs = await Category.find({
      $or: [
        { subcategories: { $exists: false } },
        { subcategories: { $size: 0 } },
        { subcategories: [] }
      ]
    });

    if (categoriesStillWithoutSubs.length === 0) {
      console.log('✅ All categories now have subcategories!');
    } else {
      console.log(`⚠️  ${categoriesStillWithoutSubs.length} categories still without subcategories`);
    }

  } catch (error) {
    console.error('❌ Error ensuring category subcategories:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the migration
if (require.main === module) {
  ensureCategorySubcategories();
}

export default ensureCategorySubcategories;