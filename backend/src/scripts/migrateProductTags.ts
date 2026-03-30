import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../models/Product';
import { connectDatabase } from '../config/database';

/**
 * Migration script to add collection tags to existing products
 * This script will add appropriate tags to products based on their existing properties
 */

const COLLECTION_TAGS = [
  'trending', 
  'new',
  'sale',
  'bestseller',
  'limited',
  'premium',
  'eco-friendly'
] as const;

async function migrateProductTags() {
  try {
    console.log('🚀 Starting product tags migration...');
    
    // Connect to database
    await connectDatabase();
    console.log('✅ Connected to database');

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to migrate`);

    let updatedCount = 0;

    for (const product of products) {
      const tags: string[] = [];

      // Note: 'featured' is handled by the isFeatured field, not tags

      // Add 'new' tag if product was created in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (product.createdAt > thirtyDaysAgo) {
        tags.push('new');
      }

      // Add 'sale' tag if product has a discount
      if (product.discount && product.discount > 0) {
        tags.push('sale');
      }

      // Add 'trending' tag if product has high view count (top 20%)
      if (product.viewCount > 100) {
        tags.push('trending');
      }

      // Add 'bestseller' tag if product has high rating and review count
      if (product.rating >= 4.5 && product.reviewCount >= 10) {
        tags.push('bestseller');
      }

      // Add 'premium' tag if product price is above average for its category
      if (product.price > 50000) { // Adjust threshold as needed
        tags.push('premium');
      }

      // Clean existing tags - remove any invalid ones and merge with new tags
      const existingTags = product.tags || [];
      const validExistingTags = existingTags.filter(tag => 
        ['trending', 'new', 'sale', 'bestseller', 'limited', 'premium', 'eco-friendly'].includes(tag)
      );
      
      const newTags = [...new Set([...validExistingTags, ...tags])]; // Merge and deduplicate
      
      // Always update to clean up any invalid tags
      if (JSON.stringify(existingTags.sort()) !== JSON.stringify(newTags.sort())) {
        await Product.findByIdAndUpdate(
          product._id,
          { tags: newTags },
          { runValidators: true }
        );
        updatedCount++;
        console.log(`✅ Updated product "${product.name}" with tags: ${newTags.join(', ')}`);
      }
    }

    console.log(`🎉 Migration completed! Updated ${updatedCount} products`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateProductTags()
    .then(() => {
      console.log('✅ Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateProductTags };