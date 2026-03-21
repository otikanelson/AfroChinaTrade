import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import User from '../models/User';

// Load environment variables
dotenv.config();

const adminUser = {
  name: 'System Administrator',
  email: 'admin@afrochinatrade.com',
  password: 'Admin123!@#', // This should be changed in production
  phone: '+1234567890',
  role: 'admin' as const,
  status: 'active' as const,
  addresses: [
    {
      type: 'billing',
      fullName: 'System Administrator',
      phone: '+1234567890',
      street: '123 Admin Street',
      city: 'Admin City',
      state: 'Admin State',
      country: 'Admin Country',
      postalCode: '12345',
      isDefault: true
    }
  ],
  avatar: '/uploads/avatars/admin-default.jpg'
};

export const seedAdmin = async (): Promise<void> => {
  try {
    console.log('🌱 Starting admin user seeding...');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: adminUser.email },
        { role: 'admin' }
      ]
    });

    if (existingAdmin) {
      console.log(`⚠️  Admin user already exists (${existingAdmin.email}). Skipping seeding.`);
      return;
    }

    // Create admin user (password will be hashed by pre-save hook)
    const admin = new User({
      ...adminUser
    });

    await admin.save();

    console.log('✅ Successfully created admin user');
    console.log(`   - Email: ${admin.email}`);
    console.log(`   - Role: ${admin.role}`);
    console.log(`   - Status: ${admin.status}`);
    console.log('⚠️  IMPORTANT: Change the default password in production!');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    throw error;
  }
};

// Run script directly if called from command line
if (require.main === module) {
  const runSeeding = async () => {
    try {
      await connectDatabase();
      await seedAdmin();
      console.log('🎉 Admin user seeding completed successfully');
    } catch (error) {
      console.error('💥 Admin user seeding failed:', error);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      process.exit(0);
    }
  };

  runSeeding();
}