import mongoose from 'mongoose';
import Product from '../models/Product';
import { connectDatabase } from '../config/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function fixFeaturedTags() {
  try {
    console.log('🔍 Connecting to database...');
    await connectDatabase();
    
    // Find all products that are featured but don't have "featured" in their tags
    const featuredProducts = await Product.find({ 
      isFeatured: true,
      tags: { $ne: "featured" } // Not equal to "featured" (won't match if "featured" is in array)
    });
    
    console.log(`📦 Found ${featuredProducts.length} featured products without "featured" tag`);
    
    for (const product of featuredProducts) {
      console.log(`🔄 Updating product: ${product.name}`);
      console.log(`   Current tags: ${JSON.stringify(product.tags)}`);
      
      // Add "featured" to the tags array if it's not already there
      if (!product.tags.includes('featured')) {
        product.tags.push('featured');
        await product.save();
        console.log(`   ✅ Added "featured" tag`);
      } else {
        console.log(`   ℹ️ Already has "featured" tag`);
      }
    }
    
    // Also check products that are not featured but have the "featured" tag
    const nonFeaturedWithTag = await Product.find({ 
      isFeatured: false,
      tags: "featured"
    });
    
    console.log(`\n📦 Found ${nonFeaturedWithTag.length} non-featured products with "featured" tag`);
    
    for (const product of nonFeaturedWithTag) {
      console.log(`🔄 Removing "featured" tag from: ${product.name}`);
      product.tags = product.tags.filter((tag: string) => tag !== 'featured');
      await product.save();
      console.log(`   ✅ Removed "featured" tag`);
    }
    
    console.log('\n🔍 Final verification - checking collection query...');
    
    // Test the collection query again
    const query = {
      isActive: true,
      name: { $regex: 'Wireless', $options: 'i' },
      category: 'Electronics',
      tags: { $in: ['featured'] }
    };
    
    const matchingProducts = await Product.find(query).select('name category tags isFeatured');
    console.log(`📦 Products matching collection query: ${matchingProducts.length}`);
    
    matchingProducts.forEach((product: any, index: number) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Tags: ${JSON.stringify(product.tags)}`);
      console.log(`   Featured: ${product.isFeatured}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Fix completed');
  }
}

// Run the fix
fixFeaturedTags();