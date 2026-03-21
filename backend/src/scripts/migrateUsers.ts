import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/database';
import User from '../models/User';

interface MockUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: 'customer' | 'admin';
  status: 'active' | 'suspended' | 'blocked';
  addresses?: Array<{
    type: 'shipping' | 'billing';
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    isDefault?: boolean;
  }>;
  avatar?: string;
  createdAt?: string;
}

/**
 * Migrate mock user data from JSON file to MongoDB
 */
export const migrateUsers = async (mockDataPath?: string): Promise<void> => {
  try {
    console.log('🔄 Starting user data migration...');

    // Default path for mock data
    const dataPath = mockDataPath || path.join(__dirname, '../../data/mock-users.json');

    // Check if mock data file exists
    if (!fs.existsSync(dataPath)) {
      console.log(`⚠️  Mock data file not found at ${dataPath}. Skipping migration.`);
      return;
    }

    // Read mock data
    const mockData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const mockUsers: MockUser[] = mockData.users || mockData;

    if (!Array.isArray(mockUsers) || mockUsers.length === 0) {
      console.log('⚠️  No users found in mock data. Skipping migration.');
      return;
    }

    console.log(`👥 Found ${mockUsers.length} users to migrate`);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each user
    for (const mockUser of mockUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
          $or: [
            { email: mockUser.email },
            { 'specifications.originalId': mockUser.id }
          ]
        });

        if (existingUser) {
          console.log(`⚠️  User "${mockUser.email}" already exists. Skipping.`);
          continue;
        }

        // Validate required fields
        if (!mockUser.email || !mockUser.name) {
          const error = `Missing required fields for user ID "${mockUser.id}"`;
          errors.push(error);
          console.log(`❌ ${error}`);
          errorCount++;
          continue;
        }

        // Generate default password if not provided
        const defaultPassword = mockUser.password || 'TempPassword123!';
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);

        // Create user document
        const userData = {
          name: mockUser.name,
          email: mockUser.email,
          password: hashedPassword,
          phone: mockUser.phone || '',
          role: mockUser.role || 'customer',
          status: mockUser.status || 'active',
          addresses: mockUser.addresses || [],
          avatar: mockUser.avatar || '',
          createdAt: mockUser.createdAt ? new Date(mockUser.createdAt) : new Date(),
          // Store original mock ID for reference
          specifications: {
            originalId: mockUser.id,
            migratedAt: new Date(),
            defaultPasswordUsed: !mockUser.password
          }
        };

        // Create and save user
        const user = new User(userData);
        await user.save();

        console.log(`✅ Migrated user: ${user.email} (${user.role})`);
        if (!mockUser.password) {
          console.log(`   ⚠️  Default password assigned: ${defaultPassword}`);
        }
        successCount++;

      } catch (error) {
        const errorMsg = `Error migrating user "${mockUser.email || mockUser.id}": ${error}`;
        errors.push(errorMsg);
        console.log(`❌ ${errorMsg}`);
        errorCount++;
      }
    }

    // Migration summary
    console.log('');
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${successCount} users`);
    console.log(`   ❌ Failed migrations: ${errorCount} users`);
    console.log(`   📝 Total processed: ${mockUsers.length} users`);

    if (errors.length > 0) {
      console.log('');
      console.log('❌ Migration Errors:');
      errors.forEach(error => console.log(`   - ${error}`));
    }

    console.log('');
    console.log('🔐 Security Notes:');
    console.log('   - All passwords have been hashed with bcrypt');
    console.log('   - Users without passwords received default: "TempPassword123!"');
    console.log('   - Advise users to change their passwords on first login');

  } catch (error) {
    console.error('❌ Error during user migration:', error);
    throw error;
  }
};

// Run script directly if called from command line
if (require.main === module) {
  const runMigration = async () => {
    try {
      await connectDatabase();
      
      // Get file path from command line argument
      const filePath = process.argv[2];
      await migrateUsers(filePath);
      
      console.log('🎉 User migration completed');
    } catch (error) {
      console.error('💥 User migration failed:', error);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      process.exit(0);
    }
  };

  runMigration();
}