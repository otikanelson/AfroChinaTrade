import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models';
import { connectDatabase } from '../config/database';

async function createTestUser() {
  try {
    console.log('🔍 Creating test user...');
    
    // Connect to database
    await connectDatabase();
    console.log('✅ Connected to database');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('✅ Test user already exists:', {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role
      });
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      phone: '+2348012345678',
      role: 'customer',
      status: 'active',
      isEmailVerified: true,
      addresses: []
    });

    console.log('✅ Test user created successfully:', {
      id: testUser._id,
      name: testUser.name,
      email: testUser.email,
      role: testUser.role
    });

  } catch (error) {
    console.error('❌ Failed to create test user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
createTestUser();