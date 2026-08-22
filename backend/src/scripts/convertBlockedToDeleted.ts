import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Script to convert blocked accounts to properly deleted accounts
 * This updates existing blocked accounts to use the new deletion format
 */
async function convertBlockedToDeleted() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to database');

    // Find all blocked accounts
    const blockedAccounts = await User.find({ status: 'blocked' });

    console.log(`\n📊 Found ${blockedAccounts.length} blocked accounts:\n`);
    
    if (blockedAccounts.length === 0) {
      console.log('✅ No blocked accounts to convert');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Process each blocked account
    for (const user of blockedAccounts) {
      console.log(`\nConverting: ${user.name} (${user.email})`);
      console.log(`  Old status: ${user.status}`);
      console.log(`  Reason: ${user.suspensionReason || user.blockReason || 'No reason provided'}`);

      const userId = user._id.toString();
      const deletedAt = new Date();
      const deletionReason = user.suspensionReason || user.blockReason || 'Account deleted by user';

      // Update to deleted status and wipe personal data
      await User.findByIdAndUpdate(userId, {
        status: 'deleted',
        deletionReason: deletionReason,
        deletedAt: deletedAt,
        // Wipe all personal data
        email: `deleted_${userId}@deleted.local`, // Anonymize email
        password: undefined, // Remove password
        phone: undefined,
        addresses: [],
        avatar: undefined,
        pushTokens: [],
        supportTickets: [],
        suspensionReason: undefined,
        suspensionDuration: undefined,
        blockReason: undefined,
      });

      console.log(`  ✅ Converted to deleted status`);
      console.log(`  📧 New email: deleted_${userId}@deleted.local`);
      console.log(`  🗑️  Personal data wiped`);
    }

    console.log(`\n\n✅ Successfully converted ${blockedAccounts.length} accounts to deleted status`);
    console.log('💡 These accounts will now show "Your account was deleted by you at..." on login');

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
convertBlockedToDeleted();
