import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Product from '../models/Product';
import Collection from '../models/Collection';
import Supplier from '../models/Supplier';
import Category from '../models/Category';

dotenv.config();

/**
 * Seed Collection Products
 * Ensures every collection has products by creating products that match collection filters
 */

async function seedCollectionProducts() {
  try {
    console.log('🚀 Starting collection products seeding...\n');
    
    await connectDatabase();
    console.log('✅ Connected to database\n');

    // Get all collections
    const collections = await Collection.find({ isActive: true });
    console.log(`📦 Found ${collections.length} active collections\n`);

    // Get or create default supplier
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
      console.log('✅ Created default supplier\n');
    }

    let totalCreated = 0;
    let collectionsWithProducts = 0;
    let emptyCollections = 0;

    // Process each collection
    for (const collection of collections) {
      console.log(`\n📂 Processing: "${collection.name}"`);
      
      // Build query based on collection filters
      const query: any = { isActive: true };
      
      for (const filter of collection.filters) {
        switch (filter.type) {
          case 'category':
            query.category = filter.value;
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

      // Check if products exist for this collection
      const productCount = await Product.countDocuments(query);
      
      if (productCount > 0) {
        console.log(`   ✓ Collection has products (${productCount} found)`);
        collectionsWithProducts++;
        continue;
      }

      console.log(`   ⚠️  Collection is empty, creating products...`);
      emptyCollections++;

      // Create products based on collection type
      const productsToCreate = generateProductsForCollection(collection, defaultSupplier._id);
      
      for (const productData of productsToCreate) {
        try {
          const product = new Product(productData);
          await product.save();
          console.log(`   ✅ Created: ${product.name}`);
          totalCreated++;
        } catch (error: any) {
          if (error.code === 11000) {
            console.log(`   ⏭️  Product already exists: ${productData.name}`);
          } else {
            console.error(`   ❌ Failed to create product:`, error.message);
          }
        }
      }
    }

    console.log('\n=====================================');
    console.log('🎉 Collection products seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   ✅ Collections with products: ${collectionsWithProducts}`);
    console.log(`   🔨 Empty collections fixed: ${emptyCollections}`);
    console.log(`   📦 New products created: ${totalCreated}`);
    console.log(`   📋 Total collections: ${collections.length}`);

  } catch (error) {
    console.error('❌ Error seeding collection products:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

function generateProductsForCollection(collection: any, supplierId: mongoose.Types.ObjectId): any[] {
  const products: any[] = [];
  const filter = collection.filters[0]; // Use primary filter

  // Generate 2-3 products per collection
  const productCount = Math.floor(Math.random() * 2) + 2;

  for (let i = 0; i < productCount; i++) {
    const baseProduct = {
      supplierId,
      currency: 'NGN',
      isActive: true,
      stock: Math.floor(Math.random() * 50) + 10,
      rating: 4.0 + Math.random() * 1.0,
      reviewCount: Math.floor(Math.random() * 200) + 20,
      viewCount: Math.floor(Math.random() * 1000) + 100,
      trendingScore: Math.floor(Math.random() * 50) + 20,
      lastViewedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
      specifications: new Map([
        ['Brand', 'Premium Brand'],
        ['Warranty', '1 year manufacturer warranty'],
        ['Quality', 'High quality materials']
      ]),
      policies: {
        paymentPolicy: 'Multiple payment options available',
        shippingPolicy: 'Fast shipping nationwide',
        refundPolicy: '14-day return policy',
        guidelines: 'Follow product instructions',
        suggestions: 'Contact seller for bulk orders'
      }
    };

    let product: any;

    switch (filter.type) {
      case 'category':
        product = generateCategoryProduct(filter.value as string, i, baseProduct);
        break;
      case 'tag':
        product = generateTagProduct(filter.value as string, i, baseProduct);
        break;
      case 'price_range':
        product = generatePriceRangeProduct(filter.value as any, i, baseProduct);
        break;
      case 'rating_min':
        product = generateRatingProduct(filter.value as number, i, baseProduct);
        break;
      case 'discount_min':
        product = generateDiscountProduct(filter.value as number, i, baseProduct);
        break;
      default:
        product = generateGenericProduct(collection.name, i, baseProduct);
    }

    if (product) {
      products.push(product);
    }
  }

  return products;
}

function generateCategoryProduct(category: string, index: number, base: any): any {
  const productTemplates: Record<string, any> = {
    'Electronics': {
      names: ['Wireless Bluetooth Headphones Pro', 'Smart LED TV 55 Inch 4K', 'Portable Power Bank 20000mAh'],
      descriptions: [
        'High-quality wireless headphones with active noise cancellation and 30-hour battery life',
        'Ultra HD 4K Smart TV with HDR support and built-in streaming apps',
        'Fast-charging power bank with dual USB ports and LED display'
      ],
      prices: [45000, 285000, 18500],
      tags: ['trending', 'premium', 'new']
    },
    'Fashion': {
      names: ['Designer Sneakers Premium', 'Elegant Evening Dress', 'Leather Wallet Classic'],
      descriptions: [
        'Comfortable premium sneakers with breathable mesh and cushioned sole',
        'Stunning evening dress perfect for special occasions',
        'Genuine leather wallet with multiple card slots and RFID protection'
      ],
      prices: [35000, 65000, 15000],
      tags: ['premium', 'bestseller', 'trending']
    },
    'Furniture': {
      names: ['Modern Office Chair Ergonomic', 'Wooden Dining Table Set', 'Comfortable Sofa 3-Seater'],
      descriptions: [
        'Ergonomic office chair with lumbar support and adjustable height',
        'Solid wood dining table with 6 matching chairs',
        'Comfortable 3-seater sofa with premium fabric upholstery'
      ],
      prices: [75000, 185000, 245000],
      tags: ['premium', 'new', 'trending']
    },
    'Automotive': {
      names: ['Car Tire Set Premium 4pcs', 'LED Headlight Bulbs Pair', 'Car Floor Mats Universal'],
      descriptions: [
        'High-performance tires with excellent grip and durability',
        'Bright LED headlight bulbs with easy installation',
        'Waterproof car floor mats with anti-slip backing'
      ],
      prices: [95000, 22000, 12500],
      tags: ['premium', 'bestseller', 'sale']
    },
    'Books and Media': {
      names: ['Business Strategy Handbook', 'Classic Movie Collection DVD', 'Educational Audio Course Set'],
      descriptions: [
        'Comprehensive guide to modern business strategy and management',
        'Collection of timeless classic movies on DVD',
        'Professional audio course for skill development'
      ],
      prices: [12000, 8500, 25000],
      tags: ['bestseller', 'new', 'trending']
    }
  };

  const template = productTemplates[category] || {
    names: [`${category} Product ${index + 1}`, `Premium ${category} Item`, `Quality ${category} Product`],
    descriptions: [`High-quality ${category.toLowerCase()} product`, `Premium ${category.toLowerCase()} item`, `Quality ${category.toLowerCase()} product`],
    prices: [25000, 45000, 65000],
    tags: ['premium', 'new']
  };

  const idx = index % template.names.length;

  return {
    ...base,
    name: `${template.names[idx]} - ${Date.now()}-${index}`,
    description: template.descriptions[idx],
    price: template.prices[idx],
    category,
    subcategory: 'General',
    tags: template.tags,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop'
    ],
    discount: Math.floor(Math.random() * 15)
  };
}

function generateTagProduct(tag: string, index: number, base: any): any {
  return {
    ...base,
    name: `${tag.charAt(0).toUpperCase() + tag.slice(1)} Product ${Date.now()}-${index}`,
    description: `Premium product featuring ${tag} technology and design`,
    price: 35000 + Math.floor(Math.random() * 50000),
    category: 'Electronics',
    subcategory: 'General',
    tags: [tag, 'premium', 'new'],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop'
    ],
    discount: Math.floor(Math.random() * 20)
  };
}

function generatePriceRangeProduct(priceRange: { min?: number; max?: number }, index: number, base: any): any {
  const min = priceRange.min || 10000;
  const max = priceRange.max || 500000;
  const price = min + Math.floor(Math.random() * (max - min));

  return {
    ...base,
    name: `Quality Product ${Date.now()}-${index}`,
    description: `Premium product in the ₦${min.toLocaleString()} - ₦${max.toLocaleString()} range`,
    price,
    category: 'Electronics',
    subcategory: 'General',
    tags: ['premium', 'bestseller', 'sale'],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop'
    ],
    discount: Math.floor(Math.random() * 15)
  };
}

function generateRatingProduct(minRating: number, index: number, base: any): any {
  return {
    ...base,
    name: `Top Rated Product ${Date.now()}-${index}`,
    description: 'Highly rated product with excellent customer reviews and satisfaction',
    price: 45000 + Math.floor(Math.random() * 80000),
    category: 'Electronics',
    subcategory: 'General',
    tags: ['bestseller', 'premium', 'trending'],
    rating: minRating + Math.random() * (5 - minRating),
    reviewCount: Math.floor(Math.random() * 500) + 100,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop'
    ],
    discount: Math.floor(Math.random() * 10)
  };
}

function generateDiscountProduct(minDiscount: number, index: number, base: any): any {
  return {
    ...base,
    name: `Hot Deal Product ${Date.now()}-${index}`,
    description: 'Amazing discount on quality product - limited time offer',
    price: 55000 + Math.floor(Math.random() * 70000),
    category: 'Electronics',
    subcategory: 'General',
    tags: ['sale', 'limited', 'trending'],
    discount: minDiscount + Math.floor(Math.random() * (50 - minDiscount)),
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop'
    ]
  };
}

function generateGenericProduct(collectionName: string, index: number, base: any): any {
  return {
    ...base,
    name: `${collectionName} Product ${Date.now()}-${index}`,
    description: `Quality product for ${collectionName} collection`,
    price: 35000 + Math.floor(Math.random() * 60000),
    category: 'Electronics',
    subcategory: 'General',
    tags: ['premium', 'new'],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop'
    ],
    discount: Math.floor(Math.random() * 15)
  };
}

if (require.main === module) {
  seedCollectionProducts();
}

export default seedCollectionProducts;
