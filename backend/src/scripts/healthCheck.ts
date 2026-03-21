import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase, getDatabaseStatus } from '../config/database';

// Load environment variables
dotenv.config();

// Import models for testing
import User from '../models/User';
import Product from '../models/Product';
import Category from '../models/Category';

interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
}

interface DatabaseHealth {
  connection: HealthCheckResult;
  collections: HealthCheckResult;
  indexes: HealthCheckResult;
  performance: HealthCheckResult;
  overall: 'healthy' | 'warning' | 'error';
}

/**
 * Comprehensive database health check
 */
export const healthCheck = async (): Promise<DatabaseHealth> => {
  const results: DatabaseHealth = {
    connection: { status: 'error', message: 'Not checked' },
    collections: { status: 'error', message: 'Not checked' },
    indexes: { status: 'error', message: 'Not checked' },
    performance: { status: 'error', message: 'Not checked' },
    overall: 'error'
  };

  try {
    console.log('🏥 Starting database health check...');
    console.log('=====================================');

    // 1. Connection Health
    console.log('🔌 Checking database connection...');
    try {
      const dbStatus = getDatabaseStatus();
      const connectionState = mongoose.connection.readyState;
      
      if (connectionState === 1) {
        results.connection = {
          status: 'healthy',
          message: 'Database connection is active',
          details: {
            state: 'connected',
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            name: mongoose.connection.name,
            status: dbStatus
          }
        };
        console.log('   ✅ Connection: Healthy');
      } else {
        results.connection = {
          status: 'error',
          message: `Database connection state: ${connectionState}`,
          details: { state: connectionState }
        };
        console.log('   ❌ Connection: Error');
      }
    } catch (error) {
      results.connection = {
        status: 'error',
        message: `Connection error: ${error}`,
        details: { error: (error as Error).toString() }
      };
      console.log('   ❌ Connection: Error');
    }

    // 2. Collections Health
    console.log('📚 Checking collections...');
    try {
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not available');
      }
      
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(col => col.name);
      
      // Check for essential collections
      const essentialCollections = ['users', 'products', 'categories', 'orders'];
      const missingCollections = essentialCollections.filter(name => 
        !collectionNames.includes(name)
      );

      if (missingCollections.length === 0) {
        results.collections = {
          status: 'healthy',
          message: `All ${collections.length} collections present`,
          details: {
            total: collections.length,
            collections: collectionNames,
            essential: essentialCollections
          }
        };
        console.log(`   ✅ Collections: ${collections.length} found`);
      } else {
        results.collections = {
          status: 'warning',
          message: `Missing ${missingCollections.length} essential collections`,
          details: {
            total: collections.length,
            missing: missingCollections,
            found: collectionNames
          }
        };
        console.log(`   ⚠️  Collections: Missing ${missingCollections.join(', ')}`);
      }
    } catch (error) {
      results.collections = {
        status: 'error',
        message: `Collections check failed: ${error}`,
        details: { error: (error as Error).toString() }
      };
      console.log('   ❌ Collections: Error');
    }

    // 3. Index Health
    console.log('🔍 Checking indexes...');
    try {
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Database connection not available');
      }
      
      const collections = await db.listCollections().toArray();
      let totalIndexes = 0;
      const indexDetails = [];

      for (const collection of collections) {
        const indexes = await db
          .collection(collection.name)
          .listIndexes()
          .toArray();
        
        totalIndexes += indexes.length;
        indexDetails.push({
          collection: collection.name,
          indexCount: indexes.length
        });
      }

      if (totalIndexes > 0) {
        results.indexes = {
          status: 'healthy',
          message: `${totalIndexes} indexes found across collections`,
          details: {
            total: totalIndexes,
            byCollection: indexDetails
          }
        };
        console.log(`   ✅ Indexes: ${totalIndexes} total`);
      } else {
        results.indexes = {
          status: 'warning',
          message: 'No indexes found',
          details: { total: 0 }
        };
        console.log('   ⚠️  Indexes: None found');
      }
    } catch (error) {
      results.indexes = {
        status: 'error',
        message: `Index check failed: ${error}`,
        details: { error: (error as Error).toString() }
      };
      console.log('   ❌ Indexes: Error');
    }

    // 4. Performance Check
    console.log('⚡ Checking performance...');
    try {
      const startTime = Date.now();
      
      // Simple query performance test
      await User.countDocuments();
      await Product.countDocuments();
      await Category.countDocuments();
      
      const queryTime = Date.now() - startTime;
      
      if (queryTime < 1000) {
        results.performance = {
          status: 'healthy',
          message: `Query performance good (${queryTime}ms)`,
          details: { queryTime, threshold: 1000 }
        };
        console.log(`   ✅ Performance: ${queryTime}ms`);
      } else if (queryTime < 3000) {
        results.performance = {
          status: 'warning',
          message: `Query performance slow (${queryTime}ms)`,
          details: { queryTime, threshold: 1000 }
        };
        console.log(`   ⚠️  Performance: ${queryTime}ms (slow)`);
      } else {
        results.performance = {
          status: 'error',
          message: `Query performance very slow (${queryTime}ms)`,
          details: { queryTime, threshold: 1000 }
        };
        console.log(`   ❌ Performance: ${queryTime}ms (very slow)`);
      }
    } catch (error) {
      results.performance = {
        status: 'error',
        message: `Performance check failed: ${error}`,
        details: { error: (error as Error).toString() }
      };
      console.log('   ❌ Performance: Error');
    }

    // 5. Overall Health Assessment
    const healthScores = [
      results.connection.status,
      results.collections.status,
      results.indexes.status,
      results.performance.status
    ];

    const errorCount = healthScores.filter(s => s === 'error').length;
    const warningCount = healthScores.filter(s => s === 'warning').length;

    if (errorCount > 0) {
      results.overall = 'error';
    } else if (warningCount > 0) {
      results.overall = 'warning';
    } else {
      results.overall = 'healthy';
    }

    // Summary
    console.log('');
    console.log('=====================================');
    console.log('📊 Health Check Summary:');
    console.log(`   🔌 Connection: ${results.connection.status}`);
    console.log(`   📚 Collections: ${results.collections.status}`);
    console.log(`   🔍 Indexes: ${results.indexes.status}`);
    console.log(`   ⚡ Performance: ${results.performance.status}`);
    console.log('');
    
    const statusIcon = results.overall === 'healthy' ? '🟢' : 
                      results.overall === 'warning' ? '🟡' : '🔴';
    console.log(`${statusIcon} Overall Status: ${results.overall.toUpperCase()}`);

    if (results.overall === 'healthy') {
      console.log('🎉 Database is healthy and ready for use!');
    } else if (results.overall === 'warning') {
      console.log('⚠️  Database has some issues but is functional');
    } else {
      console.log('❌ Database has critical issues that need attention');
    }

    return results;

  } catch (error) {
    console.error('❌ Health check failed:', error);
    results.overall = 'error';
    return results;
  }
};

// Run script directly if called from command line
if (require.main === module) {
  const runHealthCheck = async () => {
    try {
      await connectDatabase();
      await healthCheck();
    } catch (error) {
      console.error('💥 Health check failed:', error);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      process.exit(0);
    }
  };

  runHealthCheck();
}