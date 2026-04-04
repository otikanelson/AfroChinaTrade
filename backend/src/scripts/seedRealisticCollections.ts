import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Collection from '../models/Collection';
import User from '../models/User';
import Product from '../models/Product';
import Tag from '../models/Tag';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || '';

async function seedRealisticCollections() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ No admin user found');
      process.exit(1);
    }

    // Get all available tags to verify they exist
    const availableTags = await Tag.find({ isActive: true });
    const tagNames = availableTags.map(t => t.name);
    console.log(`📊 Found ${tagNames.length} available tags\n`);

    // Delete existing collections
    const deleteResult = await Collection.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing collections\n`);

    // Define realistic collections using only existing tags
    const collections = [
      {
        name: 'Premium Selection',
        description: 'Our finest premium products',
        filters: [{ type: 'tag', value: 'Premium' }],
        displayOrder: 1,
      },
      {
        name: 'Smart Home & Tech',
        description: 'Smart devices for modern living',
        filters: [{ type: 'tag', value: 'Smart Device' }],
        displayOrder: 2,
      },
      {
        name: 'On Sale Now',
        description: 'Great deals and discounts',
        filters: [{ type: 'discount_min', value: 10 }],
        displayOrder: 3,
      },
      {
        name: 'Professional Grade',
        description: 'Professional quality products',
        filters: [{ type: 'tag', value: 'Professional' }],
        displayOrder: 4,
      },
      {
        name: 'Eco-Friendly Choices',
        description: 'Sustainable and environmentally conscious',
        filters: [{ type: 'tag', value: 'Eco-Friendly' }],
        displayOrder: 5,
      },
      {
        name: 'Trending Products',
        description: 'What everyone is buying right now',
        filters: [{ type: 'tag', value: 'Trending' }],
        displayOrder: 6,
      },
      {
        name: 'Fitness & Wellness',
        description: 'Stay healthy and active',
        filters: [{ type: 'tag', value: 'Fitness' }],
        displayOrder: 7,
      },
      {
        name: 'Gaming Essentials',
        description: 'Level up your gaming setup',
        filters: [{ type: 'tag', value: 'Gaming' }],
        displayOrder: 8,
      },
      {
        name: 'Office & Workspace',
        description: 'Productivity tools for your workspace',
        filters: [{ type: 'tag', value: 'Office' }],
        displayOrder: 9,
      },
      {
        name: 'Kitchen Must-Haves',
        description: 'Essential kitchen products',
        filters: [{ type: 'tag', value: 'Kitchen' }],
        displayOrder: 10,
      },
      {
        name: 'Travel Essentials',
        description: 'Perfect for travelers',
        filters: [{ type: 'tag', value: 'Travel' }],
        displayOrder: 11,
      },
      {
        name: 'Outdoor Adventure',
        description: 'Gear for outdoor enthusiasts',
        filters: [{ type: 'tag', value: 'Outdoor' }],
        displayOrder: 12,
      },
      {
        name: 'Rechargeable Products',
        description: 'Convenient rechargeable items',
        filters: [{ type: 'tag', value: 'Rechargeable' }],
        displayOrder: 13,
      },
      {
        name: 'Leather Collection',
        description: 'Premium leather products',
        filters: [{ type: 'tag', value: 'Leather' }],
        displayOrder: 14,
      },
      {
        name: 'Modern Design',
        description: 'Contemporary and stylish',
        filters: [{ type: 'tag', value: 'Modern' }],
        displayOrder: 15,
      },
      {
        name: 'Classic Timeless',
        description: 'Timeless classic designs',
        filters: [{ type: 'tag', value: 'Classic' }],
        displayOrder: 16,
      },
      {
        name: 'Minimalist Style',
        description: 'Simple and elegant',
        filters: [{ type: 'tag', value: 'Minimalist' }],
        displayOrder: 17,
      },
      {
        name: 'Adjustable & Customizable',
        description: 'Products you can adjust to your needs',
        filters: [{ type: 'tag', value: 'Adjustable' }],
        displayOrder: 18,
      },
      {
        name: 'Wooden Crafts',
        description: 'Beautiful wooden products',
        filters: [{ type: 'tag', value: 'Wood' }],
        displayOrder: 19,
      },
      {
        name: 'Stainless Steel Quality',
        description: 'Durable stainless steel items',
        filters: [{ type: 'tag', value: 'Stainless Steel' }],
        displayOrder: 20,
      },
      {
        name: 'High-End Electronics',
        description: 'Premium electronic devices',
        filters: [
          { type: 'category', value: 'Electronics' },
          { type: 'tag', value: 'Premium' }
        ],
        displayOrder: 21,
      },
      {
        name: 'Budget Friendly',
        description: 'Quality products under ₦50,000',
        filters: [{ type: 'price_range', value: { min: 0, max: 50000 } }],
        displayOrder: 22,
      },
      {
        name: 'Top Rated',
        description: 'Highly rated by customers',
        filters: [{ type: 'rating_min', value: 4.5 }],
        displayOrder: 23,
      },
      {
        name: 'Big Discounts',
        description: 'Save 30% or more',
        filters: [{ type: 'discount_min', value: 30 }],
        displayOrder: 24,
      },
    ];

    console.log('📦 Creating collections...\n');

    let created = 0;
    let skipped = 0;

    for (const collectionData of collections) {
      // Verify all tag filters use existing tags
      const tagFilters = collectionData.filters.filter(f => f.type === 'tag');
      const allTagsExist = tagFilters.every(f => tagNames.includes(f.value as string));

      if (!allTagsExist) {
        console.log(`⚠️  Skipping "${collectionData.name}" - uses non-existent tags`);
        skipped++;
        continue;
      }

      const collection = await Collection.create({
        ...collectionData,
        createdBy: adminUser._id,
        isActive: true,
      });

      // Count products
      const query: any = { isActive: true };
      collectionData.filters.forEach(filter => {
        switch (filter.type) {
          case 'tag':
            query.tags = { $in: [filter.value] };
            break;
          case 'category':
            query.category = filter.value;
            break;
          case 'price_range':
            const range = filter.value as { min?: number; max?: number };
            if (range.min !== undefined) query.price = { ...query.price, $gte: range.min };
            if (range.max !== undefined) query.price = { ...query.price, $lte: range.max };
            break;
          case 'rating_min':
            query.rating = { $gte: filter.value };
            break;
          case 'discount_min':
            query.discount = { $gte: filter.value };
            break;
        }
      });

      const productCount = await Product.countDocuments(query);
      console.log(`✅ ${collection.name.padEnd(30)} - ${productCount} products`);
      created++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Created: ${created} collections`);
    console.log(`   Skipped: ${skipped} collections`);
    console.log(`\n🎉 Successfully seeded ${created} realistic collections`);
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding collections:', error);
    process.exit(1);
  }
}

// Run the script
seedRealisticCollections();
