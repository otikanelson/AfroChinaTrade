import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Product from '../models/Product';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || '';

async function seedProductTags() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Define tag mappings based on product name/category patterns
    const tagMappings = [
      // Status/Promotion tags
      { keywords: ['sale', 'discount', 'clearance'], tag: 'On Sale', priority: 1 },
      { keywords: ['trending', 'popular', 'hot'], tag: 'Trending', priority: 1 },
      { keywords: ['bestseller', 'best seller', 'top rated'], tag: 'Bestseller', priority: 1 },
      { keywords: ['premium', 'luxury', 'high-end', 'pro'], tag: 'Premium', priority: 1 },
      { keywords: ['limited', 'exclusive', 'special edition'], tag: 'Limited Edition', priority: 1 },
      
      // Product categories
      { keywords: ['wireless', 'bluetooth', 'wifi'], tag: 'Wireless', priority: 2 },
      { keywords: ['gaming', 'gamer', 'game'], tag: 'Gaming', priority: 2 },
      { keywords: ['smart', 'intelligent', 'ai'], tag: 'Smart Device', priority: 2 },
      { keywords: ['fitness', 'workout', 'exercise', 'gym'], tag: 'Fitness', priority: 2 },
      { keywords: ['office', 'desk', 'workspace'], tag: 'Office', priority: 2 },
      { keywords: ['kitchen', 'cooking', 'chef'], tag: 'Kitchen', priority: 2 },
      { keywords: ['outdoor', 'camping', 'hiking'], tag: 'Outdoor', priority: 2 },
      { keywords: ['travel', 'portable', 'compact'], tag: 'Travel', priority: 2 },
      
      // Features
      { keywords: ['waterproof', 'water resistant'], tag: 'Waterproof', priority: 3 },
      { keywords: ['rechargeable', 'battery'], tag: 'Rechargeable', priority: 3 },
      { keywords: ['eco', 'sustainable', 'green', 'organic'], tag: 'Eco-Friendly', priority: 3 },
      { keywords: ['professional', 'commercial', 'industrial'], tag: 'Professional', priority: 3 },
      { keywords: ['adjustable', 'customizable'], tag: 'Adjustable', priority: 3 },
      { keywords: ['durable', 'heavy duty', 'rugged'], tag: 'Durable', priority: 3 },
      
      // Materials
      { keywords: ['leather', 'genuine leather'], tag: 'Leather', priority: 4 },
      { keywords: ['stainless steel', 'steel'], tag: 'Stainless Steel', priority: 4 },
      { keywords: ['cotton', '100% cotton'], tag: 'Cotton', priority: 4 },
      { keywords: ['wood', 'wooden', 'bamboo'], tag: 'Wood', priority: 4 },
      { keywords: ['glass', 'tempered glass'], tag: 'Glass', priority: 4 },
      
      // Electronics specific
      { keywords: ['usb', 'usb-c', 'type-c'], tag: 'USB', priority: 3 },
      { keywords: ['led', 'oled', 'lcd'], tag: 'LED', priority: 3 },
      { keywords: ['hd', '4k', 'ultra hd', 'full hd'], tag: 'High Definition', priority: 3 },
      { keywords: ['noise cancelling', 'noise canceling'], tag: 'Noise Cancelling', priority: 3 },
      
      // Style/Design
      { keywords: ['modern', 'contemporary'], tag: 'Modern', priority: 4 },
      { keywords: ['classic', 'traditional', 'vintage'], tag: 'Classic', priority: 4 },
      { keywords: ['minimalist', 'minimal', 'simple'], tag: 'Minimalist', priority: 4 },
      { keywords: ['colorful', 'multicolor', 'vibrant'], tag: 'Colorful', priority: 4 },
    ];

    console.log('🏷️  Analyzing products and adding tags...\n');

    const allProducts = await Product.find({});
    let totalTagsAdded = 0;
    let productsUpdated = 0;

    for (const product of allProducts) {
      const productText = `${product.name} ${product.description || ''} ${product.category || ''}`.toLowerCase();
      const newTags: string[] = [];

      // Find matching tags
      for (const mapping of tagMappings) {
        const matches = mapping.keywords.some(keyword => 
          productText.includes(keyword.toLowerCase())
        );
        
        if (matches && !newTags.includes(mapping.tag)) {
          newTags.push(mapping.tag);
        }
      }

      // Limit to 5 tags per product (prioritize by priority level)
      const sortedTags = newTags.sort((a, b) => {
        const priorityA = tagMappings.find(m => m.tag === a)?.priority || 999;
        const priorityB = tagMappings.find(m => m.tag === b)?.priority || 999;
        return priorityA - priorityB;
      }).slice(0, 5);

      if (sortedTags.length > 0) {
        product.tags = sortedTags;
        await product.save();
        productsUpdated++;
        totalTagsAdded += sortedTags.length;
        console.log(`✅ ${product.name}: [${sortedTags.join(', ')}]`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Products updated: ${productsUpdated}`);
    console.log(`   Total tags added: ${totalTagsAdded}`);
    console.log(`   Average tags per product: ${(totalTagsAdded / productsUpdated).toFixed(1)}`);

    // Show unique tags created
    const uniqueTags = new Set<string>();
    const updatedProducts = await Product.find({ tags: { $exists: true, $ne: [] } });
    updatedProducts.forEach(p => {
      if (p.tags) p.tags.forEach(tag => uniqueTags.add(tag));
    });

    console.log(`\n🏷️  Unique tags created (${uniqueTags.size}):`);
    console.log(`   ${Array.from(uniqueTags).sort().join(', ')}`);
    
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding tags:', error);
    process.exit(1);
  }
}

// Run the script
seedProductTags();
