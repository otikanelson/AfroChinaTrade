import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Collection from '../models/Collection';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || '';

async function removeNewCollection() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete "New Arrivals" collection
    const result = await Collection.deleteOne({ name: 'New Arrivals' });
    
    if (result.deletedCount > 0) {
      console.log('✅ Deleted "New Arrivals" collection');
    } else {
      console.log('⚠️  "New Arrivals" collection not found');
    }
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error removing collection:', error);
    process.exit(1);
  }
}

// Run the script
removeNewCollection();
