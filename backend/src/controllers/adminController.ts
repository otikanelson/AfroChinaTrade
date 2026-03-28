import { Request, Response } from 'express';
import Product from '../models/Product';
import Review from '../models/Review';

/**
 * Admin controller for system maintenance operations
 */

export const syncProductReviews = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Starting product review sync via API...');
    
    // Get all products
    const products = await Product.find({});
    
    let updatedCount = 0;
    let skippedCount = 0;
    const updates: Array<{
      productId: string;
      productName: string;
      oldReviewCount: number;
      newReviewCount: number;
      oldRating: number;
      newRating: number;
    }> = [];

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
          actualRating = Math.round((totalRating / actualReviewCount) * 10) / 10;
        }

        // Check if update is needed
        const needsUpdate = 
          product.reviewCount !== actualReviewCount || 
          Math.abs(product.rating - actualRating) > 0.1;

        if (needsUpdate) {
          // Update product with actual review data
          await Product.findByIdAndUpdate(product._id, {
            rating: actualRating,
            reviewCount: actualReviewCount,
          });

          updates.push({
            productId: product._id.toString(),
            productName: product.name,
            oldReviewCount: product.reviewCount,
            newReviewCount: actualReviewCount,
            oldRating: product.rating,
            newRating: actualRating,
          });

          updatedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing product "${product.name}":`, error);
      }
    }

    console.log(`✅ Sync completed: ${updatedCount} updated, ${skippedCount} skipped`);

    res.json({
      status: 'success',
      message: 'Product review sync completed successfully',
      data: {
        totalProducts: products.length,
        updatedCount,
        skippedCount,
        updates: updates.slice(0, 10), // Return first 10 updates as examples
        hasMoreUpdates: updates.length > 10
      }
    });

  } catch (error) {
    console.error('❌ Error during sync:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to sync product reviews',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getReviewStats = async (req: Request, res: Response) => {
  try {
    // Get statistics about review data consistency
    const products = await Product.find({}).select('_id name rating reviewCount');
    
    let correctProducts = 0;
    let productsWithFakeReviews = 0;
    let productsWithMismatchedData = 0;

    for (const product of products) {
      const actualReviews = await Review.countDocuments({ 
        productId: product._id, 
        isFlagged: false 
      });

      if (product.reviewCount === actualReviews) {
        correctProducts++;
      } else if (product.reviewCount > 0 && actualReviews === 0) {
        productsWithFakeReviews++;
      } else {
        productsWithMismatchedData++;
      }
    }

    res.json({
      status: 'success',
      data: {
        totalProducts: products.length,
        correctProducts,
        productsWithFakeReviews,
        productsWithMismatchedData,
        needsSync: productsWithFakeReviews + productsWithMismatchedData > 0
      }
    });

  } catch (error) {
    console.error('❌ Error getting review stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get review statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};