import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Collection from '../models/Collection';
import Product from '../models/Product';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || '';

async function clearCollectionsAndTags() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Delete all collections
    const collectionsResult = await Collection.deleteMany({});
    console.log(`🗑️  Deleted ${collectionsResult.deletedCount} collections`);

    // Clear all tags from products
    const productsResult = await Product.updateMany(
      {},
      { $set: { tags: [] } }
    );
    console.log(`🗑️  Cleared tags from ${productsResult.modifiedCount} products\n`);

    console.log('✅ Collections and tags cleared successfully');
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error clearing collections and tags:', error);
    process.exit(1);
  }
}

// Run the script
clearCollectionsAndTags();
