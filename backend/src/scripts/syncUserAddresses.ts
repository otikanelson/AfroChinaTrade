import mongoose from 'mongoose';
import User from '../models/User';
import DeliveryAddress from '../models/DeliveryAddress';
import { connectDatabase } from '../config/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function syncUserAddresses() {
  try {
    console.log('🔍 Connecting to database...');
    await connectDatabase();
    
    console.log('\n🔄 Starting User.addresses synchronization...');
    
    // Find John Customer
    const johnCustomer = await User.findOne({ 
      email: 'customer@example.com' 
    });
    
    if (!johnCustomer) {
      console.log('❌ John Customer not found');
      return;
    }
    
    console.log('✅ Found John Customer:', johnCustomer.name);
    console.log('Current User.addresses:');
    johnCustomer.addresses.forEach((addr: any, index: number) => {
      console.log(`  ${index + 1}. ${addr.street}, ${addr.city}, ${addr.state}, ${addr.country}, ${addr.postalCode} (Default: ${addr.isDefault})`);
    });
    
    // Get current delivery addresses
    const deliveryAddresses = await DeliveryAddress.find({
      userId: johnCustomer._id,
      isActive: true
    }).sort({ isDefault: -1, createdAt: -1 });
    
    console.log('\nCurrent DeliveryAddress collection:');
    deliveryAddresses.forEach((addr: any, index: number) => {
      console.log(`  ${index + 1}. ${addr.addressLine1}, ${addr.city}, ${addr.state}, ${addr.country}, ${addr.postalCode} (Default: ${addr.isDefault})`);
    });
    
    // Convert DeliveryAddress format to User.addresses format
    const newUserAddresses = deliveryAddresses.map((addr: any) => ({
      street: addr.addressLine1,
      city: addr.city,
      state: addr.state,
      country: addr.country,
      postalCode: addr.postalCode,
      isDefault: addr.isDefault,
      landmark: addr.landmark,
      locationSummary: addr.addressLine2
    }));
    
    console.log('\n🔄 Updating User.addresses to match DeliveryAddress collection...');
    
    // Update the user's addresses
    johnCustomer.addresses = newUserAddresses;
    await johnCustomer.save();
    
    console.log('✅ Successfully updated User.addresses');
    
    // Verify the update
    const updatedUser = await User.findOne({ 
      email: 'customer@example.com' 
    }).lean();
    
    console.log('\n✅ Verification - Updated User.addresses:');
    if (updatedUser?.addresses) {
      updatedUser.addresses.forEach((addr: any, index: number) => {
        console.log(`  ${index + 1}. ${addr.street}, ${addr.city}, ${addr.state}, ${addr.country}, ${addr.postalCode} (Default: ${addr.isDefault})`);
      });
    }
    
    console.log('\n🎉 Synchronization completed successfully!');
    console.log('📝 The MongoDB web interface should now show the correct addresses for John Customer.');
    
  } catch (error) {
    console.error('❌ Error syncing user addresses:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
  }
}

// Run the sync
syncUserAddresses();