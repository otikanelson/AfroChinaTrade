import mongoose from 'mongoose';
import DeliveryAddress from '../models/DeliveryAddress';
import { connectDatabase } from '../config/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function fixAddressesDiscrepancy() {
  try {
    console.log('🔍 Connecting to database...');
    await connectDatabase();
    
    // John Customer's ID
    const johnCustomerId = '69bab6f1f346b17dc88895e5';
    
    console.log('\n📋 Analyzing address discrepancy for John Customer...');
    
    // Get ALL delivery addresses for John Customer (including inactive ones)
    const allAddresses = await DeliveryAddress.find({
      userId: johnCustomerId
    }).sort({ isDefault: -1, createdAt: -1 });
    
    console.log(`\n📊 Total addresses found: ${allAddresses.length}`);
    
    allAddresses.forEach((address: any, index: number) => {
      console.log(`\n--- Address ${index + 1} ---`);
      console.log(`ID: ${address._id}`);
      console.log(`Address: ${address.addressLine1}, ${address.city}, ${address.state}`);
      console.log(`Postal Code: ${address.postalCode}`);
      console.log(`Is Default: ${address.isDefault}`);
      console.log(`Is Active: ${address.isActive}`);
      console.log(`Created: ${address.createdAt}`);
    });
    
    // Check what the API would return (only active addresses)
    const activeAddresses = await DeliveryAddress.find({
      userId: johnCustomerId,
      isActive: true
    }).sort({ isDefault: -1, createdAt: -1 });
    
    console.log(`\n📊 Active addresses (what API returns): ${activeAddresses.length}`);
    
    if (activeAddresses.length < allAddresses.length) {
      console.log('\n⚠️  Found inactive addresses that are hidden from the app!');
      
      const inactiveAddresses = allAddresses.filter((addr: any) => !addr.isActive);
      console.log(`Inactive addresses: ${inactiveAddresses.length}`);
      
      inactiveAddresses.forEach((address: any, index: number) => {
        console.log(`${index + 1}. ${address.addressLine1}, ${address.city} (ID: ${address._id})`);
      });
      
      // Ask if we should reactivate them
      console.log('\n🔧 Reactivating all addresses...');
      
      await DeliveryAddress.updateMany(
        { userId: johnCustomerId, isActive: false },
        { isActive: true }
      );
      
      console.log('✅ All addresses have been reactivated');
    }
    
    // Check for potential duplicates
    console.log('\n🔍 Checking for duplicate addresses...');
    
    const activeAddressesAfterFix = await DeliveryAddress.find({
      userId: johnCustomerId,
      isActive: true
    }).sort({ isDefault: -1, createdAt: -1 });
    
    console.log(`\n📊 Active addresses after fix: ${activeAddressesAfterFix.length}`);
    
    activeAddressesAfterFix.forEach((address: any, index: number) => {
      console.log(`${index + 1}. ${address.addressLine1}, ${address.city}, ${address.state} (Default: ${address.isDefault})`);
    });
    
    // Check for similar addresses that might be duplicates
    const addressGroups = new Map();
    
    activeAddressesAfterFix.forEach((address: any) => {
      const key = `${address.addressLine1.toLowerCase()}_${address.city.toLowerCase()}_${address.state.toLowerCase()}`;
      if (!addressGroups.has(key)) {
        addressGroups.set(key, []);
      }
      addressGroups.get(key).push(address);
    });
    
    console.log('\n🔍 Checking for potential duplicates...');
    let foundDuplicates = false;
    
    for (const [key, addresses] of addressGroups) {
      if (addresses.length > 1) {
        foundDuplicates = true;
        console.log(`\n⚠️  Found ${addresses.length} similar addresses:`);
        addresses.forEach((addr: any, index: number) => {
          console.log(`  ${index + 1}. ${addr.addressLine1}, ${addr.city}, ${addr.state}, ${addr.postalCode} (Default: ${addr.isDefault}, ID: ${addr._id})`);
        });
        
        // Keep only the default one, or the most recent if none is default
        const defaultAddress = addresses.find((addr: any) => addr.isDefault);
        const addressToKeep = defaultAddress || addresses[0]; // Most recent due to sorting
        
        console.log(`\n🔧 Keeping address: ${addressToKeep.addressLine1}, ${addressToKeep.city} (ID: ${addressToKeep._id})`);
        
        // Soft delete the others
        const addressesToDelete = addresses.filter((addr: any) => addr._id.toString() !== addressToKeep._id.toString());
        
        for (const addr of addressesToDelete) {
          console.log(`   Soft deleting: ${addr.addressLine1}, ${addr.city} (ID: ${addr._id})`);
          await DeliveryAddress.findByIdAndUpdate(addr._id, { isActive: false });
        }
      }
    }
    
    if (!foundDuplicates) {
      console.log('✅ No duplicate addresses found');
    }
    
    // Final verification
    console.log('\n🔍 Final verification...');
    const finalAddresses = await DeliveryAddress.find({
      userId: johnCustomerId,
      isActive: true
    }).sort({ isDefault: -1, createdAt: -1 });
    
    console.log(`\n📊 Final active addresses: ${finalAddresses.length}`);
    finalAddresses.forEach((address: any, index: number) => {
      console.log(`${index + 1}. ${address.addressLine1}, ${address.city}, ${address.state}, ${address.postalCode} (Default: ${address.isDefault})`);
    });
    
    console.log('\n🎉 Address discrepancy analysis and fix completed!');
    console.log('📱 The mobile app should now show the correct number of addresses.');
    
  } catch (error) {
    console.error('❌ Error fixing addresses discrepancy:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
  }
}

// Run the fix
fixAddressesDiscrepancy();