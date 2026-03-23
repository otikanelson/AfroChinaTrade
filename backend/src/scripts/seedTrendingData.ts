import mongoose from 'mongoose';
import ProductViewCache from '../models/ProductViewCache';
import BrowsingHistory from '../models/BrowsingHistory';
import Product from '../models/Product';

/**
 * Initialize trending data and ProductViewCache with historical data
 * This script calculates initial trending scores and populates the view cache
 */

interface ViewCacheData {
  productId: mongoose.Types.ObjectId;
  hourlyViews: Map<string, number>;
  dailyViews: Map<string, number>;
  weeklyViews: Map<string, number>;
  totalViews: number;
  trendingScore: number;
  lastUpdated: Date;
}

function getHourKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
}

function getDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function getWeekKey(date: Date): string {
  const weekNumber = Math.floor(date.getDate() / 7);
  return `${date.getFullYear()}-${date.getMonth()}-${weekNumber}`;
}

function calculateTrendingScore(
  hourlyViews: Map<string, number>,
  dailyViews: Map<string, number>,
  weeklyViews: Map<string, number>,
  totalViews: number
): number {
  const now = new Date();
  
  // Get recent view counts
  const lastHourKey = getHourKey(new Date(now.getTime() - 60 * 60 * 1000));
  const last24HoursKeys = Array.from({ length: 24 }, (_, i) => 
    getHourKey(new Date(now.getTime() - i * 60 * 60 * 1000))
  );
  const last7DaysKeys = Array.from({ length: 7 }, (_, i) => 
    getDayKey(new Date(now.getTime() - i * 24 * 60 * 60 * 1000))
  );

  // Calculate weighted scores
  const lastHourViews = hourlyViews.get(lastHourKey) || 0;
  const last24HoursViews = last24HoursKeys.reduce((sum, key) => sum + (hourlyViews.get(key) || 0), 0);
  const last7DaysViews = last7DaysKeys.reduce((sum, key) => sum + (dailyViews.get(key) || 0), 0);

  // Trending score calculation with time decay
  const hourlyWeight = 10; // Recent hour is very important
  const dailyWeight = 5;   // Last 24 hours is important
  const weeklyWeight = 2;  // Last 7 days provides context
  const totalWeight = 0.1; // Total views provide baseline

  const trendingScore = 
    (lastHourViews * hourlyWeight) +
    (last24HoursViews * dailyWeight) +
    (last7DaysViews * weeklyWeight) +
    (totalViews * totalWeight);

  return Math.round(trendingScore);
}

