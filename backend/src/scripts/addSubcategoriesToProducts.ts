import mongoose from 'mongoose';
import Product from '../models/Product';
import { connectDatabase } from '../config/database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Mapping of categories to default subcategories and tag-based subcategories
const categorySubcategoryMap: { [key: string]: { default: string; tagMap: { [key: string]: string } } } = {
  'Electronics': {
    default: 'General',
    tagMap: {
      'smartphone': 'Mobile Phones',
      'mobile': 'Mobile Phones',
      'phone': 'Mobile Phones',
      'headphones': 'Audio',
      'audio': 'Audio',
      'speaker': 'Audio',
      'gaming': 'Gaming',
      'game': 'Gaming',
      'console': 'Gaming',
      'camera': 'Photography',
      'photography': 'Photography',
      'lens': 'Photography',
      'laptop': 'Computers',
      'computer': 'Computers',
      'pc': 'Computers',
      'watch': 'Wearables',
      'smartwatch': 'Wearables',
      'fitness': 'Wearables',
      'appliance': 'Home Appliances',
      'kitchen': 'Home Appliances'
    }
  },
  'Fashion': {
    default: 'General',
    tagMap: {
      'shirt': 'Men\'s Clothing',
      'pants': 'Men\'s Clothing',
      'dress': 'Women\'s Clothing',
      'skirt': 'Women\'s Clothing',
      'shoes': 'Shoes',
      'sneakers': 'Shoes',
      'bag': 'Bags & Accessories',
      'handbag': 'Bags & Accessories',
      'jewelry': 'Jewelry',
      'necklace': 'Jewelry',
      'watch': 'Watches'
    }
  },
  'Automotive': {
    default: 'Accessories',
    tagMap: {
      'dashcam': 'Electronics & Accessories',
      'camera': 'Electronics & Accessories',
      'gps': 'Electronics & Accessories',
      'detailing': 'Car Care & Maintenance',
      'cleaning': 'Car Care & Maintenance',
      'wax': 'Car Care & Maintenance',
      'parts': 'Car Parts',
      'engine': 'Car Parts',
      'tools': 'Tools'
    }
  },
  'Furniture': {
    default: 'Living Room',
    tagMap: {
      'office': 'Office',
      'chair': 'Office',
      'desk': 'Office',
      'bed': 'Bedroom',
      'mattress': 'Bedroom',
      'kitchen': 'Kitchen',
      'dining': 'Kitchen',
      'outdoor': 'Outdoor',
      'patio': 'Outdoor'
    }
  },
  'Books and Media': {
    default: 'General',
    tagMap: {
      'business': 'Business & Finance',
      'finance': 'Business & Finance',
      'music': 'Music & Audio',
      'audio': 'Music & Audio',
      'fiction': 'Fiction',
      'novel': 'Fiction',
      'education': 'Educational',
      'textbook': 'Educational',
      'children': 'Children\'s Books',
      'kids': 'Children\'s Books'
    }
  },
  'Home & Garden': {
    default: 'Home Decor',
    tagMap: {
      'kitchen': 'Kitchen & Dining',
      'dining': 'Kitchen & Dining',
      'cookware': 'Kitchen & Dining',
      'decor': 'Home Decor',
      'decoration': 'Home Decor',
      'garden': 'Garden Tools',
      'plant': 'Garden Tools',
      'cleaning': 'Cleaning Supplies',
      'cleaner': 'Cleaning Supplies'
    }
  }
};

function getSubcategoryForProduct(category: string, tags: string[], name: string): string {
  const categoryMap = categorySubcategoryMap[category];
  if (!categoryMap) {
    return 'General';
  }

  // Check tags first
  for (const tag of tags) {
    const subcategory = categoryMap.tagMap[tag.toLowerCase()];
    if (subcategory) {
      return subcategory;
    }
  }

  // Check product name for keywords
  const lowerName = name.toLowerCase();
  for (const [keyword, subcategory] of Object.entries(categoryMap.tagMap)) {
    if (lowerName.includes(keyword)) {
      return subcategory;
    }
  }

  // Return default subcategory for the category
  return categoryMap.default;
}

async function addSubcategoriesToProducts() {
  try {
    console.log('🔄 Starting to add subcategories to existing products...');
    
    // Connect to database
    await connectDatabase();
    
    // Find products without subcategories
    const productsWithoutSubcategories = await Product.find({
      $or: [
        { subcategory: { $exists: false } },
        { subcategory: null },
        { subcategory: '' }
      ]
    });

    console.log(`📊 Found ${productsWithoutSubcategories.length} products without subcategories`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of productsWithoutSubcategories) {
      try {
        const subcategory = getSubcategoryForProduct(
          product.category,
          product.tags || [],
          product.name
        );

        await Product.findByIdAndUpdate(product._id, { subcategory });
        updatedCount++;
        
        console.log(`✅ Updated "${product.name}" -> ${product.category} -> ${subcategory}`);
      } catch (error) {
        console.error(`❌ Failed to update product "${product.name}":`, error);
        skippedCount++;
      }
    }

    console.log('');
    console.log('🎉 Subcategory assignment completed!');
    console.log(`📊 Summary:`);
    console.log(`   ✅ Products updated: ${updatedCount}`);
    console.log(`   ⚠️  Products skipped: ${skippedCount}`);
    console.log(`   📈 Total processed: ${productsWithoutSubcategories.length}`);

  } catch (error) {
    console.error('❌ Error adding subcategories to products:', error);
    throw error;
  }
}

// Run script directly if called from command line
if (require.main === module) {
  const runScript = async () => {
    try {
      await addSubcategoriesToProducts();
    } catch (error) {
      console.error('💥 Script failed:', error);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      process.exit(0);
    }
  };

  runScript();
}

export { addSubcategoriesToProducts };