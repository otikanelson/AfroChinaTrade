import mongoose from 'mongoose';
import BrowsingHistory from '../models/BrowsingHistory';
import User from '../models/User';
import Product from '../models/Product';

/**
 * Seed browsing history with realistic user interaction patterns
 * This script generates sample browsing history data for testing and development
 */

interface InteractionPattern {
  type: 'view' | 'cart_add' | 'wishlist_add' | 'purchase';
  weight: number; // Probability weight
  sessionDuration?: number; // Average session duration in minutes
}

const INTERACTION_PATTERNS: InteractionPattern[] = [
  { type: 'view', weight: 70, sessionDuration: 2 }, // 70% of interactions are views
  { type: 'cart_add', weight: 15, sessionDuration: 5 }, // 15% add to cart
  { type: 'wishlist_add', weight: 10, sessionDuration: 3 }, // 10% add to wishlist
  { type: 'purchase', weight: 5, sessionDuration: 10 }, // 5% result in purchase
];

const CATEGORIES_PREFERENCES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports & Outdoors',
  'Health & Beauty',
  'Books & Media',
  'Toys & Games',
  'Automotive',
  'Food & Beverages',
  'Office Supplies',
];

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getRandomInteractionType(): 'view' | 'cart_add' | 'wishlist_add' | 'purchase' {
  const totalWeight = INTERACTION_PATTERNS.reduce((sum, pattern) => sum + pattern.weight, 0);
  const random = Math.random() * totalWeight;
  
  let currentWeight = 0;
  for (const pattern of INTERACTION_PATTERNS) {
    currentWeight += pattern.weight;
    if (random <= currentWeight) {
      return pattern.type;
    }
  }
  
  return 'view'; // Fallback
}

function generateViewMetadata() {
  return {
    viewDuration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
    scrollDepth: Math.floor(Math.random() * 100) + 1, // 1-100%
    imageViews: Math.floor(Math.random() * 5) + 1, // 1-5 images viewed
  };
}

function generateTimestampInPast(daysAgo: number): Date {
  const now = new Date();
  const pastDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  
  // Add some randomness within the day
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);
  
  pastDate.setHours(randomHours, randomMinutes, 0, 0);
  return pastDate;
}

