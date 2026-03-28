import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import Collection from '../models/Collection';
import User from '../models/User';

async function seedCollections() {
  try {
    // Connect to database
    await connectDatabase();
    console.log('Connected to database');

    // Find an admin user to create collections
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found, creating one...');
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
        isEmailVerified: true
      });
    }

    // Sample collections to create
    const collections = [
      {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        filters: [
          { type: 'category', value: 'Electronics' }
        ]
      },
      {
        name: 'Fashion',
        description: 'Clothing and fashion items',
        filters: [
          { type: 'category', value: 'Fashion' }
        ]
      },
      {
        name: 'Home & Garden',
        description: 'Home and garden products',
        filters: [
          { type: 'category', value: 'Home & Garden' }
        ]
      }
    ];

    // Create collections
    for (const collectionData of collections) {
      const existingCollection = await Collection.findOne({ name: collectionData.name });
      if (!existingCollection) {
        await Collection.create({
          ...collectionData,
          createdBy: adminUser._id
        });
        console.log(`Created collection: ${collectionData.name}`);
      } else {
        console.log(`Collection already exists: ${collectionData.name}`);
      }
    }

    console.log('Collections seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding collections:', error);
    process.exit(1);
  }
}

seedCollections();