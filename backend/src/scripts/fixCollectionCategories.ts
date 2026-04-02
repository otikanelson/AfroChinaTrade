import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Category from '../models/Category';
import Collection from '../models/Collection';

dotenv.config();

/**
 * Fix Collection Categories
 * Ensures all categories referenced in collections exist in the database
 */

async function fixCollectionCategories() {
  try {
    console.log('🔧 Starting collection categories fix...\n');
    
    await connectDatabase();
    console.log('✅ Connected to database\n');

    // Get all collections
    const collections = await Collection.find({});
    console.log(`📦 Found ${collections.length} collections\n`);

    // Extract unique category names from collections
    const categoryNames = new Set<string>();
    collections.forEach(collection => {
      collection.filters.forEach(filter => {
        if (filter.type === 'category' && typeof filter.value === 'string') {
          categoryNames.add(filter.value);
        }
      });
    });

    console.log(`🏷️  Found ${categoryNames.size} unique categories referenced in collections:`);
    categoryNames.forEach(name => console.log(`   - ${name}`));
    console.log('');

    // Check which categories exist
    const existingCategories = await Category.find({});
    const existingCategoryNames = new Set(existingCategories.map(c => c.name));
    
    console.log(`📊 Existing categories in database: ${existingCategories.length}`);
    existingCategories.forEach(cat => console.log(`   ✓ ${cat.name}`));
    console.log('');

    // Find missing categories
    const missingCategories = Array.from(categoryNames).filter(
      name => !existingCategoryNames.has(name)
    );

    if (missingCategories.length === 0) {
      console.log('✅ All collection categories already exist in database!');
      return;
    }

    console.log(`⚠️  Missing categories: ${missingCategories.length}`);
    missingCategories.forEach(name => console.log(`   ❌ ${name}`));
    console.log('');

    // Create missing categories
    console.log('🔨 Creating missing categories...\n');
    
    const categoryMappings: Record<string, { description: string; icon: string; subcategories: string[] }> = {
      'Furniture': {
        description: 'Furniture and home furnishings',
        icon: 'bed-outline',
        subcategories: ['Living Room', 'Bedroom', 'Office', 'Outdoor']
      }
    };

    let createdCount = 0;
    for (const categoryName of missingCategories) {
      const categoryData = categoryMappings[categoryName] || {
        description: `${categoryName} products and accessories`,
        icon: 'cube-outline',
        subcategories: []
      };

      await Category.create({
        name: categoryName,
        description: categoryData.description,
        icon: categoryData.icon,
        imageUrl: `/uploads/categories/${categoryName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
        subcategories: categoryData.subcategories,
        isActive: true
      });

      console.log(`✅ Created category: ${categoryName}`);
      createdCount++;
    }

    console.log(`\n🎉 Successfully created ${createdCount} missing categories!`);

  } catch (error) {
    console.error('❌ Error fixing collection categories:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

if (require.main === module) {
  fixCollectionCategories();
}

export default fixCollectionCategories;
