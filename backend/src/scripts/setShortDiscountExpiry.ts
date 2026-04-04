import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Product from '../models/Product';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || '';

async function setShortDiscountExpiry() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find products with discounts
    const productsWithDiscounts = await Product.find({
      discount: { $gt: 0 }
    }).limit(5);

    console.log(`📦 Found ${productsWithDiscounts.length} products with discounts`);

    const now = new Date();
    let updated = 0;

    for (const product of productsWithDiscounts) {
      let hoursToAdd: number;
      
      if (updated === 0) hoursToAdd = 2; // 2 hours
      else if (updated === 1) hoursToAdd = 12; // 12 hours
      else if (updated === 2) hoursToAdd = 24; // 1 day
      else if (updated === 3) hoursToAdd = 48; // 2 days
      else hoursToAdd = 72; // 3 days

      const expiryDate = new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000);
      
      product.discountExpiresAt = expiryDate;
      await product.save();
      
      updated++;
      console.log(`✅ Updated ${product.name}: ${product.discount}% off expires in ${hoursToAdd} hours`);
    }

    console.log(`\n🎉 Successfully updated ${updated} products with short discount expiry dates`);
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
setShortDiscountExpiry();