import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Product from '../models/Product';
import Collection from '../models/Collection';

dotenv.config();

/**
 * Verify Collections
 * Checks that all collections have at least one product
 */

async function verifyCollections() {
  try {
    console.log('🔍 Starting collection verification...\n');
    
    await connectDatabase();
    console.log('✅ Connected to database\n');

    const collections = await Collection.find({ isActive: true });
    console.log(`📦 Checking ${collections.length} active collections\n`);

    let emptyCollections = 0;
    let totalProducts = 0;

    for (const collection of collections) {
      // Build query based on collection filters
      const query: any = { isActive: true };
      
      for (const filter of collection.filters) {
        switch (filter.type) {
          case 'category':
            query.category = filter.value;
            break;
          case 'name_contains':
            query.name = { $regex: filter.value, $options: 'i' };
            break;
          case 'tag':
            if (Array.isArray(filter.value)) {
              query.tags = { $in: filter.value };
            } else {
              query.tags = { $in: [filter.value] };
            }
            break;
          case 'price_range':
            if (typeof filter.value === 'object' && filter.value !== null) {
              const priceRange = filter.value as { min?: number; max?: number };
              if (priceRange.min !== undefined) query.price = { ...query.price, $gte: priceRange.min };
              if (priceRange.max !== undefined) query.price = { ...query.price, $lte: priceRange.max };
            }
            break;
          case 'rating_min':
            query.rating = { $gte: filter.value };
            break;
          case 'discount_min':
            query.discount = { $gte: filter.value };
            break;
        }
      }

      const productCount = await Product.countDocuments(query);
      totalProducts += productCount;

      if (productCount === 0) {
        console.log(`❌ "${collection.name}" - NO PRODUCTS`);
        emptyCollections++;
      } else {
        console.log(`✅ "${collection.name}" - ${productCount} product${productCount > 1 ? 's' : ''}`);
      }
    }

    console.log('\n=====================================');
    console.log('📊 Verification Summary:');
    console.log(`   Total collections: ${collections.length}`);
    console.log(`   Collections with products: ${collections.length - emptyCollections}`);
    console.log(`   Empty collections: ${emptyCollections}`);
    console.log(`   Total products across all collections: ${totalProducts}`);
    
    if (emptyCollections === 0) {
      console.log('\n🎉 SUCCESS! All collections have products!');
    } else {
      console.log(`\n⚠️  WARNING: ${emptyCollections} collection(s) still empty!`);
    }

  } catch (error) {
    console.error('❌ Error verifying collections:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

if (require.main === module) {
  verifyCollections();
}

export default verifyCollections;