async function seedTrendingData() {
  try {
    // Use MongoDB URI from environment or Atlas as fallback
    const mongoUri = process.env.MONGODB_URI || 'mongodb://Nelson:NELSON2005@ac-e3a4d1f-shard-00-00.pg9c7ou.mongodb.net:27017,ac-e3a4d1f-shard-00-01.pg9c7ou.mongodb.net:27017,ac-e3a4d1f-shard-00-02.pg9c7ou.mongodb.net:27017/afrochinatrade?ssl=true&authSource=admin&retryWrites=true&w=majority';
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing ProductViewCache
    await ProductViewCache.deleteMany({});
    console.log('Cleared existing ProductViewCache');

    // Get all products
    const products = await Product.find({ isActive: true });
    console.log(`Found ${products.length} active products`);

    if (products.length === 0) {
      console.log('No products found. Please seed products first.');
      process.exit(1);
    }

    // Get all browsing history for view interactions
    const browsingHistory = await BrowsingHistory.find({ 
      interactionType: 'view' 
    }).populate('productId');

    console.log(`Found ${browsingHistory.length} view interactions in browsing history`);

    // Group browsing history by product
    const productViewHistory = new Map<string, any[]>();
    
    for (const history of browsingHistory) {
      if (!history.productId) continue;
      
      const productId = history.productId._id.toString();
      if (!productViewHistory.has(productId)) {
        productViewHistory.set(productId, []);
      }
      productViewHistory.get(productId)!.push(history);
    }

    console.log('Processing view cache data for each product...');

    let processedCount = 0;
    const viewCacheEntries: ViewCacheData[] = [];

    for (const product of products) {
      const productId = product._id.toString();
      const productViews = productViewHistory.get(productId) || [];

      // Initialize view maps
      const hourlyViews = new Map<string, number>();
      const dailyViews = new Map<string, number>();
      const weeklyViews = new Map<string, number>();

      // Process each view interaction
      for (const view of productViews) {
        const timestamp = new Date(view.timestamp);
        const hourKey = getHourKey(timestamp);
        const dayKey = getDayKey(timestamp);
        const weekKey = getWeekKey(timestamp);

        // Increment counters
        hourlyViews.set(hourKey, (hourlyViews.get(hourKey) || 0) + 1);
        dailyViews.set(dayKey, (dailyViews.get(dayKey) || 0) + 1);
        weeklyViews.set(weekKey, (weeklyViews.get(weekKey) || 0) + 1);
      }

      // Add some additional realistic view distribution if no history exists
      if (productViews.length === 0 && product.viewCount && product.viewCount > 0) {
        // Distribute the product's viewCount across recent time periods
        const totalViews = product.viewCount;
        const now = new Date();

        // Distribute views across the last 30 days with realistic patterns
        for (let i = 0; i < 30; i++) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dayKey = getDayKey(date);
          const weekKey = getWeekKey(date);
          
          // More recent days get more views (exponential decay)
          const dayWeight = Math.exp(-i * 0.1);
          const dayViews = Math.floor((totalViews * dayWeight * 0.1) * Math.random());
          
          if (dayViews > 0) {
            dailyViews.set(dayKey, dayViews);
            weeklyViews.set(weekKey, (weeklyViews.get(weekKey) || 0) + dayViews);

            // Distribute daily views across hours
            for (let hour = 0; hour < 24; hour++) {
              const hourDate = new Date(date);
              hourDate.setHours(hour);
              const hourKey = getHourKey(hourDate);
              
              // Peak hours (9-17) get more views
              const hourWeight = (hour >= 9 && hour <= 17) ? 1.5 : 0.5;
              const hourViews = Math.floor((dayViews / 24) * hourWeight * (Math.random() + 0.5));
              
              if (hourViews > 0) {
                hourlyViews.set(hourKey, hourViews);
              }
            }
          }
        }
      }

      const totalViews = product.viewCount || productViews.length;
      const trendingScore = calculateTrendingScore(hourlyViews, dailyViews, weeklyViews, totalViews);

      // Create view cache entry
      const viewCacheEntry: ViewCacheData = {
        productId: product._id,
        hourlyViews,
        dailyViews,
        weeklyViews,
        totalViews,
        trendingScore,
        lastUpdated: new Date(),
      };

      viewCacheEntries.push(viewCacheEntry);

      // Update product's trending score
      await Product.findByIdAndUpdate(product._id, { 
        trendingScore,
        lastViewedAt: productViews.length > 0 ? 
          new Date(Math.max(...productViews.map(v => new Date(v.timestamp).getTime()))) : 
          product.lastViewedAt
      });

      processedCount++;
      if (processedCount % 10 === 0) {
        console.log(`Processed ${processedCount}/${products.length} products...`);
      }
    }

    // Bulk insert view cache entries
    console.log('Inserting ProductViewCache entries...');
    
    for (const entry of viewCacheEntries) {
      const productViewCache = new ProductViewCache(entry);
      await productViewCache.save();
    }

    console.log('\n=== Trending Data Initialization Complete ===');
    console.log(`Processed ${processedCount} products`);
    console.log(`Created ${viewCacheEntries.length} ProductViewCache entries`);

    // Generate statistics
    const topTrendingProducts = await Product.find({ isActive: true })
      .sort({ trendingScore: -1 })
      .limit(10)
      .select('name trendingScore viewCount');

    console.log('\nTop 10 Trending Products:');
    topTrendingProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} (Score: ${product.trendingScore}, Views: ${product.viewCount})`);
    });

    // Cache statistics
    const cacheStats = await ProductViewCache.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          avgTrendingScore: { $avg: '$trendingScore' },
          maxTrendingScore: { $max: '$trendingScore' },
          minTrendingScore: { $min: '$trendingScore' },
          totalViews: { $sum: '$totalViews' }
        }
      }
    ]);

    if (cacheStats.length > 0) {
      const stats = cacheStats[0];
      console.log('\nCache Statistics:');
      console.log(`  Total products in cache: ${stats.totalProducts}`);
      console.log(`  Average trending score: ${stats.avgTrendingScore.toFixed(2)}`);
      console.log(`  Max trending score: ${stats.maxTrendingScore}`);
      console.log(`  Min trending score: ${stats.minTrendingScore}`);
      console.log(`  Total views tracked: ${stats.totalViews}`);
    }

    // Verify trending calculations
    const recentlyTrendingCount = await Product.countDocuments({ 
      trendingScore: { $gte: 50 },
      isActive: true 
    });
    
    console.log(`\nProducts with high trending scores (≥50): ${recentlyTrendingCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding trending data:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedTrendingData();