import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';

// Load environment variables
dotenv.config();

// Import models
import Product from '../models/Product';
import Review from '../models/Review';
import Order from '../models/Order';

/**
 * Clear only product-related data
 * This will delete products, reviews, and orders but keep users, categories, etc.
 */
export const clearProducts = async (confirm: boolean = false): Promise<void> => {
  try {
    if (!confirm) {
      console.log('⚠️  WARNING: This will delete ALL product data!');
      console.log('   This includes: Products, Reviews, and Orders');
      console.log('   To confirm, run with --confirm flag or call clearProducts(true)');
      return;
    }

    console.log('🗑️  Starting product data cleanup...');
    console.log('⚠️  This will delete products, reviews, and orders!');

    let clearedCount = 0;
    let totalDeleted = 0;

    // Clear products
    try {
      const productResult = await Product.deleteMany({});
      console.log(`✅ Cleared products: ${productResult.deletedCount} documents deleted`);
      clearedCount++;
      totalDeleted += productResult.deletedCount;
    } catch (error) {
      console.log(`❌ Error clearing products: ${error}`);
    }

    // Clear reviews
    try {
      const reviewResult = await Review.deleteMany({});
      console.log(`✅ Cleared reviews: ${reviewResult.deletedCount} documents deleted`);
      clearedCount++;
      totalDeleted += reviewResult.deletedCount;
    } catch (error) {
      console.log(`❌ Error clearing reviews: ${error}`);
    }

    // Clear orders
    try {
      const orderResult = await Order.deleteMany({});
      console.log(`✅ Cleared orders: ${orderResult.deletedCount} documents deleted`);
      clearedCount++;
      totalDeleted += orderResult.deletedCount;
    } catch (error) {
      console.log(`❌ Error clearing orders: ${error}`);
    }

    // Summary
    console.log('');
    console.log('📊 Product Cleanup Summary:');
    console.log(`   ✅ Successfully cleared: ${clearedCount} collections`);
    console.log(`   📝 Total documents deleted: ${totalDeleted}`);

    if (totalDeleted > 0) {
      console.log('');
      console.log('🎉 Product data cleanup completed successfully!');
      console.log('💡 You can now test product creation APIs with clean data');
    } else {
      console.log('');
      console.log('ℹ️  No product data found to clear');
    }

  } catch (error) {
    console.error('❌ Error during product cleanup:', error);
    throw error;
  }
};

// Run script directly if called from command line
if (require.main === module) {
  const runCleanup = async () => {
    try {
      await connectDatabase();
      
      // Check for confirmation flag
      const confirm = process.argv.includes('--confirm');
      await clearProducts(confirm);
      
    } catch (error) {
      console.error('💥 Product cleanup failed:', error);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      process.exit(0);
    }
  };

  runCleanup();
}