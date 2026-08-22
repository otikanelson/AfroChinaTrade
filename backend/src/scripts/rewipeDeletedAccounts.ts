import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Script to re-wipe personal data from deleted accounts
 * Ensures all PII is removed
 */
async function rewipeDeletedAccounts() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('✅ Connected to database');

    // Find all deleted accounts
    const deletedAccounts = await User.find({ status: 'deleted' });

    console.log(`\n📊 Found ${deletedAccounts.length} deleted accounts\n`);
    
    if (deletedAccounts.length === 0) {
      console.log('✅ No deleted accounts to process');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Process each deleted account
    for (const user of deletedAccounts) {
      console.log(`Processing: ${user.name}`);
      console.log(`  Current email: ${user.email}`);
      console.log(`  Phone: ${user.phone || 'already wiped'}`);

      // Re-wipe all personal data using direct MongoDB operations
      await User.collection.updateOne(
        { _id: user._id },
        {
          $unset: {
            password: '',
            phone: '',
            avatar: '',
          },
          $set: {
            addresses: [],
            pushTokens: [],
            supportTickets: [],
          }
        }
      );

      console.log(`  ✅ Personal data re-wiped`);
    }

    console.log(`\n✅ Successfully processed ${deletedAccounts.length} deleted accounts`);

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
rewipeDeletedAccounts();
