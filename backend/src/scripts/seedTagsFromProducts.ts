import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Tag from '../models/Tag';
import Product from '../models/Product';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || '';

async function seedTagsFromProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all unique tags from products
    const allProducts = await Product.find({}, { tags: 1 });
    const tagCounts = new Map<string, number>();

    allProducts.forEach(product => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }
    });

    console.log(`📊 Found ${tagCounts.size} unique tags in products\n`);

    // Clear existing tags
    const deleteResult = await Tag.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing tags\n`);

    // Create tags with usage counts
    const tagsToCreate = Array.from(tagCounts.entries()).map(([name, usageCount]) => ({
      name,
      usageCount,
      isActive: true,
    }));

    const createdTags = await Tag.insertMany(tagsToCreate);
    console.log(`✅ Created ${createdTags.length} tags:\n`);

    // Sort by usage count and display
    const sortedTags = createdTags.sort((a, b) => b.usageCount - a.usageCount);
    sortedTags.forEach(tag => {
      console.log(`   ${tag.name.padEnd(25)} - ${tag.usageCount} products`);
    });

    console.log(`\n🎉 Successfully seeded ${createdTags.length} tags from products`);
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding tags:', error);
    process.exit(1);
  }
}

// Run the script
seedTagsFromProducts();
