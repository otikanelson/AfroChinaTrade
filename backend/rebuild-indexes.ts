/**
 * Script to rebuild database indexes for improved query performance
 * Run this script after deploying the updated models
 * 
 * Usage: npx ts-node rebuild-indexes.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product';
import Review from './src/models/Review';
import Collection from './src/models/Collection';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function rebuildIndexes() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Rebuild Product indexes
    console.log('\n📦 Rebuilding Product indexes...');
    await Product.collection.dropIndexes();
    await Product.syncIndexes();
    const productIndexes = await Product.collection.indexes();
    console.log(`✅ Product indexes rebuilt: ${productIndexes.length} indexes`);
    productIndexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // Rebuild Review indexes
    console.log('\n⭐ Rebuilding Review indexes...');
    await Review.collection.dropIndexes();
    await Review.syncIndexes();
    const reviewIndexes = await Review.collection.indexes();
    console.log(`✅ Review indexes rebuilt: ${reviewIndexes.length} indexes`);
    reviewIndexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // Rebuild Collection indexes
    console.log('\n📚 Rebuilding Collection indexes...');
    await Collection.collection.dropIndexes();
    await Collection.syncIndexes();
    const collectionIndexes = await Collection.collection.indexes();
    console.log(`✅ Collection indexes rebuilt: ${collectionIndexes.length} indexes`);
    collectionIndexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log('\n✨ All indexes rebuilt successfully!');
    
  } catch (error) {
    console.error('❌ Error rebuilding indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the script
rebuildIndexes();
