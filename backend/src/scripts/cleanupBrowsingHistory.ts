import mongoose from 'mongoose';
import { BrowsingHistory } from '../models';
import { connectDatabase } from '../config/database';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

/**
 * Cleanup script to remove browsing history entries that reference deleted products
 */
async function cleanupBrowsingHistory() {
  try {
    console.log('🧹 Starting browsing history cleanup...');
    
    await connectDatabase();
    
    // Get total count before cleanup
    const totalBefore = await BrowsingHistory.countDocuments({});
    console.log(`📊 Total browsing history entries before cleanup: ${totalBefore}`);
    
    // Use the static method to cleanup orphaned entries
    const deletedCount = await (BrowsingHistory as any).cleanupOrphanedEntries();
    
    if (deletedCount > 0) {
      console.log(`✅ Deleted ${deletedCount} orphaned browsing history entries`);
    } else {
      console.log('✅ No orphaned entries found - browsing history is clean');
    }
    
    // Get statistics after cleanup
    const totalAfter = await BrowsingHistory.countDocuments({});
    console.log(`📈 Total browsing history entries after cleanup: ${totalAfter}`);
    
  } catch (error) {
    console.error('❌ Error during browsing history cleanup:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  cleanupBrowsingHistory()
    .then(() => {
      console.log('🎉 Browsing history cleanup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Cleanup failed:', error);
      process.exit(1);
    });
}

export { cleanupBrowsingHistory };