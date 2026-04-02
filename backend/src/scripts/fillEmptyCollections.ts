import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Product from '../models/Product';
import Collection from '../models/Collection';
import Supplier from '../models/Supplier';

dotenv.config();

async function fillEmptyCollections() {
  try {
    console.log('🚀 Filling empty collections...\n');
    
    await connectDatabase();
    console.log('✅ Connected to database\n');

    // Get default supplier
    let defaultSupplier = await Supplier.findOne({ verified: true });
    if (!defaultSupplier) {
      defaultSupplier = await Supplier.create({
        name: 'Premium Marketplace Supplier',
        email: 'supplier@afrochinatrade.com',
        phone: '+234 8012345678',
        address: 'Lagos, Nigeria',
        location: 'Lagos, Nigeria',
        verified: true,
        rating: 4.7,
        reviewCount: 250,
        responseTime: '2 hours'
      });
    }

    const collections = await Collection.find({ isActive: true });
    console.log(`📦 Checking ${collections.length} collections\n`);

    let fixedCount = 0;

    for (const collection of collections) {
      // Build query
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
      
      if (productCount === 0) {
        console.log(`❌ "${collection.name}" - EMPTY`);
        console.log(`   Filters: ${JSON.stringify(collection.filters)}`);
        
        // Create products that match the filters
        const productsToCreate = createMatchingProducts(collection, defaultSupplier._id);
        
        for (const productData of productsToCreate) {
          try {
            const product = new Product(productData);
            await product.save();
            console.log(`   ✅ Created: ${product.name}`);
            fixedCount++;
          } catch (error: any) {
            console.error(`   ❌ Failed: ${error.message}`);
          }
        }
      } else {
        console.log(`✅ "${collection.name}" - ${productCount} products`);
      }
    }

    console.log(`\n🎉 Fixed ${fixedCount} products for empty collections!`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

function createMatchingProducts(collection: any, supplierId: mongoose.Types.ObjectId): any[] {
  const products: any[] = [];

  // Extract filter requirements
  let category = 'Electronics';
  let nameContains = '';
  let requiredTags: string[] = [];
  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  let minRating: number | undefined;
  let minDiscount: number | undefined;

  collection.filters.forEach((filter: any) => {
    switch (filter.type) {
      case 'category':
        category = filter.value;
        break;
      case 'name_contains':
        nameContains = filter.value;
        break;
      case 'tag':
        if (Array.isArray(filter.value)) {
          requiredTags.push(...filter.value);
        } else {
          requiredTags.push(filter.value);
        }
        break;
      case 'price_range':
        if (typeof filter.value === 'object') {
          const range = filter.value as { min?: number; max?: number };
          minPrice = range.min;
          maxPrice = range.max;
        }
        break;
      case 'rating_min':
        minRating = filter.value as number;
        break;
      case 'discount_min':
        minDiscount = filter.value as number;
        break;
    }
  });

  // Create 3 products that match ALL filters
  for (let i = 0; i < 3; i++) {
    const timestamp = Date.now();
    const baseName = nameContains || collection.name;
    
    const price = minPrice && maxPrice 
      ? minPrice + Math.floor(Math.random() * (maxPrice - minPrice))
      : minPrice 
        ? minPrice + Math.floor(Math.random() * 100000)
        : maxPrice
          ? Math.floor(Math.random() * maxPrice)
          : 35000 + Math.floor(Math.random() * 60000);

    const rating = minRating 
      ? minRating + Math.random() * (5 - minRating)
      : 4.0 + Math.random() * 1.0;

    const discount = minDiscount
      ? minDiscount + Math.floor(Math.random() * (50 - minDiscount))
      : Math.floor(Math.random() * 20);

    const tags = requiredTags.length > 0 
      ? [...requiredTags, 'premium', 'new']
      : ['premium', 'new', 'trending'];

    products.push({
      name: `${baseName} Product ${timestamp}-${i}`,
      description: `Premium ${category} product matching ${collection.name} collection criteria`,
      price,
      currency: 'NGN',
      category,
      subcategory: 'General',
      supplierId,
      rating,
      reviewCount: Math.floor(Math.random() * 200) + 50,
      stock: Math.floor(Math.random() * 50) + 15,
      tags,
      discount,
      isNewProduct: tags.includes('new'),
      isFeatured: tags.includes('featured'),
      isActive: true,
      viewCount: Math.floor(Math.random() * 1000) + 150,
      isSellerFavorite: Math.random() > 0.5,
      trendingScore: Math.floor(Math.random() * 50) + 25,
      lastViewedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
      specifications: new Map([
        ['Brand', 'Premium Brand'],
        ['Warranty', '1 year warranty'],
        ['Quality', 'High quality materials']
      ]),
      policies: {
        paymentPolicy: 'Multiple payment options available',
        shippingPolicy: 'Fast nationwide shipping',
        refundPolicy: '14-day return policy',
        guidelines: 'Follow product instructions',
        suggestions: 'Contact seller for bulk orders'
      },
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop'
      ]
    });
  }

  return products;
}

if (require.main === module) {
  fillEmptyCollections();
}

export default fillEmptyCollections;
