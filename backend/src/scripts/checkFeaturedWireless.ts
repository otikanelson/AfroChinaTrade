import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Collection from '../models/Collection';
import Product from '../models/Product';

dotenv.config();

async function checkFeaturedWireless() {
  try {
    await connectDatabase();
    
    const collection = await Collection.findOne({ name: 'Featured Wireless devices' });
    if (!collection) {
      console.log('Collection not found');
      process.exit(1);
    }

    console.log('Collection:', collection.name);
    console.log('Filters:', JSON.stringify(collection.filters, null, 2));

    // Build query
    const query: any = { isActive: true };
    for (const filter of collection.filters) {
      if (filter.type === 'tag') {
        if (Array.isArray(filter.value)) {
          query.tags = { $in: filter.value };
        } else {
          query.tags = { $in: [filter.value] };
        }
      }
    }

    console.log('\nQuery:', JSON.stringify(query, null, 2));

    const products = await Product.find(query).limit(5);
    console.log(`\nFound ${products.length} products`);
    products.forEach(p => console.log(`  - ${p.name} (tags: ${p.tags.join(', ')})`));

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkFeaturedWireless();
