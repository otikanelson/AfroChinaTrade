import mongoose from 'mongoose';
import User from '../models/User';
import Product from '../models/Product';
import { connectDatabase } from '../config/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkDatabase() {
  try {
    console.log('🔍 Connecting to database...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
    
    await connectDatabase();
    
    console.log('\n📊 Database Information:');
    console.log(`Database Name: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}`);
    console.log(`Connection String: ${process.env.MONGODB_URI?.substring(0, 50)}...`);
    
    // Check users
    console.log('\n👥 Users in database:');
    const users = await User.find({}).select('_id name email role status createdAt').lean();
    console.log(`Total users: ${users.length}`);
    
    users.forEach((user: any, index: number) => {
      console.log(`${index + 1}. ID: ${user._id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });
    
    // Check products
    console.log('\n📦 Products in database:');
    const products = await Product.find({}).select('_id name price category supplierId').limit(5).lean();
    console.log(`Total products: ${await Product.countDocuments()}`);
    console.log('First 5 products:');
    
    products.forEach((product: any, index: number) => {
      console.log(`${index + 1}. ID: ${product._id}`);
      console.log(`   Name: ${product.name}`);
      console.log(`   Price: ${product.price}`);
      console.log(`   Category: ${product.category}`);
      console.log('');
    });
    
    // Check collections
    console.log('\n📋 Collections in database:');
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database check completed');
  }
}

// Run the check
checkDatabase();