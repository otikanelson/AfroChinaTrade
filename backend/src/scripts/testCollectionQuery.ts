import mongoose from 'mongoose';
import Product from '../models/Product';
import Collection from '../models/Collection';
import { connectDatabase } from '../config/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testCollectionQuery() {
  try {
    console.log('🔍 Connecting to database...');
    await connectDatabase();
    
    // Find the "Featured Wireless electronics" collection
    const collection = await Collection.findOne({ name: /Featured.*Wireless.*electronics/i });
    
    if (!collection) {
      console.log('❌ Collection not found');
      return;
    }
    
    console.log('✅ Found collection:', collection.name);
    console.log('📋 Filters:', JSON.stringify(collection.filters, null, 2));
    
    // Build the query manually to test
    const query: any = { isActive: true };
    
    collection.filters.forEach((filter: any) => {
      console.log(`🔍 Processing filter: ${filter.type} = ${JSON.stringify(filter.value)}`);
      
      switch (filter.type) {
        case 'category':
          query.category = filter.value;
          break;
        
        case 'name_contains':
          query.name = { $regex: filter.value, $options: 'i' };
          break;
        
        case 'tag':
          if (Array.isArray(filter.value)) {
            query.tags = { $in: filter.value };
          } else {
            query.tags = { $in: [filter.value] };
          }
          break;
        
        case 'price_range':
          if (typeof filter.value === 'object' && filter.value !== null) {
            const range = filter.value as { min?: number; max?: number };
            if (range.min !== undefined) query.price = { ...query.price, $gte: range.min };
            if (range.max !== undefined) query.price = { ...query.price, $lte: range.max };
          }
          break;
        
        case 'rating_min':
          query.rating = { $gte: filter.value };
          break;
        
        case 'discount_min':
          query.discount = { $gte: filter.value };
          break;
        
        case 'supplier':
          query.supplierId = filter.value;
          break;
      }
    });
    
    console.log('🔍 Final query:', JSON.stringify(query, null, 2));
    
    // Test the query
    const products = await Product.find(query).select('name category tags isFeatured isActive');
    console.log(`📦 Found ${products.length} products matching the query`);
    
    products.forEach((product: any, index: number) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Tags: ${JSON.stringify(product.tags)}`);
      console.log(`   Featured: ${product.isFeatured}`);
      console.log(`   Active: ${product.isActive}`);
      console.log('');
    });
    
    // Also check all products with "Wireless" in the name
    console.log('\n🔍 All products with "Wireless" in name:');
    const wirelessProducts = await Product.find({ 
      name: { $regex: 'Wireless', $options: 'i' },
      isActive: true 
    }).select('name category tags isFeatured');
    
    wirelessProducts.forEach((product: any, index: number) => {
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
    console.log('✅ Test completed');
  }
}

// Run the test
testCollectionQuery();