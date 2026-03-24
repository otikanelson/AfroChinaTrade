import mongoose from 'mongoose';
import User from '../models/User';
import { connectDatabase } from '../config/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAddressesAPI() {
  try {
    console.log('🔍 Connecting to database...');
    await connectDatabase();
    
    // Find John Customer
    const johnCustomer = await User.findOne({ 
      email: 'customer@example.com' 
    }).lean();
    
    if (!johnCustomer) {
      console.log('❌ John Customer not found');
      return;
    }
    
    console.log('✅ Found John Customer in User collection:');
    console.log(`ID: ${johnCustomer._id}`);
    console.log(`Name: ${johnCustomer.name}`);
    console.log(`Email: ${johnCustomer.email}`);
    
    console.log('\n🏠 Addresses from User.addresses field:');
    if (johnCustomer.addresses && johnCustomer.addresses.length > 0) {
      johnCustomer.addresses.forEach((address: any, index: number) => {
        console.log(`Address ${index + 1}:`);
        console.log(`  Street: ${address.street}`);
        console.log(`  City: ${address.city}`);
        console.log(`  State: ${address.state}`);
        console.log(`  Country: ${address.country}`);
        console.log(`  Postal Code: ${address.postalCode}`);
        console.log(`  Is Default: ${address.isDefault}`);
        console.log('');
      });
    } else {
      console.log('No addresses in User.addresses field');
    }
    
    // Now check if there's a separate DeliveryAddress collection
    console.log('\n📋 Checking for DeliveryAddress collection...');
    const collections = await mongoose.connection.db!.listCollections().toArray();
    const deliveryAddressCollection = collections.find(c => c.name === 'deliveryaddresses');
    
    if (deliveryAddressCollection) {
      console.log('✅ Found deliveryaddresses collection');
      
      // Check what's in the deliveryaddresses collection
      const deliveryAddresses = await mongoose.connection.db!
        .collection('deliveryaddresses')
        .find({ userId: johnCustomer._id })
        .toArray();
        
      console.log(`Found ${deliveryAddresses.length} delivery addresses for John Customer:`);
      deliveryAddresses.forEach((address: any, index: number) => {
        console.log(`\nDelivery Address ${index + 1}:`);
        console.log(`  ID: ${address._id}`);
        console.log(`  User ID: ${address.userId}`);
        console.log(`  Type: ${address.type || 'N/A'}`);
        console.log(`  Address Line 1: ${address.addressLine1 || address.street || 'N/A'}`);
        console.log(`  Address Line 2: ${address.addressLine2 || 'N/A'}`);
        console.log(`  City: ${address.city}`);
        console.log(`  State: ${address.state}`);
        console.log(`  Country: ${address.country}`);
        console.log(`  Postal Code: ${address.postalCode}`);
        console.log(`  Is Default: ${address.isDefault}`);
        console.log(`  Landmark: ${address.landmark || 'N/A'}`);
        console.log(`  Created: ${address.createdAt}`);
        console.log(`  Updated: ${address.updatedAt}`);
      });
    } else {
      console.log('❌ No deliveryaddresses collection found');
    }
    
    // List all collections for reference
    console.log('\n📋 All collections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing addresses API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Test completed');
  }
}

// Run the test
testAddressesAPI();