import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';

// Load environment variables
dotenv.config();

// Import all models to ensure they're registered
import User from '../models/User';
import Product from '../models/Product';
import Order from '../models/Order';
import Category from '../models/Category';
import Supplier from '../models/Supplier';
import Message from '../models/Message';
import MessageThread from '../models/MessageThread';
import Review from '../models/Review';
import Refund from '../models/Refund';
import Report from '../models/Report';
import Ticket from '../models/Ticket';
import UserAuditLog from '../models/UserAuditLog';

/**
 * Clear all collections in the database
 * WARNING: This will delete ALL data!
 */
export const clearDatabase = async (confirm: boolean = false): Promise<void> => {
  try {
    if (!confirm) {
      console.log('⚠️  WARNING: This will delete ALL data in the database!');
      console.log('   To confirm, run with --confirm flag or call clearDatabase(true)');
      return;
    }

    console.log('🗑️  Starting database cleanup...');
    console.log('⚠️  This will delete ALL data!');

    // Get all collection names
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    if (collectionNames.length === 0) {
      console.log('✅ Database is already empty');
      return;
    }

    console.log(`📋 Found ${collectionNames.length} collections to clear:`);
    collectionNames.forEach(name => console.log(`   - ${name}`));

    let clearedCount = 0;
    let errorCount = 0;

    // Clear each collection
    for (const collectionName of collectionNames) {
      try {
        const result = await db.collection(collectionName).deleteMany({});
        console.log(`✅ Cleared ${collectionName}: ${result.deletedCount} documents deleted`);
        clearedCount++;
      } catch (error) {
        console.log(`❌ Error clearing ${collectionName}: ${error}`);
        errorCount++;
      }
    }

    // Summary
    console.log('');
    console.log('📊 Cleanup Summary:');
    console.log(`   ✅ Successfully cleared: ${clearedCount} collections`);
    console.log(`   ❌ Failed to clear: ${errorCount} collections`);
    console.log(`   📝 Total collections: ${collectionNames.length}`);

    if (clearedCount > 0) {
      console.log('');
      console.log('🎉 Database cleanup completed successfully!');
      console.log('💡 You may want to run seeding scripts to populate with fresh data');
    }

  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    throw error;
  }
};

// Run script directly if called from command line
if (require.main === module) {
  const runCleanup = async () => {
    try {
      await connectDatabase();
      
      // Check for confirmation flag
      const confirm = process.argv.includes('--confirm');
      await clearDatabase(confirm);
      
    } catch (error) {
      console.error('💥 Database cleanup failed:', error);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      process.exit(0);
    }
  };

  runCleanup();
}