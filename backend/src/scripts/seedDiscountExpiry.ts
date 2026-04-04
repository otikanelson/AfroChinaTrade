import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Product from '../models/Product';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || '';

async function seedDiscountExpiry() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all products with discounts but no expiry date
    const productsWithDiscounts = await Product.find({
      discount: { $gt: 0 },
      discountExpiresAt: { $exists: false }
    });

    console.log(`📦 Found ${productsWithDiscounts.length} products with discounts to update`);

    if (productsWithDiscounts.length === 0) {
      console.log('✅ No products need updating');
      await mongoose.disconnect();
      return;
    }

    const now = new Date();
    let updated = 0;

    for (const product of productsWithDiscounts) {
      // Generate a sensible expiry date based on discount percentage
      let daysToAdd: number;
      
      if (product.discount >= 50) {
        // High discounts: 3-7 days (flash sales)
        daysToAdd = Math.floor(Math.random() * 5) + 3;
      } else if (product.discount >= 30) {
        // Medium discounts: 7-14 days
        daysToAdd = Math.floor(Math.random() * 8) + 7;
      } else if (product.discount >= 15) {
        // Low-medium discounts: 14-30 days
        daysToAdd = Math.floor(Math.random() * 17) + 14;
      } else {
        // Small discounts: 30-60 days
        daysToAdd = Math.floor(Math.random() * 31) + 30;
      }

      const expiryDate = new Date(now);
      expiryDate.setDate(expiryDate.getDate() + daysToAdd);

      product.discountExpiresAt = expiryDate;
      await product.save();
      
      updated++;
      console.log(`✅ Updated ${product.name}: ${product.discount}% off expires in ${daysToAdd} days`);
    }

    console.log(`\n🎉 Successfully updated ${updated} products with discount expiry dates`);
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding discount expiry:', error);
    process.exit(1);
  }
}

// Run the script
seedDiscountExpiry();