async function seedBrowsingHistory() {
  try {
    // Use MongoDB URI from environment or Atlas as fallback
    const mongoUri = process.env.MONGODB_URI || 'mongodb://Nelson:NELSON2005@ac-e3a4d1f-shard-00-00.pg9c7ou.mongodb.net:27017,ac-e3a4d1f-shard-00-01.pg9c7ou.mongodb.net:27017,ac-e3a4d1f-shard-00-02.pg9c7ou.mongodb.net:27017/afrochinatrade?ssl=true&authSource=admin&retryWrites=true&w=majority';
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get all customer users (exclude admins) and products
    const users = await User.find({ 
      status: 'active', 
      role: { $ne: 'admin' } // Exclude admin users
    }).limit(50); // Limit to 50 users for demo
    const products = await Product.find({ isActive: true });

    if (users.length === 0) {
      console.log('No users found. Please seed users first.');
      process.exit(1);
    }

    if (products.length === 0) {
      console.log('No products found. Please seed products first.');
      process.exit(1);
    }

    console.log(`Found ${users.length} users and ${products.length} products`);

    // Clear existing browsing history
    await BrowsingHistory.deleteMany({});
    console.log('Cleared existing browsing history');

    let totalInteractions = 0;
    const interactionCounts = {
      view: 0,
      cart_add: 0,
      wishlist_add: 0,
      purchase: 0,
    };

    // Generate browsing history for each user
    for (const user of users) {
      // Each user gets 10-50 interactions over the past 90 days
      const userInteractionCount = Math.floor(Math.random() * 40) + 10;
      
      // Generate user preferences (favor certain categories)
      const userPreferredCategories = CATEGORIES_PREFERENCES
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 4) + 2); // 2-5 preferred categories

      const userSessions: string[] = [];
      
      for (let i = 0; i < userInteractionCount; i++) {
        // Generate timestamp (more recent interactions are more likely)
        const daysAgo = Math.floor(Math.pow(Math.random(), 2) * 90); // Weighted towards recent days
        const timestamp = generateTimestampInPast(daysAgo);
        
        // Select a product (favor user's preferred categories)
        let selectedProduct;
        if (Math.random() < 0.7 && userPreferredCategories.length > 0) {
          // 70% chance to select from preferred categories
          const preferredCategory = userPreferredCategories[Math.floor(Math.random() * userPreferredCategories.length)];
          const categoryProducts = products.filter(p => p.category === preferredCategory);
          if (categoryProducts.length > 0) {
            selectedProduct = categoryProducts[Math.floor(Math.random() * categoryProducts.length)];
          }
        }
        
        // Fallback to random product
        if (!selectedProduct) {
          selectedProduct = products[Math.floor(Math.random() * products.length)];
        }

        // Generate interaction type
        const interactionType = getRandomInteractionType();
        
        // Generate or reuse session ID (users tend to have sessions with multiple interactions)
        let sessionId;
        if (userSessions.length > 0 && Math.random() < 0.4) {
          // 40% chance to reuse existing session
          sessionId = userSessions[Math.floor(Math.random() * userSessions.length)];
        } else {
          // Create new session
          sessionId = generateSessionId();
          userSessions.push(sessionId);
          
          // Limit session history to prevent memory issues
          if (userSessions.length > 10) {
            userSessions.shift();
          }
        }

        // Create browsing history entry
        const browsingHistoryEntry = new BrowsingHistory({
          userId: user._id,
          productId: selectedProduct._id,
          interactionType,
          sessionId,
          timestamp,
          deviceInfo: {
            platform: Math.random() > 0.5 ? 'mobile' : 'web',
            userAgent: Math.random() > 0.5 ? 'iOS' : 'Android',
          },
          metadata: interactionType === 'view' ? generateViewMetadata() : undefined,
        });

        await browsingHistoryEntry.save();
        
        totalInteractions++;
        interactionCounts[interactionType]++;
        
        // Log progress every 100 interactions
        if (totalInteractions % 100 === 0) {
          console.log(`Generated ${totalInteractions} interactions...`);
        }
      }
      
      console.log(`Generated ${userInteractionCount} interactions for user: ${user.email}`);
    }

    // Generate some additional interactions for trending products
    const trendingProducts = products
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 10);

    console.log('Generating additional interactions for trending products...');
    
    for (const product of trendingProducts) {
      // Generate 20-100 additional views for trending products
      const additionalViews = Math.floor(Math.random() * 80) + 20;
      
      for (let i = 0; i < additionalViews; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const daysAgo = Math.floor(Math.random() * 7); // Within last week
        const timestamp = generateTimestampInPast(daysAgo);
        
        const browsingHistoryEntry = new BrowsingHistory({
          userId: randomUser._id,
          productId: product._id,
          interactionType: 'view',
          sessionId: generateSessionId(),
          timestamp,
          deviceInfo: {
            platform: Math.random() > 0.5 ? 'mobile' : 'web',
            userAgent: Math.random() > 0.5 ? 'iOS' : 'Android',
          },
          metadata: generateViewMetadata(),
        });

        await browsingHistoryEntry.save();
        totalInteractions++;
        interactionCounts.view++;
      }
    }

    console.log('\n=== Browsing History Seeding Complete ===');
    console.log(`Total interactions generated: ${totalInteractions}`);
    console.log('Interaction breakdown:');
    console.log(`  Views: ${interactionCounts.view} (${((interactionCounts.view / totalInteractions) * 100).toFixed(1)}%)`);
    console.log(`  Cart adds: ${interactionCounts.cart_add} (${((interactionCounts.cart_add / totalInteractions) * 100).toFixed(1)}%)`);
    console.log(`  Wishlist adds: ${interactionCounts.wishlist_add} (${((interactionCounts.wishlist_add / totalInteractions) * 100).toFixed(1)}%)`);
    console.log(`  Purchases: ${interactionCounts.purchase} (${((interactionCounts.purchase / totalInteractions) * 100).toFixed(1)}%)`);
    
    // Generate some statistics
    const uniqueUsers = await BrowsingHistory.distinct('userId');
    const uniqueProducts = await BrowsingHistory.distinct('productId');
    const uniqueSessions = await BrowsingHistory.distinct('sessionId');
    
    console.log(`\nStatistics:`);
    console.log(`  Unique users with history: ${uniqueUsers.length}`);
    console.log(`  Unique products viewed: ${uniqueProducts.length}`);
    console.log(`  Unique sessions: ${uniqueSessions.length}`);
    console.log(`  Average interactions per user: ${(totalInteractions / uniqueUsers.length).toFixed(1)}`);
    console.log(`  Average interactions per session: ${(totalInteractions / uniqueSessions.length).toFixed(1)}`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding browsing history:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedBrowsingHistory();