import mongoose from 'mongoose';
import DeliveryAddress from '../models/DeliveryAddress';
import { connectDatabase } from '../config/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function debugAddressesAPI() {
  try {
    console.log('🔍 Connecting to database...');
    await connectDatabase();
    
    // John Customer's ID
    const johnCustomerId = '69bab6f1f346b17dc88895e5';
    
    console.log('\n📋 Checking DeliveryAddress collection for John Customer...');
    console.log(`User ID: ${johnCustomerId}`);
    
    // Get ALL delivery addresses for John Customer (including inactive ones)
    const allAddresses = await DeliveryAddress.find({
      userId: johnCustomerId
    }).sort({ isDefault: -1, createdAt: -1 });
    
    console.log(`\n📊 Total addresses found: ${allAddresses.length}`);
    
    allAddresses.forEach((address: any, index: number) => {
      console.log(`\n--- Address ${index + 1} ---`);
      console.log(`ID: ${address._id}`);
      console.log(`Type: ${address.type}`);
      console.log(`Address Line 1: ${address.addressLine1}`);
      console.log(`Address Line 2: ${address.addressLine2 || 'N/A'}`);
      console.log(`City: ${address.city}`);
      console.log(`State: ${address.state}`);
      console.log(`Country: ${address.country}`);
      console.log(`Postal Code: ${address.postalCode}`);
      console.log(`Is Default: ${address.isDefault}`);
      console.log(`Is Active: ${address.isActive}`);
      console.log(`Created: ${address.createdAt}`);
      console.log(`Updated: ${address.updatedAt}`);
    });
    
    // Now check what the API would return (only active addresses)
    console.log('\n🔍 Checking what the API returns (isActive: true)...');
    const activeAddresses = await DeliveryAddress.find({
      userId: johnCustomerId,
      isActive: true
    }).sort({ isDefault: -1, createdAt: -1 });
    
    console.log(`\n📊 Active addresses (what API returns): ${activeAddresses.length}`);
    
    activeAddresses.forEach((address: any, index: number) => {
      console.log(`\n--- Active Address ${index + 1} ---`);
      console.log(`ID: ${address._id}`);
      console.log(`Type: ${address.type}`);
      console.log(`Address Line 1: ${address.addressLine1}`);
      console.log(`City: ${address.city}`);
      console.log(`State: ${address.state}`);
      console.log(`Is Default: ${address.isDefault}`);
      console.log(`Is Active: ${address.isActive}`);
    });
    
    // Check if there are any inactive addresses
    const inactiveAddresses = await DeliveryAddress.find({
      userId: johnCustomerId,
      isActive: false
    });
    
    if (inactiveAddresses.length > 0) {
      console.log(`\n⚠️  Found ${inactiveAddresses.length} inactive addresses:`);
      inactiveAddresses.forEach((address: any, index: number) => {
        console.log(`${index + 1}. ${address.addressLine1}, ${address.city} (ID: ${address._id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error debugging addresses API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Debug completed');
  }
}

// Run the debug
debugAddressesAPI();