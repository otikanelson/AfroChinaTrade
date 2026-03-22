import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';

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

interface IndexInfo {
  collection: string;
  name: string;
  key: Record<string, any>;
  unique?: boolean;
  sparse?: boolean;
  background?: boolean;
}

/**
 * Verify that all required database indexes exist and are properly configured
 */
export const verifyIndexes = async (): Promise<void> => {
  try {
    console.log('🔍 Starting database index verification...');

    // Get all collections
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    console.log(`📋 Found ${collectionNames.length} collections to verify:`);
    collectionNames.forEach(name => console.log(`   - ${name}`));
    console.log('');

    let totalIndexes = 0;
    let issuesFound = 0;
    const allIndexes: IndexInfo[] = [];

    // Check indexes for each collection
    for (const collectionName of collectionNames) {
      try {
        console.log(`🔍 Checking indexes for ${collectionName}:`);
        
        const indexes = await db.collection(collectionName).listIndexes().toArray();
        
        if (indexes.length === 0) {
          console.log(`   ⚠️  No indexes found`);
          issuesFound++;
          continue;
        }

        indexes.forEach(index => {
          const indexInfo: IndexInfo = {
            collection: collectionName,
            name: index.name,
            key: index.key,
            unique: index.unique,
            sparse: index.sparse,
            background: index.background
          };
          
          allIndexes.push(indexInfo);
          
          // Format key display
          const keyStr = Object.entries(index.key)
            .map(([field, direction]) => `${field}:${direction}`)
            .join(', ');
          
          const flags = [];
          if (index.unique) flags.push('unique');
          if (index.sparse) flags.push('sparse');
          if (index.background) flags.push('background');
          
          const flagStr = flags.length > 0 ? ` (${flags.join(', ')})` : '';
          
          console.log(`   ✅ ${index.name}: {${keyStr}}${flagStr}`);
        });

        totalIndexes += indexes.length;
        console.log(`   📊 Total: ${indexes.length} indexes`);
        console.log('');

      } catch (error) {
        console.log(`   ❌ Error checking ${collectionName}: ${error}`);
        issuesFound++;
      }
    }

    // Expected indexes based on our models
    const expectedIndexes = [
      { collection: 'users', field: 'email', unique: true },
      { collection: 'users', field: 'role,status', compound: true },
      { collection: 'products', field: 'name,description', text: true },
      { collection: 'products', field: 'categoryId,isFeatured', compound: true },
      { collection: 'products', field: 'supplierId,isActive', compound: true },
      { collection: 'orders', field: 'orderId', unique: true },
      { collection: 'orders', field: 'userId,createdAt', compound: true },
      { collection: 'categories', field: 'name', unique: true },
      { collection: 'suppliers', field: 'email', unique: true },
      { collection: 'messages', field: 'threadId,senderId,isRead', compound: true },
      { collection: 'messagethreads', field: 'threadId', unique: true },
      { collection: 'reviews', field: 'productId,userId', compound: true },
    ];

    // Check for missing critical indexes
    console.log('🔍 Checking for critical indexes...');
    let missingIndexes = 0;

    for (const expected of expectedIndexes) {
      const found = allIndexes.some(index => 
        index.collection === expected.collection && 
        (
          (expected.unique && index.unique) ||
          (expected.text && index.name.includes('text')) ||
          (expected.compound && Object.keys(index.key).length > 1) ||
          Object.keys(index.key).includes(expected.field.split(',')[0])
        )
      );

      if (!found) {
        console.log(`   ⚠️  Missing expected index: ${expected.collection}.${expected.field}`);
        missingIndexes++;
        issuesFound++;
      }
    }

    if (missingIndexes === 0) {
      console.log('   ✅ All critical indexes found');
    }

    // Performance recommendations
    console.log('');
    console.log('📊 Index Analysis Summary:');
    console.log(`   📋 Total collections: ${collectionNames.length}`);
    console.log(`   🔍 Total indexes: ${totalIndexes}`);
    console.log(`   ⚠️  Issues found: ${issuesFound}`);
    console.log(`   ❌ Missing critical indexes: ${missingIndexes}`);

    if (issuesFound === 0) {
      console.log('');
      console.log('🎉 Database indexes verification completed successfully!');
      console.log('✅ All indexes are properly configured');
    } else {
      console.log('');
      console.log('⚠️  Issues found during verification');
      console.log('💡 Consider running database migrations or recreating indexes');
    }

    // Performance tips
    console.log('');
    console.log('💡 Performance Tips:');
    console.log('   - Indexes speed up queries but slow down writes');
    console.log('   - Monitor query performance with MongoDB profiler');
    console.log('   - Consider compound indexes for multi-field queries');
    console.log('   - Use sparse indexes for optional fields');

  } catch (error) {
    console.error('❌ Error during index verification:', error);
    throw error;
  }
};

// Run script directly if called from command line
if (require.main === module) {
  const runVerification = async () => {
    try {
      await connectDatabase();
      await verifyIndexes();
    } catch (error) {
      console.error('💥 Index verification failed:', error);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      process.exit(0);
    }
  };

  runVerification();
}