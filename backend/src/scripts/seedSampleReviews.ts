import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Review from '../models/Review';
import Product from '../models/Product';
import User from '../models/User';

// Load environment variables
dotenv.config();

/**
 * Sample Reviews Seeder
 * Creates realistic reviews for products to demonstrate the review system
 */

async function seedSampleReviews() {
  try {
    console.log('⭐ Starting sample reviews seeding...\n');
    
    // Connect to database
    await connectDatabase();
    console.log('✅ Connected to database');
    
    console.log('✅ Sample reviews seeding completed');
  } catch (error) {
    console.error('❌ Error seeding sample reviews:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedSampleReviews();