import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Script to list all blocked accounts
 */
async function listBlockedAccounts() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to database');

    // Find all blocked accounts
    const blockedAccounts = await User.find({ status: 'blocked' });

    console.log(`\n📊 Found ${blockedAccounts.length} blocked accounts:\n`);
    
    if (blockedAccounts.length === 0) {
      console.log('✅ No blocked accounts found');
    } else {
      blockedAccounts.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.status}`);
        console.log(`   Suspension Reason: ${user.suspensionReason || 'N/A'}`);
        console.log(`   Block Reason: ${user.blockReason || 'N/A'}`);
        console.log(`   Created: ${user.createdAt}`);
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
listBlockedAccounts();
