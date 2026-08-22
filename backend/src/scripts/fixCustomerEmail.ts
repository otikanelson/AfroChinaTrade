import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Script to restore customer@example.com email for the deleted test account
 */
async function fixCustomerEmail() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to database');

    // Find the deleted account with anonymized email
    const deletedAccount = await User.findOne({ 
      status: 'deleted',
      name: 'John Customer'
    });

    if (!deletedAccount) {
      console.log('❌ Deleted account not found');
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('\n📋 Found deleted account:');
    console.log(`   Name: ${deletedAccount.name}`);
    console.log(`   Current email: ${deletedAccount.email}`);
    console.log(`   Status: ${deletedAccount.status}`);
    console.log(`   Deleted at: ${deletedAccount.deletedAt}`);

    // Restore the original email
    const originalEmail = 'customer@example.com';
    
    await User.collection.updateOne(
      { _id: deletedAccount._id },
      { $set: { email: originalEmail } }
    );

    console.log(`\n✅ Email restored to: ${originalEmail}`);
    console.log('\n💡 Now when you try to login with customer@example.com:');
    console.log('   - Backend will find the account');
    console.log('   - See status is "deleted"');
    console.log(`   - Show message: "Your account was deleted by you at ${deletedAccount.deletedAt}"`);

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
fixCustomerEmail();
