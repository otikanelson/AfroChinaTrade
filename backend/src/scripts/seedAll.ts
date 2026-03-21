import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import { seedCategories } from './seedCategories';
import { seedAdmin } from './seedAdmin';
import { seedSampleData } from './seedSampleData';

// Load environment variables
dotenv.config();

/**
 * Master seeding script that runs all individual seeders in the correct order
 */
export const seedAll = async (): Promise<void> => {
  try {
    console.log('🚀 Starting complete database seeding...');
    console.log('=====================================');

    // 1. Seed categories first (required for products)
    await seedCategories();
    console.log('');

    // 2. Seed admin user
    await seedAdmin();
    console.log('');

    // 3. Seed sample data (users, suppliers, products)
    await seedSampleData();
    console.log('');

    console.log('=====================================');
    console.log('🎉 Complete database seeding finished successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   ✅ Categories seeded');
    console.log('   ✅ Admin user created');
    console.log('   ✅ Sample data populated');
    console.log('');
    console.log('🔐 Default Admin Credentials:');
    console.log('   Email: admin@afrochinatrade.com');
    console.log('   Password: Admin123!@#');
    console.log('   ⚠️  CHANGE PASSWORD IN PRODUCTION!');

  } catch (error) {
    console.error('❌ Error during complete seeding:', error);
    throw error;
  }
};

// Run script directly if called from command line
if (require.main === module) {
  const runSeeding = async () => {
    try {
      await connectDatabase();
      await seedAll();
    } catch (error) {
      console.error('💥 Complete seeding failed:', error);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      process.exit(0);
    }
  };

  runSeeding();
}