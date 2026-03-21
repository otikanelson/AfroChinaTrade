import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Product from '../models/Product';

// Load environment variables
dotenv.config();

const categoryMapping: Record<string, string> = {
  'electronics': 'Electronics',
  'clothing': 'Fashion',
  'food-beverages': 'Food & Beverages', // Not in seeded categories, but just in case
  'home-garden': 'Home & Garden',
  'sports': 'Sports & Outdoors',
  'beauty': 'Health & Beauty',
  'toys': 'Toys & Games',
  'books': 'Books & Media',
  'automotive': 'Automotive',
};

export const fixProductCategories = async (): Promise<void> => {
  try {
    console.log('🔧 Starting product category fix...');

    // Find all products with old category format
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to check`);

    let updatedCount = 0;

    for (const product of products) {
      const oldCategory = product.category;
      const newCategory = categoryMapping[oldCategory];

      if (newCategory && newCategory !== oldCategory) {
        console.log(`🔄 Updating product "${product.name}": "${oldCategory}" → "${newCategory}"`);
        
        await Product.findByIdAndUpdate(product._id, {
          category: newCategory
        });
        
        updatedCount++;
      }
    }

    console.log(`✅ Successfully updated ${updatedCount} products`);

  } catch (error) {
    console.error('❌ Error fixing product categories:', error);
    throw error;
  }
};

// Run script directly if called from command line
if (require.main === module) {
  const runFix = async () => {
    try {
      await connectDatabase();
      await fixProductCategories();
      console.log('🎉 Product category fix completed successfully');
    } catch (error) {
      console.error('💥 Product category fix failed:', error);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      process.exit(0);
    }
  };

  runFix();
}