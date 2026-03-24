import mongoose from 'mongoose';
import DeliveryAddress from '../models/DeliveryAddress';
import { connectDatabase } from '../config/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function migrateAddressNames() {
  try {
    console.log('🔍 Connecting to database...');
    await connectDatabase();
    
    console.log('\n🔄 Starting address names migration...');
    
    // Find all addresses without names
    const addressesWithoutNames = await DeliveryAddress.find({
      $or: [
        { name: { $exists: false } },
        { name: null },
        { name: '' }
      ]
    });
    
    console.log(`📊 Found ${addressesWithoutNames.length} addresses without names`);
    
    if (addressesWithoutNames.length === 0) {
      console.log('✅ All addresses already have names or no addresses exist');
      return;
    }
    
    let updatedCount = 0;
    
    for (const address of addressesWithoutNames) {
      let defaultName = '';
      
      // Generate a default name based on type and location
      switch (address.type) {
        case 'home':
          defaultName = 'Home';
          break;
        case 'work':
          defaultName = 'Work';
          break;
        case 'other':
          defaultName = 'Other';
          break;
        default:
          defaultName = 'Address';
      }
      
      // If there are multiple addresses of the same type for the same user, add location info
      const sameTypeCount = await DeliveryAddress.countDocuments({
        userId: address.userId,
        type: address.type,
        isActive: true
      });
      
      if (sameTypeCount > 1) {
        // Add city to make it unique
        defaultName = `${defaultName} (${address.city})`;
      }
      
      // Update the address with the default name
      await DeliveryAddress.findByIdAndUpdate(address._id, {
        name: defaultName
      });
      
      console.log(`✅ Updated address ${address._id}: "${defaultName}"`);
      updatedCount++;
    }
    
    console.log(`\n🎉 Migration completed! Updated ${updatedCount} addresses with default names.`);
    
    // Verify the migration
    console.log('\n🔍 Verification - checking updated addresses...');
    const verificationAddresses = await DeliveryAddress.find({
      isActive: true
    }).select('_id name type city userId').limit(10);
    
    console.log('Sample updated addresses:');
    verificationAddresses.forEach((addr: any, index: number) => {
      console.log(`${index + 1}. Name: "${addr.name}", Type: ${addr.type}, City: ${addr.city}`);
    });
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
  }
}

// Run the migration
migrateAddressNames();