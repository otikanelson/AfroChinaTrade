import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Category from '../models/Category';

// Load environment variables
dotenv.config();

const categories = [
  {
    name: 'Electronics',
    description: 'Electronic devices and gadgets',
    icon: 'smartphone',
    imageUrl: '/uploads/categories/electronics.jpg',
    isActive: true,
    subcategories: ['Smartphones', 'Laptops', 'Tablets', 'Accessories']
  },
  {
    name: 'Fashion',
    description: 'Clothing and fashion accessories',
    icon: 'shirt',
    imageUrl: '/uploads/categories/fashion.jpg',
    isActive: true,
    subcategories: ['Men\'s Clothing', 'Women\'s Clothing', 'Shoes', 'Accessories']
  },
  {
    name: 'Home & Garden',
    description: 'Home improvement and garden supplies',
    icon: 'home',
    imageUrl: '/uploads/categories/home-garden.jpg',
    isActive: true,
    subcategories: ['Furniture', 'Kitchen', 'Garden Tools', 'Decor']
  },
  {
    name: 'Sports & Outdoors',
    description: 'Sports equipment and outdoor gear',
    icon: 'football',
    imageUrl: '/uploads/categories/sports.jpg',
    isActive: true,
    subcategories: ['Fitness', 'Outdoor Recreation', 'Team Sports', 'Water Sports']
  },
  {
    name: 'Books & Media',
    description: 'Books, movies, music and educational materials',
    icon: 'book',
    imageUrl: '/uploads/categories/books.jpg',
    isActive: true,
    subcategories: ['Books', 'Movies', 'Music', 'Educational']
  },
  {
    name: 'Health & Beauty',
    description: 'Health products and beauty supplies',
    icon: 'heart',
    imageUrl: '/uploads/categories/health-beauty.jpg',
    isActive: true,
    subcategories: ['Skincare', 'Makeup', 'Health Supplements', 'Personal Care']
  },
  {
    name: 'Automotive',
    description: 'Car parts and automotive accessories',
    icon: 'car',
    imageUrl: '/uploads/categories/automotive.jpg',
    isActive: true,
    subcategories: ['Car Parts', 'Tools', 'Accessories', 'Maintenance']
  },
  {
    name: 'Toys & Games',
    description: 'Toys, games and entertainment for all ages',
    icon: 'gamepad',
    imageUrl: '/uploads/categories/toys.jpg',
    isActive: true,
    subcategories: ['Action Figures', 'Board Games', 'Educational Toys', 'Video Games']
  }
];

export const seedCategories = async (): Promise<void> => {
  try {
    console.log('🌱 Starting category seeding...');

    // Check if categories already exist
    const existingCount = await Category.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Categories already exist (${existingCount} found). Skipping seeding.`);
      return;
    }

    // Insert categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Successfully seeded ${createdCategories.length} categories`);

    // Log created categories
    createdCategories.forEach(category => {
      console.log(`   - ${category.name} (${category.subcategories.length} subcategories)`);
    });

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
};

// Run script directly if called from command line
if (require.main === module) {
  const runSeeding = async () => {
    try {
      await connectDatabase();
      await seedCategories();
      console.log('🎉 Category seeding completed successfully');
    } catch (error) {
      console.error('💥 Category seeding failed:', error);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      process.exit(0);
    }
  };

  runSeeding();
}