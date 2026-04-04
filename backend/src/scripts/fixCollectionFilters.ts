import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Collection from '../models/Collection';
import Product from '../models/Product';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || '';

async function fixCollectionFilters() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Fix the "Featured Wireless devices" collection - remove extra space
    const featuredWireless = await Collection.findOne({ name: 'Featured Wireless devices' });
    if (featuredWireless) {
      const nameFilter = featuredWireless.filters.find(f => f.type === 'name_contains');
      if (nameFilter && nameFilter.value === 'Wireless ') {
        nameFilter.value = 'Wireless';
        await featuredWireless.save();
        console.log('✅ Fixed "Featured Wireless devices" collection filter');
      }
    }

    // Get all collections with tag filters
    const collections = await Collection.find({});
    console.log(`\n📦 Found ${collections.length} collections`);

    // Check which tags are actually used in products
    const allProducts = await Product.find({}, { tags: 1, name: 1 });
    const usedTags = new Set<string>();
    allProducts.forEach(product => {
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach(tag => usedTags.add(tag.toLowerCase()));
      }
    });

    console.log(`\n🏷️  Tags currently in use: ${Array.from(usedTags).join(', ')}`);

    // Check each collection
    console.log('\n🔍 Checking collections...\n');
    
    for (const collection of collections) {
      const tagFilters = collection.filters.filter(f => f.type === 'tag');
      if (tagFilters.length > 0) {
        for (const filter of tagFilters) {
          const tagValue = String(filter.value).toLowerCase();
          if (!usedTags.has(tagValue)) {
            console.log(`⚠️  Collection "${collection.name}" uses tag "${filter.value}" but no products have this tag`);
            
            // Try to find products that match the tag in their name
            const matchingProducts = await Product.find({
              name: { $regex: String(filter.value), $options: 'i' }
            });
            
            if (matchingProducts.length > 0) {
              console.log(`   Found ${matchingProducts.length} products with "${filter.value}" in name`);
              console.log(`   Suggestion: Add "${filter.value}" tag to these products or change filter to name_contains`);
            }
          }
        }
      }
    }

    // Add missing tags to products based on their names
    console.log('\n🏷️  Adding missing tags to products...\n');
    
    const tagMappings = [
      { keyword: 'wireless', tag: 'wireless' },
      { keyword: 'gaming', tag: 'gaming' },
      { keyword: 'fitness', tag: 'fitness' },
      { keyword: 'smart', tag: 'smart' },
      { keyword: 'professional', tag: 'professional' },
      { keyword: 'leather', tag: 'leather' },
      { keyword: 'stainless steel', tag: 'stainless steel' },
      { keyword: 'cotton', tag: 'cotton' },
      { keyword: 'office', tag: 'office' },
      { keyword: 'kitchen', tag: 'kitchen' },
    ];

    let updatedCount = 0;
    
    for (const mapping of tagMappings) {
      const products = await Product.find({
        name: { $regex: mapping.keyword, $options: 'i' },
        tags: { $ne: mapping.tag }
      });
      
      for (const product of products) {
        if (!product.tags) product.tags = [];
        if (!product.tags.includes(mapping.tag)) {
          product.tags.push(mapping.tag);
          await product.save();
          updatedCount++;
          console.log(`✅ Added "${mapping.tag}" tag to: ${product.name}`);
        }
      }
    }

    console.log(`\n🎉 Added tags to ${updatedCount} products`);
    
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error fixing collection filters:', error);
    process.exit(1);
  }
}

// Run the script
fixCollectionFilters();
