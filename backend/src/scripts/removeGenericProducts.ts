import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Product from '../models/Product';

// Load environment variables
dotenv.config();

/**
 * Script to remove generic seeded products with random names containing numbers
 * This will identify and delete products that match patterns like:
 * - "Product 123"
 * - "Test Product 456"
 * - "Sample Item 789"
 * - Any product name ending with numbers
 */

async function removeGenericProducts() {
  try {
    console.log('🔍 Starting generic products removal...');
    console.log('=====================================\n');

    // First, let's see what products we have
    const allProducts = await Product.find({}).select('name category price').lean();
    console.log(`📦 Total products in database: ${allProducts.length}\n`);

    // Pattern to match generic product names with timestamp-based random numbers
    // Matches patterns like: "Minimalist Product 1775149308584-0"
    const genericPatterns = [
      /^Product\s+\d+/i,                    // "Product 123"
      /^Test\s+Product\s+\d+/i,             // "Test Product 123"
      /^Sample\s+.*\d+/i,                   // "Sample Item 123"
      /^Item\s+\d+/i,                       // "Item 123"
      /^Generic\s+.*\d+/i,                  // "Generic Product 123"
      /\s+\d{10,}/,                         // Names with 10+ consecutive digits (timestamps)
      /\s+\d{13,}-\d+$/,                    // Names ending with timestamp pattern like "1775149308584-0"
      /^(Minimalist|Modern|Classic|Premium|Luxury|Elegant)\s+(Product|Item)\s+\d{10,}/i, // Generic prefix + timestamp
    ];

    // Find products matching generic patterns
    const productsToDelete: any[] = [];
    
    for (const product of allProducts) {
      const isGeneric = genericPatterns.some(pattern => pattern.test(product.name));
      if (isGeneric) {
        productsToDelete.push(product);
      }
    }

    if (productsToDelete.length === 0) {
      console.log('✅ No generic products found matching the patterns.');
      console.log('   All products appear to have proper names.\n');
      return;
    }

    console.log(`🎯 Found ${productsToDelete.length} generic products to remove:\n`);
    
    // Display products that will be deleted
    productsToDelete.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Price: ₦${product.price.toLocaleString()}`);
      console.log(`   ID: ${product._id}\n`);
    });

    // Confirm deletion
    console.log('⚠️  Preparing to delete these products...\n');

    // Delete the products
    const productIds = productsToDelete.map(p => p._id);
    const deleteResult = await Product.deleteMany({ _id: { $in: productIds } });

    console.log('✅ Deletion completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Products deleted: ${deleteResult.deletedCount}`);
    console.log(`   - Remaining products: ${allProducts.length - deleteResult.deletedCount}\n`);

    // Show remaining products count by category
    const remainingProducts = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log('📈 Remaining products by category:');
    remainingProducts.forEach(cat => {
      console.log(`   - ${cat._id}: ${cat.count} products`);
    });

  } catch (error) {
    console.error('❌ Error removing generic products:', error);
    throw error;
  }
}

// Run script
if (require.main === module) {
  const runScript = async () => {
    try {
      await connectDatabase();
      await removeGenericProducts();
    } catch (error) {
      console.error('💥 Script failed:', error);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      console.log('\n🔌 Disconnected from database');
      process.exit(0);
    }
  };

  runScript();
}

export default removeGenericProducts;
