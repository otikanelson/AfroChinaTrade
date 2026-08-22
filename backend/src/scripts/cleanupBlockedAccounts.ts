import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Script to clean up blocked accounts that were meant to be deleted
 * This removes ALL accounts with status 'blocked' since the new code deletes accounts directly
 * These are likely accounts that were "deleted" under the old soft-delete system
 */
async function cleanupBlockedAccounts() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to database');

    // Find all blocked accounts
    const blockedAccounts = await User.find({ status: 'blocked' });

    console.log(`\n📊 Found ${blockedAccounts.length} blocked accounts:\n`);
    
    blockedAccounts.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Suspension Reason: ${user.suspensionReason || 'N/A'}`);
      console.log(`   Block Reason: ${user.blockReason || 'N/A'}`);
      console.log('');
    });

    if (blockedAccounts.length === 0) {
      console.log('✅ No blocked accounts to clean up');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Ask for confirmation
    console.log('⚠️  WARNING: This will permanently delete these accounts from the database.');
    console.log('⚠️  They were likely "deleted" by users under the old soft-delete system.');
    console.log('\n💡 After deletion, login attempts will show "Invalid credentials"\n');

    // For non-interactive script, we'll proceed with deletion
    // In production, you might want to add a confirmation prompt
    console.log(`🗑️  Deleting ${blockedAccounts.length} blocked accounts...`);
    
    const result = await User.deleteMany({
      _id: { $in: blockedAccounts.map(u => u._id) }
    });

    console.log(`\n✅ Successfully deleted ${result.deletedCount} accounts`);
    console.log('💡 These accounts will now show "Invalid credentials" on login attempt');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
cleanupBlockedAccounts();
