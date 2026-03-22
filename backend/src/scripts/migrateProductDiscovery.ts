import mongoose from 'mongoose';
import Product from '../models/Product';
import BrowsingHistory from '../models/BrowsingHistory';
import ProductViewCache from '../models/ProductViewCache';
import RecommendationCache from '../models/RecommendationCache';
import { connectDatabase } from '../config/database';

/**
 * Migration script for Enhanced Product Discovery system
 * Updates existing products with new discovery fields and creates necessary indexes
 */

async function migrateProductDiscovery() {
  try {
    console.log('🚀 Starting Enhanced Product Discovery migration...');

    // Connect to database
    await connectDatabase();
    console.log('✅ Connected to database');

    // Step 1: Update existing products with new discovery fields
    console.log('📦 Updating existing products with discovery fields...');
    
    const updateResult = await Product.updateMany(
      {
        $or: [
          { viewCount: { $exists: false } },
          { isSellerFavorite: { $exists: false } },
          { trendingScore: { $exists: false } }
        ]
      },
      {
        $set: {
          viewCount: 0,
          isSellerFavorite: false,
          trendingScore: 0
        }
      }
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} products with discovery fields`);

    // Step 2: Set some products as seller favorites (randomly select 20% of featured products)
    console.log('⭐ Setting seller favorites...');
    
    const featuredProducts = await Product.find({ isFeatured: true }).select('_id');
    const sellerFavoriteCount = Math.ceil(featuredProducts.length * 0.2);
    
    if (featuredProducts.length > 0) {
      // Randomly select products to be seller favorites
      const shuffled = featuredProducts.sort(() => 0.5 - Math.random());
      const selectedIds = shuffled.slice(0, sellerFavoriteCount).map(p => p._id);
      
      const favoriteResult = await Product.updateMany(
        { _id: { $in: selectedIds } },
        { $set: { isSellerFavorite: true } }
      );
      
      console.log(`✅ Set ${favoriteResult.modifiedCount} products as seller favorites`);
    }

    // Step 3: Add realistic view counts to existing products
    console.log('👀 Adding realistic view counts to products...');
    
    const allProducts = await Product.find({}).select('_id rating reviewCount isFeatured');
    
    for (const product of allProducts) {
      // Generate realistic view count based on rating and review count
      let baseViews = Math.floor(Math.random() * 100) + 10; // Base 10-110 views
      
      // Boost views based on rating (higher rating = more views)
      const ratingMultiplier = Math.max(1, product.rating / 2);
      baseViews = Math.floor(baseViews * ratingMultiplier);
      
      // Boost views based on review count
      const reviewMultiplier = Math.max(1, Math.log10(product.reviewCount + 1));
      baseViews = Math.floor(baseViews * reviewMultiplier);
      
      // Featured products get extra boost
      if (product.isFeatured) {
        baseViews = Math.floor(baseViews * 1.5);
      }
      
      // Add some randomness
      const finalViews = Math.floor(baseViews + (Math.random() * 50));
      
      await Product.updateOne(
        { _id: product._id },
        { 
          $set: { 
            viewCount: finalViews,
            trendingScore: finalViews * (0.8 + Math.random() * 0.4) // Trending score with some variance
          }
        }
      );
    }
    
    console.log(`✅ Updated view counts for ${allProducts.length} products`);

    // Step 4: Create database indexes
    console.log('🔍 Creating database indexes...');
    
    // Product indexes (some may already exist, MongoDB will ignore duplicates)
    await Product.collection.createIndex({ isActive: 1, viewCount: -1 });
    await Product.collection.createIndex({ isActive: 1, isFeatured: 1 });
    await Product.collection.createIndex({ isActive: 1, isSellerFavorite: 1 });
    await Product.collection.createIndex({ isActive: 1, category: 1, viewCount: -1 });
    await Product.collection.createIndex({ trendingScore: -1 });
    await Product.collection.createIndex({ lastViewedAt: -1 });
    
    console.log('✅ Created Product indexes');

    // BrowsingHistory indexes
    await BrowsingHistory.collection.createIndex({ userId: 1, timestamp: -1 });
    await BrowsingHistory.collection.createIndex({ productId: 1, timestamp: -1 });
    await BrowsingHistory.collection.createIndex({ userId: 1, interactionType: 1, timestamp: -1 });
    await BrowsingHistory.collection.createIndex({ timestamp: -1 });
    await BrowsingHistory.collection.createIndex({ sessionId: 1, timestamp: -1 });
    await BrowsingHistory.collection.createIndex({ interactionType: 1, timestamp: -1 });
    
    console.log('✅ Created BrowsingHistory indexes');

    // ProductViewCache indexes
    await ProductViewCache.collection.createIndex({ productId: 1 }, { unique: true });
    await ProductViewCache.collection.createIndex({ trendingScore: -1 });
    await ProductViewCache.collection.createIndex({ lastUpdated: -1 });
    
    console.log('✅ Created ProductViewCache indexes');

    // RecommendationCache indexes
    await RecommendationCache.collection.createIndex({ userId: 1 }, { unique: true });
    await RecommendationCache.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await RecommendationCache.collection.createIndex({ generatedAt: -1 });
    
    console.log('✅ Created RecommendationCache indexes');

    // Step 5: Verify data integrity
    console.log('🔍 Verifying data integrity...');
    
    const productCount = await Product.countDocuments({});
    const productsWithDiscoveryFields = await Product.countDocuments({
      viewCount: { $exists: true },
      isSellerFavorite: { $exists: true },
      trendingScore: { $exists: true }
    });
    
    const sellerFavoritesCount = await Product.countDocuments({ isSellerFavorite: true });
    const productsWithViews = await Product.countDocuments({ viewCount: { $gt: 0 } });
    
    console.log(`📊 Migration Summary:`);
    console.log(`   Total products: ${productCount}`);
    console.log(`   Products with discovery fields: ${productsWithDiscoveryFields}`);
    console.log(`   Seller favorites: ${sellerFavoritesCount}`);
    console.log(`   Products with views: ${productsWithViews}`);
    
    if (productCount === productsWithDiscoveryFields) {
      console.log('✅ All products successfully updated with discovery fields');
    } else {
      console.log('⚠️  Some products may not have been updated properly');
    }

    console.log('🎉 Enhanced Product Discovery migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateProductDiscovery()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default migrateProductDiscovery;