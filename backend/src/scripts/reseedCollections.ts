import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Collection from '../models/Collection';
import Product from '../models/Product';
import User from '../models/User';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || '';

async function reseedCollections() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get an admin user to use as createdBy
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }
    console.log(`👤 Using admin user: ${adminUser.email}\n`);

    // Get all unique tags from products
    const allProducts = await Product.find({}, { tags: 1 });
    const usedTags = new Set<string>();
    allProducts.forEach(product => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach(tag => usedTags.add(tag));
      }
    });

    console.log(`\n🏷️  Available tags in database: ${Array.from(usedTags).join(', ')}`);
    console.log(`   Total unique tags: ${usedTags.size}\n`);

    // Delete all existing collections
    const deleteResult = await Collection.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing collections\n`);

    // Create new collections with real tags
    const newCollections = [
      {
        name: 'Trending Now',
        description: 'Hot products everyone is buying',
        filters: [{ type: 'tag', value: 'trending' }],
        isActive: true,
        displayOrder: 1,
        createdBy: adminUser._id,
      },
      {
        name: 'New Arrivals',
        description: 'Fresh products just added',
        filters: [{ type: 'tag', value: 'new' }],
        isActive: true,
        displayOrder: 2,
        createdBy: adminUser._id,
      },
      {
        name: 'On Sale',
        description: 'Great deals and discounts',
        filters: [{ type: 'tag', value: 'sale' }],
        isActive: true,
        displayOrder: 3,
        createdBy: adminUser._id,
      },
      {
        name: 'Bestsellers',
        description: 'Our most popular products',
        filters: [{ type: 'tag', value: 'bestseller' }],
        isActive: true,
        displayOrder: 4,
        createdBy: adminUser._id,
      },
      {
        name: 'Premium Collection',
        description: 'High-end premium products',
        filters: [{ type: 'tag', value: 'premium' }],
        isActive: true,
        displayOrder: 5,
        createdBy: adminUser._id,
      },
      {
        name: 'Eco-Friendly',
        description: 'Sustainable and environmentally conscious products',
        filters: [{ type: 'tag', value: 'eco-friendly' }],
        isActive: true,
        displayOrder: 6,
        createdBy: adminUser._id,
      },
      {
        name: 'Gaming Gear',
        description: 'Products for gamers',
        filters: [{ type: 'tag', value: 'gaming' }],
        isActive: true,
        displayOrder: 7,
        createdBy: adminUser._id,
      },
      {
        name: 'Wireless Tech',
        description: 'Wireless devices and accessories',
        filters: [{ type: 'tag', value: 'wireless' }],
        isActive: true,
        displayOrder: 8,
        createdBy: adminUser._id,
      },
      {
        name: 'Professional',
        description: 'Professional grade products',
        filters: [{ type: 'tag', value: 'professional' }],
        isActive: true,
        displayOrder: 9,
        createdBy: adminUser._id,
      },
      {
        name: 'Smart Devices',
        description: 'Smart and connected products',
        filters: [{ type: 'tag', value: 'smart' }],
        isActive: true,
        displayOrder: 10,
        createdBy: adminUser._id,
      },
    ];

    // Only create collections for tags that exist
    const collectionsToCreate = newCollections.filter(collection => {
      const tagFilter = collection.filters.find(f => f.type === 'tag');
      if (tagFilter) {
        return usedTags.has(tagFilter.value);
      }
      return true;
    });

    console.log(`📦 Creating ${collectionsToCreate.length} collections with valid tags...\n`);

    for (const collectionData of collectionsToCreate) {
      const collection = await Collection.create(collectionData);
      
      // Count products in this collection
      const tagFilter = collection.filters.find(f => f.type === 'tag');
      if (tagFilter) {
        const productCount = await Product.countDocuments({ tags: String(tagFilter.value) });
        console.log(`✅ Created "${collection.name}" - ${productCount} products`);
      }
    }

    // Show which collections were skipped
    const skippedCollections = newCollections.filter(collection => {
      const tagFilter = collection.filters.find(f => f.type === 'tag');
      if (tagFilter) {
        return !usedTags.has(tagFilter.value);
      }
      return false;
    });

    if (skippedCollections.length > 0) {
      console.log(`\n⚠️  Skipped ${skippedCollections.length} collections (no products with these tags):`);
      skippedCollections.forEach(c => {
        const tagFilter = c.filters.find(f => f.type === 'tag');
        console.log(`   - ${c.name} (tag: ${tagFilter?.value})`);
      });
    }

    console.log(`\n🎉 Successfully created ${collectionsToCreate.length} collections with real tags`);
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error reseeding collections:', error);
    process.exit(1);
  }
}

// Run the script
reseedCollections();
