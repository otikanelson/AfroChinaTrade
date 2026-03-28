import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product';
import Review from '../models/Review';
import { connectDatabase } from '../config/database';

// Load environment variables
dotenv.config();

/**
 * Comprehensive script to fix review data discrepancies
 * This script:
 * 1. Finds products with mismatched review counts
 * 2. Recalculates ratings and counts from actual reviews
 * 3. Updates products with correct data
 * 4. Provides detailed reporting
 */

interface ProductDiscrepancy {
  productId: string;
  productName: string;
  currentRating: number;
  currentReviewCount: number;
  actualRating: number;
  actualReviewCount: number;
  hasReviews: boolean;
}

const findAndFixReviewDiscrepancies = async () => {
  try {
    console.log('🔍 Analyzing product review discrepancies...\n');
    
    // Connect to database
    await connectDatabase();
    console.log('✅ Connected to database\n');

    // Get all products
    const products = await Product.find({}).select('_id name rating reviewCount');
    console.log(`📦 Analyzing ${products.length} products...\n`);

    const discrepancies: ProductDiscrepancy[] = [];
    let correctProducts = 0;

    // Check each product
    for (const product of products) {
      // Get actual reviews for this product
      const reviews = await Review.find({ 
        productId: product._id, 
        isFlagged: false 
      });

      const actualReviewCount = reviews.length;
      let actualRating = 0;

      if (actualReviewCount > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        actualRating = Math.round((totalRating / actualReviewCount) * 10) / 10;
      }

      // Check for discrepancies
      const hasDiscrepancy = 
        product.reviewCount !== actualReviewCount || 
        Math.abs(product.rating - actualRating) > 0.1; // Allow small floating point differences

      if (hasDiscrepancy) {
        discrepancies.push({
          productId: product._id.toString(),
          productName: product.name,
          currentRating: product.rating,
          currentReviewCount: product.reviewCount,
          actualRating,
          actualReviewCount,
          hasReviews: actualReviewCount > 0
        });
      } else {
        correctProducts++;
      }
    }

    // Report findings
    console.log('📊 Analysis Results:');
    console.log(`✅ Correct products: ${correctProducts}`);
    console.log(`❌ Products with discrepancies: ${discrepancies.length}\n`);

    if (discrepancies.length === 0) {
      console.log('🎉 All products have correct review data!');
      return;
    }

    // Show discrepancies by category
    const withFakeReviews = discrepancies.filter(d => d.currentReviewCount > 0 && d.actualReviewCount === 0);
    const withMismatchedCounts = discrepancies.filter(d => d.actualReviewCount > 0 && d.currentReviewCount !== d.actualReviewCount);
    const withWrongRatings = discrepancies.filter(d => d.actualReviewCount > 0 && Math.abs(d.currentRating - d.actualRating) > 0.1);

    console.log('🔍 Discrepancy Categories:');
    console.log(`📊 Products with fake review counts: ${withFakeReviews.length}`);
    console.log(`🔢 Products with mismatched counts: ${withMismatchedCounts.length}`);
    console.log(`⭐ Products with wrong ratings: ${withWrongRatings.length}\n`);

    // Show some examples
    if (withFakeReviews.length > 0) {
      console.log('📋 Examples of products with fake review counts:');
      withFakeReviews.slice(0, 5).forEach(d => {
        console.log(`  • "${d.productName}": Shows ${d.currentReviewCount} reviews, actually has ${d.actualReviewCount}`);
      });
      if (withFakeReviews.length > 5) {
        console.log(`  ... and ${withFakeReviews.length - 5} more`);
      }
      console.log();
    }

    // Ask for confirmation to fix
    console.log('🔧 Ready to fix discrepancies...');
    
    // Fix all discrepancies
    let fixedCount = 0;
    for (const discrepancy of discrepancies) {
      try {
        await Product.findByIdAndUpdate(discrepancy.productId, {
          rating: discrepancy.actualRating,
          reviewCount: discrepancy.actualReviewCount,
        });

        console.log(`✅ Fixed "${discrepancy.productName}": ${discrepancy.currentReviewCount} → ${discrepancy.actualReviewCount} reviews, ${discrepancy.currentRating} → ${discrepancy.actualRating} rating`);
        fixedCount++;
      } catch (error) {
        console.error(`❌ Failed to fix "${discrepancy.productName}":`, error);
      }
    }

    console.log('\n🎉 Fix Summary:');
    console.log(`✅ Successfully fixed: ${fixedCount} products`);
    console.log(`❌ Failed to fix: ${discrepancies.length - fixedCount} products`);
    console.log(`📦 Total processed: ${products.length} products`);
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run if executed directly
if (require.main === module) {
  findAndFixReviewDiscrepancies();
}

export default findAndFixReviewDiscrepancies;