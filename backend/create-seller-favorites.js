#!/usr/bin/env node

/**
 * Script to create sample seller favorite products
 * Run from backend directory with: node create-seller-favorites.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Simple Product schema for testing
const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  currency: { type: String, default: 'NGN' },
  images: [String],
  category: String,
  supplierId: mongoose.Schema.Types.ObjectId,
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  stock: { type: Number, default: 10 },
  tags: [String],
  discount: { type: Number, default: 0 },
  isNewProduct: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  isSellerFavorite: { type: Boolean, default: false },
  trendingScore: { type: Number, default: 0 }
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

async function createSellerFavorites() {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/afrochinatrade');
    console.log('✅ Connected to database');

    console.log('\n📊 Checking existing seller favorites...');
    const existingSellerFavorites = await Product.countDocuments({ isSellerFavorite: true, isActive: true });
    console.log(`Existing seller favorites: ${existingSellerFavorites}`);

    if (existingSellerFavorites < 5) {
      console.log('\n🌟 Creating sample seller favorite products...');
      
      const sampleSellerFavorites = [
        {
          name: 'Premium Wireless Headphones - Seller Pick',
          description: 'High-quality wireless headphones with noise cancellation. Handpicked by our sellers for exceptional value.',
          price: 45000,
          category: 'Electronics',
          images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
          isSellerFavorite: true,
          isFeatured: true,
          isActive: true,
          stock: 25,
          rating: 4.8,
          reviewCount: 156,
          viewCount: 1200,
          discount: 20,
          tags: ['electronics', 'audio', 'wireless', 'premium'],
          supplierId: new mongoose.Types.ObjectId()
        },
        {
          name: 'Smart Fitness Watch - Seller Pick',
          description: 'Advanced fitness tracking with heart rate monitor. Top choice among our sellers.',
          price: 35000,
          category: 'Electronics',
          images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
          isSellerFavorite: true,
          isActive: true,
          stock: 18,
          rating: 4.6,
          reviewCount: 89,
          viewCount: 890,
          discount: 15,
          tags: ['electronics', 'fitness', 'smartwatch', 'health'],
          supplierId: new mongoose.Types.ObjectId()
        },
        {
          name: 'Designer Leather Handbag - Seller Pick',
          description: 'Elegant leather handbag perfect for any occasion. Seller recommended for quality and style.',
          price: 28000,
          category: 'Fashion',
          images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'],
          isSellerFavorite: true,
          isActive: true,
          stock: 12,
          rating: 4.9,
          reviewCount: 67,
          viewCount: 650,
          discount: 25,
          tags: ['fashion', 'handbag', 'leather', 'designer'],
          supplierId: new mongoose.Types.ObjectId()
        },
        {
          name: 'Professional Coffee Maker - Seller Pick',
          description: 'Barista-quality coffee maker for home use. Highly recommended by our kitchen appliance sellers.',
          price: 52000,
          category: 'Home & Garden',
          images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400'],
          isSellerFavorite: true,
          isActive: true,
          stock: 8,
          rating: 4.7,
          reviewCount: 134,
          viewCount: 980,
          discount: 10,
          tags: ['home', 'kitchen', 'coffee', 'appliance'],
          supplierId: new mongoose.Types.ObjectId()
        },
        {
          name: 'Gaming Mechanical Keyboard - Seller Pick',
          description: 'RGB mechanical keyboard perfect for gaming and productivity. Top seller choice for gamers.',
          price: 22000,
          category: 'Electronics',
          images: ['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400'],
          isSellerFavorite: true,
          isActive: true,
          stock: 30,
          rating: 4.5,
          reviewCount: 203,
          viewCount: 1500,
          discount: 18,
          tags: ['electronics', 'gaming', 'keyboard', 'mechanical'],
          supplierId: new mongoose.Types.ObjectId()
        }
      ];

      await Product.insertMany(sampleSellerFavorites);
      console.log(`✅ Created ${sampleSellerFavorites.length} seller favorite products`);
    }

    // Also create some trending products by updating view counts and trending scores
    console.log('\n📈 Creating trending products...');
    const existingTrending = await Product.countDocuments({ 
      trendingScore: { $gt: 0 }, 
      isActive: true 
    });
    
    if (existingTrending < 5) {
      // Update some existing products to be trending
      const productsToMakeTrending = await Product.find({ 
        isActive: true,
        trendingScore: { $lte: 0 }
      }).limit(6);

      if (productsToMakeTrending.length > 0) {
        for (let i = 0; i < productsToMakeTrending.length; i++) {
          const product = productsToMakeTrending[i];
          await Product.findByIdAndUpdate(product._id, {
            trendingScore: Math.random() * 100 + 50, // Random score between 50-150
            viewCount: Math.floor(Math.random() * 2000) + 500, // Random views 500-2500
            lastViewedAt: new Date()
          });
        }
        console.log(`✅ Updated ${productsToMakeTrending.length} products to be trending`);
      }
    }

    console.log('\n📊 Final counts:');
    const finalCounts = await Promise.all([
      Product.countDocuments({ isSellerFavorite: true, isActive: true }),
      Product.countDocuments({ isFeatured: true, isActive: true }),
      Product.countDocuments({ trendingScore: { $gt: 0 }, isActive: true }),
      Product.countDocuments({ discount: { $gt: 0 }, isActive: true }),
      Product.countDocuments({ isActive: true })
    ]);

    console.log(`Seller Favorites: ${finalCounts[0]}`);
    console.log(`Featured Products: ${finalCounts[1]}`);
    console.log(`Trending Products: ${finalCounts[2]}`);
    console.log(`Discounted Products: ${finalCounts[3]}`);
    console.log(`Total Active Products: ${finalCounts[4]}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

createSellerFavorites();