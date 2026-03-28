import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product';
import Review from '../models/Review';
import { connectDatabase } from '../config/database';

// Load environment variables
dotenv.config();

/**
 * Script to sync product ratings and review counts with actual reviews in the database
 * This fixes the discrepancy where products have hardcoded review counts from seed data
 * but no actual reviews exist in the database
 */

const syncProductReviews = async () => {
  try {
    console.log('🔄 Starting product review sync...');
    
    // Connect to database
    await connectDatabase();
    console.log('✅ Connected to database');

    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to sync`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      try {
        // Get actual reviews for this product (excluding flagged ones)
        const reviews = await Review.find({ 
          productId: product._id, 
          isFlagged: false 
        });

        const actualReviewCount = reviews.length;
        let actualRating = 0;

        if (actualReviewCount > 0) {
          // Calculate average rating
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          actualRating = Math.round((totalRating / actualReviewCount) * 10) / 10; // Round to 1 decimal
        }

        // Check if update is needed
        const needsUpdate = 
          product.reviewCount !== actualReviewCount || 
          product.rating !== actualRating;

        if (needsUpdate) {
          // Update product with actual review data
          await Product.findByIdAndUpdate(product._id, {
            rating: actualRating,
            reviewCount: actualReviewCount,
          });

          console.log(`📝 Updated "${product.name}": ${product.reviewCount} → ${actualReviewCount} reviews, ${product.rating} → ${actualRating} rating`);
          updatedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing product "${product.name}":`, error);
      }
    }

    console.log('\n📊 Sync Summary:');
    console.log(`✅ Updated: ${updatedCount} products`);
    console.log(`⏭️  Skipped: ${skippedCount} products (already correct)`);
    console.log(`📦 Total: ${products.length} products processed`);
    
    console.log('\n🎉 Product review sync completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during sync:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the sync if this file is executed directly
if (require.main === module) {
  syncProductReviews();
}

export default syncProductReviews;