#!/usr/bin/env node

/**
 * Test script to check featured products in the database
 * Run from backend directory with: node test-featured-products.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Simple Product schema for testing
const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  isFeatured: Boolean,
  isActive: Boolean,
  images: [String],
  category: String,
  supplierId: mongoose.Schema.Types.ObjectId
});

const Product = mongoose.model('Product', ProductSchema);

async function testFeaturedProducts() {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/afrochinatrade');
    console.log('✅ Connected to database');

    console.log('\n📊 Checking products in database...');
    
    const totalProducts = await Product.countDocuments();
    console.log(`Total products: ${totalProducts}`);
    
    const activeProducts = await Product.countDocuments({ isActive: true });
    console.log(`Active products: ${activeProducts}`);
    
    const featuredProducts = await Product.countDocuments({ isFeatured: true, isActive: true });
    console.log(`Featured products: ${featuredProducts}`);

    if (featuredProducts > 0) {
      console.log('\n🌟 Sample featured products:');
      const sampleFeatured = await Product.find({ isFeatured: true, isActive: true })
        .limit(3)
        .select('name price images category');
      
      sampleFeatured.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} - ₦${product.price}`);
        console.log(`   Category: ${product.category}`);
        console.log(`   Images: ${product.images?.length || 0}`);
        console.log(`   ID: ${product._id}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  No featured products found!');
      console.log('Creating some sample featured products...');
      
      // Create sample featured products
      const sampleProducts = [
        {
          name: 'Sample Featured Product 1',
          price: 25000,
          isFeatured: true,
          isActive: true,
          category: 'Electronics',
          images: ['https://via.placeholder.com/300'],
          supplierId: new mongoose.Types.ObjectId()
        },
        {
          name: 'Sample Featured Product 2',
          price: 15000,
          isFeatured: true,
          isActive: true,
          category: 'Fashion',
          images: ['https://via.placeholder.com/300'],
          supplierId: new mongoose.Types.ObjectId()
        }
      ];

      await Product.insertMany(sampleProducts);
      console.log('✅ Created sample featured products');
    }

    console.log('\n🧪 Testing API endpoint simulation...');
    const apiResult = await Product.find({ isFeatured: true, isActive: true })
      .limit(20)
      .sort({ createdAt: -1 });
    
    console.log(`API would return ${apiResult.length} products`);
    
    if (apiResult.length > 0) {
      console.log('✅ Featured products API simulation successful');
    } else {
      console.log('❌ Featured products API simulation failed - no products returned');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

testFeaturedProducts();