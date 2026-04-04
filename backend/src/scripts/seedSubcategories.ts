import mongoose from 'mongoose';
import Subcategory from '../models/Subcategory';
import Category from '../models/Category';
import { connectDatabase } from '../config/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Subcategories data organized by category
const subcategoriesData = {
  'Automotive': [
    'Electronics & Accessories',
    'Car Care & Maintenance',
    'Car Parts',
    'Tools',
    'Accessories',
    'Maintenance'
  ],
  'Electronics': [
    'Wearables',
    'Photography',
    'Audio',
    'Gaming',
    'General',
    'Mobile Phones',
    'Computers',
    'Home Appliances'
  ],
  'Fashion': [
    'Bags & Accessories',
    'Men\'s Clothing',
    'Women\'s Clothing',
    'Shoes',
    'Jewelry',
    'Watches'
  ],
  'Books and Media': [
    'Business & Finance',
    'Music & Audio',
    'Fiction',
    'Non-Fiction',
    'Educational',
    'Children\'s Books'
  ],
  'Furniture': [
    'Office',
    'Living Room',
    'Bedroom',
    'Kitchen',
    'Outdoor'
  ],
  'Office Supplies': [
    'Organization',
    'Stationery',
    'Technology',
    'Furniture'
  ],
  'Health & Beauty': [
    'Skincare',
    'Makeup',
    'Hair Care',
    'Health Supplements',
    'Personal Care'
  ],
  'Sports & Outdoors': [
    'Fitness Equipment',
    'Outdoor Gear',
    'Sports Apparel',
    'Team Sports'
  ],
  'Home & Garden': [
    'Kitchen & Dining',
    'Home Decor',
    'Garden Tools',
    'Cleaning Supplies'
  ],
  'Toys & Games': [
    'Educational Toys',
    'Board Games',
    'Action Figures',
    'Puzzles'
  ]
};

async function seedSubcategories() {
  try {
    console.log('🌱 Starting subcategories seeding...');
    
    // Connect to database
    await connectDatabase();
    
    // Clear existing subcategories
    console.log('🗑️  Clearing existing subcategories...');
    await Subcategory.deleteMany({});
    
    let totalCreated = 0;
    
    // Process each category
    for (const [categoryName, subcategoryNames] of Object.entries(subcategoriesData)) {
      console.log(`\n📂 Processing category: ${categoryName}`);
      
      // Find the category in the database
      const category = await Category.findOne({ name: categoryName });
      if (!category) {
        console.log(`⚠️  Category '${categoryName}' not found in database, skipping...`);
        continue;
      }
      
      // Create subcategories for this category
      for (const subcategoryName of subcategoryNames) {
        try {
          const subcategory = new Subcategory({
            name: subcategoryName,
            description: `${subcategoryName} in ${categoryName}`,
            categoryId: category._id,
            categoryName: category.name,
            isActive: true
          });
          
          await subcategory.save();
          console.log(`  ✅ Created subcategory: ${subcategoryName}`);
          totalCreated++;
        } catch (error: any) {
          if (error.code === 11000) {
            console.log(`  ⚠️  Subcategory '${subcategoryName}' already exists in ${categoryName}`);
          } else {
            console.error(`  ❌ Error creating subcategory '${subcategoryName}':`, error.message);
          }
        }
      }
    }
    
    console.log(`\n🎉 Subcategories seeding completed!`);
    console.log(`📊 Total subcategories created: ${totalCreated}`);
    
    // Verify the seeding
    const totalSubcategories = await Subcategory.countDocuments();
    console.log(`📈 Total subcategories in database: ${totalSubcategories}`);
    
    // Show some examples
    console.log('\n📋 Sample subcategories:');
    const sampleSubcategories = await Subcategory.find()
      .populate('categoryId', 'name')
      .limit(10)
      .sort({ categoryName: 1, name: 1 });
    
    sampleSubcategories.forEach(sub => {
      console.log(`  • ${sub.name} (${sub.categoryName})`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding subcategories:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the seeding function
if (require.main === module) {
  seedSubcategories();
}

export default seedSubcategories;