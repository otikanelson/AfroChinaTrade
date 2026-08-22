import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Script to list all deleted accounts
 */
async function listDeletedAccounts() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to database');

    // Find all deleted accounts
    const deletedAccounts = await User.find({ status: 'deleted' });

    console.log(`\n📊 Found ${deletedAccounts.length} deleted accounts:\n`);
    
    if (deletedAccounts.length === 0) {
      console.log('✅ No deleted accounts found');
    } else {
      deletedAccounts.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Deletion Reason: ${user.deletionReason || 'N/A'}`);
        console.log(`   Deleted At: ${user.deletedAt || 'N/A'}`);
        console.log(`   Password: ${user.password ? 'EXISTS' : 'WIPED'} ✓`);
        console.log(`   Phone: ${user.phone || 'WIPED'} ✓`);
        console.log(`   Addresses: ${user.addresses?.length || 0} (should be 0) ✓`);
        console.log('');
      });
    }

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
listDeletedAccounts();
