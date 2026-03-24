import mongoose from 'mongoose';
import User from '../models/User';
import { connectDatabase } from '../config/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkJohnCustomer() {
  try {
    console.log('🔍 Connecting to database...');
    await connectDatabase();
    
    console.log('\n📊 Database Information:');
    console.log(`Database Name: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}`);
    
    // Find John Customer specifically
    console.log('\n👤 Looking for John Customer...');
    const johnCustomer = await User.findOne({ 
      email: 'customer@example.com' 
    }).lean();
    
    if (johnCustomer) {
      console.log('✅ Found John Customer:');
      console.log(`ID: ${johnCustomer._id}`);
      console.log(`Name: ${johnCustomer.name}`);
      console.log(`Email: ${johnCustomer.email}`);
      console.log(`Phone: ${johnCustomer.phone}`);
      console.log(`Role: ${johnCustomer.role}`);
      console.log(`Status: ${johnCustomer.status}`);
      console.log(`Created: ${johnCustomer.createdAt}`);
      console.log(`Updated: ${johnCustomer.updatedAt}`);
      
      console.log('\n🏠 Addresses:');
      if (johnCustomer.addresses && johnCustomer.addresses.length > 0) {
        johnCustomer.addresses.forEach((address: any, index: number) => {
          console.log(`Address ${index + 1}:`);
          console.log(`  Street: ${address.street}`);
          console.log(`  City: ${address.city}`);
          console.log(`  State: ${address.state}`);
          console.log(`  Country: ${address.country}`);
          console.log(`  Postal Code: ${address.postalCode}`);
          console.log(`  Is Default: ${address.isDefault}`);
          if (address.landmark) console.log(`  Landmark: ${address.landmark}`);
          if (address.locationSummary) console.log(`  Location Summary: ${address.locationSummary}`);
          console.log('');
        });
      } else {
        console.log('No addresses found');
      }
      
      // Show raw document for comparison
      console.log('\n📄 Raw Document (JSON):');
      console.log(JSON.stringify(johnCustomer, null, 2));
      
    } else {
      console.log('❌ John Customer not found');
      
      // Show all users for reference
      console.log('\n👥 All users in database:');
      const allUsers = await User.find({}).select('_id name email').lean();
      allUsers.forEach((user: any) => {
        console.log(`- ${user.name} (${user.email}) - ID: ${user._id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking John Customer:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Check completed');
  }
}

// Run the check
checkJohnCustomer();