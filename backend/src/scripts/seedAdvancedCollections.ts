import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Collection from '../models/Collection';
import User from '../models/User';

// Load environment variables
dotenv.config();

/**
 * Advanced Collections Seeder
 * Creates diverse, engaging product collections for the marketplace
 */

async function seedAdvancedCollections() {
  try {
    console.log('🚀 Starting advanced collections seeding...\n');
    
    // Connect to database
    await connectDatabase();
    console.log('✅ Connected to database\n');

    // Find or create admin user
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('👤 Creating admin user...');
      adminUser = await User.create({
        name: 'System Admin',
        email: 'admin@afrochinatrade.com',
        password: 'Admin@123',
        role: 'admin',
        status: 'active'
      });
      console.log('✅ Admin user created\n');
    }

    // Advanced collections with diverse filtering strategies
    const collections = [
      // 🎯 Category-Based Collections
      {
        name: 'Tech Essentials',
        description: 'Must-have electronic devices and gadgets for modern life',
        filters: [
          { type: 'category', value: 'Electronics', operator: 'equals' }
        ],
        displayOrder: 1
      },
      {
        name: 'Fashion Forward',
        description: 'Trendy clothing and accessories for style-conscious shoppers',
        filters: [
          { type: 'category', value: 'Fashion', operator: 'equals' }
        ],
        displayOrder: 2
      },
      {
        name: 'Home & Living',
        description: 'Transform your space with furniture and home decor',
        filters: [
          { type: 'category', value: 'Furniture', operator: 'equals' }
        ],
        displayOrder: 3
      },
      {
        name: 'Auto Parts & Accessories',
        description: 'Everything you need for your vehicle',
        filters: [
          { type: 'category', value: 'Automotive', operator: 'equals' }
        ],
        displayOrder: 4
      },
      {
        name: 'Books & Media',
        description: 'Expand your knowledge with books and educational materials',
        filters: [
          { type: 'category', value: 'Books and Media', operator: 'equals' }
        ],
        displayOrder: 5
      },

      // 💰 Price-Based Collections
      {
        name: 'Budget Finds',
        description: 'Great products under ₦50,000 - quality without breaking the bank',
        filters: [
          { type: 'price_range', value: { min: 0, max: 50000 }, operator: 'lte' }
        ],
        displayOrder: 6
      },
      {
        name: 'Premium Selection',
        description: 'High-end products for those who demand the best',
        filters: [
          { type: 'price_range', value: { min: 200000 }, operator: 'gte' }
        ],
        displayOrder: 7
      },
      {
        name: 'Mid-Range Favorites',
        description: 'Perfect balance of quality and affordability',
        filters: [
          { type: 'price_range', value: { min: 50000, max: 200000 } }
        ],
        displayOrder: 8
      },

      // 🏷️ Tag-Based Collections
      {
        name: 'Wireless World',
        description: 'Cut the cord with wireless technology products',
        filters: [
          { type: 'tag', value: 'wireless', operator: 'contains' }
        ],
        displayOrder: 9
      },
      {
        name: 'Gaming Zone',
        description: 'Level up your gaming experience',
        filters: [
          { type: 'tag', value: 'gaming', operator: 'contains' }
        ],
        displayOrder: 10
      },
      {
        name: 'Fitness & Health',
        description: 'Stay fit and healthy with our wellness products',
        filters: [
          { type: 'tag', value: 'fitness', operator: 'contains' }
        ],
        displayOrder: 11
      },
      {
        name: 'Smart Home',
        description: 'Make your home intelligent with smart devices',
        filters: [
          { type: 'tag', value: 'smart', operator: 'contains' }
        ],
        displayOrder: 12
      },
      {
        name: 'Professional Tools',
        description: 'Professional-grade equipment for work and business',
        filters: [
          { type: 'tag', value: 'professional', operator: 'contains' }
        ],
        displayOrder: 13
      },
      {
        name: 'Eco-Friendly',
        description: 'Sustainable and environmentally conscious products',
        filters: [
          { type: 'tag', value: 'eco', operator: 'contains' }
        ],
        displayOrder: 14
      },

      // 🎨 Lifestyle Collections
      {
        name: 'Minimalist Living',
        description: 'Clean, simple designs for the minimalist lifestyle',
        filters: [
          { type: 'tag', value: 'minimalist', operator: 'contains' }
        ],
        displayOrder: 15
      },
      {
        name: 'Luxury Collection',
        description: 'Indulge in luxury with our premium product selection',
        filters: [
          { type: 'tag', value: 'luxury', operator: 'contains' }
        ],
        displayOrder: 16
      },
      {
        name: 'Outdoor Adventures',
        description: 'Gear up for your next outdoor adventure',
        filters: [
          { type: 'tag', value: 'outdoor', operator: 'contains' }
        ],
        displayOrder: 17
      },

      // 🔥 Special Collections
      {
        name: 'Hot Deals',
        description: 'Products with amazing discounts - limited time offers',
        filters: [
          { type: 'discount_min', value: 20, operator: 'gte' }
        ],
        displayOrder: 18
      },
      {
        name: 'New Arrivals',
        description: 'Fresh products just added to our marketplace',
        filters: [
          { type: 'tag', value: 'new', operator: 'contains' }
        ],
        displayOrder: 19
      },
      {
        name: 'Bestsellers',
        description: 'Most popular products loved by our customers',
        filters: [
          { type: 'tag', value: 'bestseller', operator: 'contains' }
        ],
        displayOrder: 20
      },

      // 🎯 Specific Use Cases
      {
        name: 'Work From Home',
        description: 'Essential items for productive remote work',
        filters: [
          { type: 'tag', value: 'office', operator: 'contains' }
        ],
        displayOrder: 21
      },
      {
        name: 'Student Essentials',
        description: 'Everything students need for academic success',
        filters: [
          { type: 'tag', value: 'student', operator: 'contains' }
        ],
        displayOrder: 22
      },
      {
        name: 'Travel Gear',
        description: 'Make your travels comfortable and convenient',
        filters: [
          { type: 'tag', value: 'travel', operator: 'contains' }
        ],
        displayOrder: 23
      },
      {
        name: 'Kitchen Essentials',
        description: 'Cook like a pro with our kitchen collection',
        filters: [
          { type: 'tag', value: 'kitchen', operator: 'contains' }
        ],
        displayOrder: 24
      },

      // 🌟 Quality-Based Collections
      {
        name: 'Top Rated',
        description: 'Highest rated products with excellent customer reviews',
        filters: [
          { type: 'rating_min', value: 4.5, operator: 'gte' }
        ],
        displayOrder: 25
      },
      {
        name: 'Customer Favorites',
        description: 'Products with consistently positive feedback',
        filters: [
          { type: 'rating_min', value: 4.0, operator: 'gte' }
        ],
        displayOrder: 26
      },

      // 🎨 Material & Design Collections
      {
        name: 'Leather Goods',
        description: 'Premium leather products for style and durability',
        filters: [
          { type: 'tag', value: 'leather', operator: 'contains' }
        ],
        displayOrder: 27
      },
      {
        name: 'Stainless Steel',
        description: 'Durable stainless steel products for long-lasting use',
        filters: [
          { type: 'tag', value: 'stainless steel', operator: 'contains' }
        ],
        displayOrder: 28
      },
      {
        name: 'Cotton Comfort',
        description: 'Soft, breathable cotton products for everyday comfort',
        filters: [
          { type: 'tag', value: 'cotton', operator: 'contains' }
        ],
        displayOrder: 29
      },

      // 🎯 Seasonal Collections
      {
        name: 'Summer Essentials',
        description: 'Beat the heat with our summer collection',
        filters: [
          { type: 'tag', value: 'summer', operator: 'contains' }
        ],
        displayOrder: 30
      },
      {
        name: 'Winter Warmth',
        description: 'Stay cozy during the cold season',
        filters: [
          { type: 'tag', value: 'winter', operator: 'contains' }
        ],
        displayOrder: 31
      },

      // 🎁 Gift Collections
      {
        name: 'Perfect Gifts',
        description: 'Thoughtful gifts for your loved ones',
        filters: [
          { type: 'tag', value: 'gift', operator: 'contains' }
        ],
        displayOrder: 32
      },
      {
        name: 'Corporate Gifts',
        description: 'Professional gifts for business relationships',
        filters: [
          { type: 'tag', value: 'corporate', operator: 'contains' }
        ],
        displayOrder: 33
      },

      // 🔧 Technical Collections
      {
        name: 'DIY & Tools',
        description: 'Tools and supplies for do-it-yourself projects',
        filters: [
          { type: 'tag', value: 'diy', operator: 'contains' }
        ],
        displayOrder: 34
      },
      {
        name: 'Car Care',
        description: 'Keep your vehicle in perfect condition',
        filters: [
          { type: 'tag', value: 'car care', operator: 'contains' }
        ],
        displayOrder: 35
      }
    ];

    console.log(`📦 Creating ${collections.length} collections...\n`);

    let createdCount = 0;
    let existingCount = 0;

    // Create collections
    for (const collectionData of collections) {
      try {
        const existingCollection = await Collection.findOne({ name: collectionData.name });
        
        if (!existingCollection) {
          await Collection.create({
            ...collectionData,
            createdBy: adminUser._id,
            isActive: true
          });
          console.log(`✅ Created: "${collectionData.name}"`);
          createdCount++;
        } else {
          console.log(`⏭️  Exists: "${collectionData.name}"`);
          existingCount++;
        }
      } catch (error) {
        console.error(`❌ Failed to create "${collectionData.name}":`, error);
      }
    }

    console.log('\n🎉 Collections seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   ✅ Created: ${createdCount} collections`);
    console.log(`   ⏭️  Existing: ${existingCount} collections`);
    console.log(`   📦 Total: ${collections.length} collections processed`);

  } catch (error) {
    console.error('❌ Error seeding collections:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run if executed directly
if (require.main === module) {
  seedAdvancedCollections();
}

export default seedAdvancedCollections;