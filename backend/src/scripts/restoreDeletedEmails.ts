import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Script to restore original emails for deleted accounts
 * This converts anonymized emails back to their original form
 */
async function restoreDeletedEmails() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to database');

    // Find all deleted accounts with anonymized emails
    const deletedAccounts = await User.find({ 
      status: 'deleted',
      email: /^deleted_.*@deleted\.local$/
    });

    console.log(`\n📊 Found ${deletedAccounts.length} deleted accounts with anonymized emails\n`);
    
    if (deletedAccounts.length === 0) {
      console.log('✅ No accounts to restore');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('⚠️  WARNING: Cannot automatically restore original emails.');
    console.log('   Original emails were overwritten during deletion.\n');
    console.log('Available options:');
    console.log('1. Manually update each account with the correct email');
    console.log('2. Hard delete these accounts to free up the emails');
    console.log('3. Keep them as-is (anonymized)\n');

    console.log('Deleted accounts:');
    deletedAccounts.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Current email: ${user.email}`);
      console.log(`   User ID: ${user._id}`);
      console.log(`   Deleted at: ${user.deletedAt}`);
      console.log('');
    });

    console.log('\n💡 To manually restore an email, use MongoDB Compass or run:');
    console.log('   db.users.updateOne(');
    console.log('     { _id: ObjectId("USER_ID_HERE") },');
    console.log('     { $set: { email: "original@email.com" } }');
    console.log('   )');

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
restoreDeletedEmails();
