import mongoose from 'mongoose';
import Product from '../models/Product';

/**
 * Update all products with realistic view counts
 */
async function updateViewCounts() {
  try {
    // Use MongoDB URI from environment or Atlas as fallback
    const mongoUri = process.env.MONGODB_URI || 'mongodb://Nelson:NELSON2005@ac-e3a4d1f-shard-00-00.pg9c7ou.mongodb.net:27017,ac-e3a4d1f-shard-00-01.pg9c7ou.mongodb.net:27017,ac-e3a4d1f-shard-00-02.pg9c7ou.mongodb.net:27017/afrochinatrade?ssl=true&authSource=admin&retryWrites=true&w=majority';
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get all active products
    const products = await Product.find({ isActive: true });
    console.log(`Found ${products.length} active products`);

    if (products.length === 0) {
      console.log('No products found.');
      process.exit(0);
    }

    let updatedCount = 0;

    // Update each product with realistic view counts
    for (const product of products) {
      // Generate realistic view counts based on product characteristics
      let baseViewCount = Math.floor(Math.random() * 1000) + 100; // 100-1100 base views
      
      // Featured products get more views
      if (product.isFeatured) {
        baseViewCount += Math.floor(Math.random() * 2000) + 500; // +500-2500 views
      }
      
      // Products with discounts get more views
      if (product.discount && product.discount > 0) {
        baseViewCount += Math.floor(Math.random() * 1500) + 300; // +300-1800 views
      }
      
      // Higher rated products get more views
      if (product.rating >= 4.5) {
        baseViewCount += Math.floor(Math.random() * 800) + 200; // +200-1000 views
      }
      
      // Electronics category tends to get more views
      if (product.category === 'Electronics') {
        baseViewCount += Math.floor(Math.random() * 500) + 100; // +100-600 views
      }

      // Update the product
      await Product.findByIdAndUpdate(product._id, {
        viewCount: baseViewCount,
        lastViewedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) // Within last 7 days
      });

      updatedCount++;
      console.log(`Updated ${product.name}: ${baseViewCount} views`);
    }

    console.log(`\n=== View Count Update Complete ===`);
    console.log(`Updated ${updatedCount} products with realistic view counts`);

    // Show some statistics
    const stats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          avgViewCount: { $avg: '$viewCount' },
          maxViewCount: { $max: '$viewCount' },
          minViewCount: { $min: '$viewCount' },
          totalViews: { $sum: '$viewCount' }
        }
      }
    ]);

    if (stats.length > 0) {
      const stat = stats[0];
      console.log('\nView Count Statistics:');
      console.log(`  Total products: ${stat.totalProducts}`);
      console.log(`  Average views per product: ${Math.round(stat.avgViewCount)}`);
      console.log(`  Highest view count: ${stat.maxViewCount}`);
      console.log(`  Lowest view count: ${stat.minViewCount}`);
      console.log(`  Total views across all products: ${stat.totalViews}`);
    }

    // Show top 5 most viewed products
    const topProducts = await Product.find({ isActive: true })
      .sort({ viewCount: -1 })
      .limit(5)
      .select('name viewCount category isFeatured');

    console.log('\nTop 5 Most Viewed Products:');
    topProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - ${product.viewCount} views (${product.category}${product.isFeatured ? ', Featured' : ''})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error updating view counts:', error);
    process.exit(1);
  }
}

// Run the update function
updateViewCounts();