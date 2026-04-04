import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Product from '../models/Product';

// Load environment variables
dotenv.config();

/**
 * Script to list all products in the database
 * Helps identify which products are generic/seeded vs real products
 */

async function listAllProducts() {
  try {
    console.log('📋 Listing all products in database...');
    console.log('=====================================\n');

    // Get all products sorted by name
    const products = await Product.find({})
      .select('name category price stock createdAt')
      .sort({ name: 1 })
      .lean();

    console.log(`📦 Total products: ${products.length}\n`);

    // Group by category
    const productsByCategory = products.reduce((acc: any, product: any) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {});

    // Display products by category
    Object.keys(productsByCategory).sort().forEach(category => {
      const categoryProducts = productsByCategory[category];
      console.log(`\n📁 ${category} (${categoryProducts.length} products):`);
      console.log('─'.repeat(60));
      
      categoryProducts.forEach((product: any, index: number) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   Price: ₦${product.price.toLocaleString()} | Stock: ${product.stock}`);
        console.log(`   Created: ${new Date(product.createdAt).toLocaleDateString()}`);
      });
    });

    console.log('\n\n📊 Summary by Category:');
    console.log('─'.repeat(60));
    Object.keys(productsByCategory).sort().forEach(category => {
      console.log(`${category}: ${productsByCategory[category].length} products`);
    });

  } catch (error) {
    console.error('❌ Error listing products:', error);
    throw error;
  }
}

// Run script
if (require.main === module) {
  const runScript = async () => {
    try {
      await connectDatabase();
      await listAllProducts();
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

export default listAllProducts;
