import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';

// Load environment variables
dotenv.config();
import User from '../models/User';
import Category from '../models/Category';
import Supplier from '../models/Supplier';
import Product from '../models/Product';
import Order from '../models/Order';

// Sample users
const sampleUsers = [
  {
    name: 'John Customer',
    email: 'customer@example.com',
    password: 'Customer123!',
    phone: '+1234567891',
    role: 'customer' as const,
    status: 'active' as const,
    addresses: [
      {
        type: 'shipping',
        fullName: 'John Customer',
        phone: '+1234567891',
        street: '456 Customer Ave',
        city: 'Customer City',
        state: 'Customer State',
        country: 'USA',
        postalCode: '54321',
        isDefault: true
      }
    ]
  },
  {
    name: 'Jane Buyer',
    email: 'buyer@example.com',
    password: 'Buyer123!',
    phone: '+1234567892',
    role: 'customer' as const,
    status: 'active' as const,
    addresses: [
      {
        type: 'shipping',
        fullName: 'Jane Buyer',
        phone: '+1234567892',
        street: '789 Buyer Blvd',
        city: 'Buyer City',
        state: 'Buyer State',
        country: 'USA',
        postalCode: '67890',
        isDefault: true
      }
    ]
  }
];

// Sample suppliers
const sampleSuppliers = [
  {
    name: 'TechCorp Electronics',
    email: 'contact@techcorp.com',
    phone: '+1555123456',
    address: '123 Tech Street, Silicon Valley, California, USA 94000',
    location: 'Silicon Valley, California',
    verified: true,
    rating: 4.8,
    reviewCount: 0
  },
  {
    name: 'Fashion Forward Ltd',
    email: 'info@fashionforward.com',
    phone: '+1555234567',
    address: '456 Fashion Ave, New York, New York, USA 10001',
    location: 'New York, New York',
    verified: true,
    rating: 4.6,
    reviewCount: 0
  }
];

export const seedSampleData = async (): Promise<void> => {
  try {
    console.log('🌱 Starting sample data seeding...');

    // Check if sample data already exists
    const userCount = await User.countDocuments({ role: 'customer' });
    if (userCount > 0) {
      console.log(`⚠️  Sample users already exist (${userCount} found). Skipping user seeding.`);
    } else {
      // Create users (password will be hashed by pre-save hook)
      const createdUsers = [];
      for (const userData of sampleUsers) {
        const user = new User(userData);
        await user.save();
        createdUsers.push(user);
      }
      console.log(`✅ Successfully seeded ${createdUsers.length} sample users`);
    }

    // Seed suppliers
    const supplierCount = await Supplier.countDocuments();
    if (supplierCount > 0) {
      console.log(`⚠️  Suppliers already exist (${supplierCount} found). Skipping supplier seeding.`);
    } else {
      const createdSuppliers = await Supplier.insertMany(sampleSuppliers);
      console.log(`✅ Successfully seeded ${createdSuppliers.length} sample suppliers`);
    }

    // Seed sample products (only if categories and suppliers exist)
    const categories = await Category.find().limit(3);
    const suppliers = await Supplier.find().limit(2);

    if (categories.length > 0 && suppliers.length > 0) {
      const productCount = await Product.countDocuments();
      if (productCount > 0) {
        console.log(`⚠️  Products already exist (${productCount} found). Skipping product seeding.`);
      } else {
        const sampleProducts = [
          {
            name: 'Premium Smartphone X1',
            description: 'Latest flagship smartphone with advanced features, high-resolution camera, and long-lasting battery life.',
            price: 899.99,
            category: categories[0].name, // Use category name instead of ID
            subcategory: categories[0].name === 'Electronics' ? 'Mobile Phones' : 'General',
            supplierId: suppliers[0]._id,
            stock: 50,
            images: ['/uploads/products/smartphone-x1-1.jpg', '/uploads/products/smartphone-x1-2.jpg'],
            tags: ['smartphone', 'electronics', 'mobile', 'premium'],
            specifications: {
              brand: 'TechCorp',
              model: 'X1',
              color: 'Space Gray',
              storage: '256GB',
              ram: '8GB'
            },
            isFeatured: true,
            isActive: true,
            rating: 4.5,
            reviewCount: 128,
            discount: 10
          },
          {
            name: 'Designer Casual Shirt',
            description: 'Comfortable and stylish casual shirt made from premium cotton fabric. Perfect for everyday wear.',
            price: 49.99,
            category: categories[1] ? categories[1].name : categories[0].name, // Use category name
            subcategory: (categories[1] && categories[1].name === 'Fashion') ? 'Men\'s Clothing' : 
                        (categories[1] && categories[1].name === 'Electronics') ? 'General' : 'General',
            supplierId: suppliers[1]._id,
            stock: 100,
            images: ['/uploads/products/casual-shirt-1.jpg'],
            tags: ['shirt', 'fashion', 'casual', 'cotton'],
            specifications: {
              brand: 'Fashion Forward',
              material: '100% Cotton',
              fit: 'Regular',
              care: 'Machine Wash'
            },
            isFeatured: false,
            isActive: true,
            rating: 4.2,
            reviewCount: 45,
            discount: 17
          },
          {
            name: 'Wireless Bluetooth Headphones',
            description: 'High-quality wireless headphones with noise cancellation and superior sound quality.',
            price: 199.99,
            category: categories[0].name, // Use category name
            subcategory: categories[0].name === 'Electronics' ? 'Audio' : 'General',
            supplierId: suppliers[0]._id,
            stock: 75,
            images: ['/uploads/products/headphones-1.jpg', '/uploads/products/headphones-2.jpg'],
            tags: ['headphones', 'wireless', 'bluetooth', 'audio'],
            specifications: {
              brand: 'TechCorp',
              type: 'Over-ear',
              connectivity: 'Bluetooth 5.0',
              battery: '30 hours'
            },
            isFeatured: true,
            isActive: true,
            rating: 4.7,
            reviewCount: 89,
            discount: 20
          }
        ];

        const createdProducts = await Product.insertMany(sampleProducts);
        console.log(`✅ Successfully seeded ${createdProducts.length} sample products`);
      }
    }

    console.log('🎉 Sample data seeding completed successfully');

  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    throw error;
  }
};

// Run script directly if called from command line
if (require.main === module) {
  const runSeeding = async () => {
    try {
      await connectDatabase();
      await seedSampleData();
    } catch (error) {
      console.error('💥 Sample data seeding failed:', error);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      process.exit(0);
    }
  };

  runSeeding();
}