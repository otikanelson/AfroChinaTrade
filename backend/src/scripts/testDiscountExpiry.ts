import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Product from '../models/Product';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || '';

async function testDiscountExpiry() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find products with discounts
    const productsWithDiscounts = await Product.find({
      discount: { $gt: 0 }
    }).limit(10);

    console.log(`📦 Found ${productsWithDiscounts.length} products with discounts`);

    if (productsWithDiscounts.length === 0) {
      // Create some test products with discounts and expiry dates
      console.log('🔧 Creating test products with discounts...');
      
      const testProducts = [
        {
          name: 'Test Product 1 - Flash Sale',
          description: 'Test product with flash sale discount',
          price: 50000,
          category: 'Electronics',
          supplierId: new mongoose.Types.ObjectId(),
          stock: 10,
          discount: 25,
          discountExpiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
          images: ['https://via.placeholder.com/300']
        },
        {
          name: 'Test Product 2 - Limited Time',
          description: 'Test product with limited time discount',
          price: 75000,
          category: 'Fashion',
          supplierId: new mongoose.Types.ObjectId(),
          stock: 5,
          discount: 15,
          discountExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
          images: ['https://via.placeholder.com/300']
        },
        {
          name: 'Test Product 3 - Ending Soon',
          description: 'Test product with discount ending soon',
          price: 30000,
          category: 'Home',
          supplierId: new mongoose.Types.ObjectId(),
          stock: 8,
          discount: 30,
          discountExpiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
          images: ['https://via.placeholder.com/300']
        }
      ];

      for (const productData of testProducts) {
        const product = new Product(productData);
        await product.save();
        console.log(`✅ Created: ${product.name} - ${product.discount}% off`);
      }
    } else {
      // Update existing products with expiry dates
      const now = new Date();
      let updated = 0;

      for (const product of productsWithDiscounts.slice(0, 5)) {
        if (!product.discountExpiresAt) {
          // Add different expiry times for testing
          let hoursToAdd: number;
          
          if (updated === 0) hoursToAdd = 6; // 6 hours
          else if (updated === 1) hoursToAdd = 24; // 1 day
          else if (updated === 2) hoursToAdd = 48; // 2 days
          else if (updated === 3) hoursToAdd = 72; // 3 days
          else hoursToAdd = 168; // 7 days

          const expiryDate = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
          
          product.discountExpiresAt = expiryDate;
          await product.save();
          
          updated++;
          console.log(`✅ Updated ${product.name}: ${product.discount}% off expires in ${hoursToAdd} hours`);
        }
      }

      console.log(`\n🎉 Successfully updated ${updated} products with discount expiry dates`);
    }

    // Show current products with discount expiry
    const productsWithExpiry = await Product.find({
      discount: { $gt: 0 },
      discountExpiresAt: { $exists: true }
    }).select('name discount discountExpiresAt').limit(10);

    console.log('\n📋 Products with discount expiry:');
    productsWithExpiry.forEach(product => {
      const now = new Date();
      const expiry = new Date(product.discountExpiresAt!);
      const diffHours = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60));
      console.log(`   ${product.name}: ${product.discount}% off, expires in ${diffHours}h`);
    });
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
testDiscountExpiry();