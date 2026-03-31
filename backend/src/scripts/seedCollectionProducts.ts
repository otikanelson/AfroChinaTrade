import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Product from '../models/Product';
import Supplier from '../models/Supplier';

dotenv.config();

/**
 * Seeds additional products for specific collections:
 * - Home & Living (category: Furniture) — 4 new products
 * - Bestsellers (tag: bestseller) — 5 new products
 * - Top Rated (rating >= 4.5) — 3 new products
 * - Customer Favorites (rating >= 4.0) — 3 new products
 *
 * Some products intentionally belong to multiple collections.
 */

const newProducts = [
  // ── Home & Living (Furniture category) ──────────────────────────────────────

  {
    name: 'Luxury Velvet Sofa 3-Seater',
    description:
      'Elegant three-seater sofa upholstered in premium velvet fabric. Features solid wood frame, high-density foam cushions, and tapered legs for a modern aesthetic.',
    price: 320000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&h=800&fit=crop&crop=center',
    ],
    category: 'Furniture',
    subcategory: 'Living Room',
    rating: 4.7,
    reviewCount: 412,
    stock: 15,
    tags: ['bestseller'],
    specifications: new Map([
      ['Dimensions', '220cm x 90cm x 85cm'],
      ['Material', 'Velvet & Solid Wood'],
      ['Seating Capacity', '3 persons'],
      ['Weight Capacity', '300kg'],
      ['Warranty', '2 years'],
    ]),
    discount: 10,
    isNewProduct: false,
    isFeatured: true,
    isActive: true,
    viewCount: 4200,
    isSellerFavorite: true,
    trendingScore: 88,
    lastViewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },

  {
    name: 'Minimalist Wooden Dining Table',
    description:
      'Solid oak dining table with a clean minimalist design. Seats up to 6 people comfortably. Scratch-resistant finish and easy to clean surface.',
    price: 185000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&h=800&fit=crop&crop=center',
    ],
    category: 'Furniture',
    subcategory: 'Dining Room',
    rating: 4.6,
    reviewCount: 289,
    stock: 20,
    tags: ['bestseller'],
    specifications: new Map([
      ['Dimensions', '180cm x 90cm x 76cm'],
      ['Material', 'Solid Oak'],
      ['Seating Capacity', '6 persons'],
      ['Finish', 'Matte Lacquer'],
      ['Warranty', '3 years'],
    ]),
    discount: 5,
    isNewProduct: false,
    isFeatured: true,
    isActive: true,
    viewCount: 3100,
    isSellerFavorite: true,
    trendingScore: 74,
    lastViewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },

  {
    name: 'Floating Wall Shelves Set of 3',
    description:
      'Modern floating wall shelves crafted from solid pine wood. Easy to install with hidden brackets. Perfect for displaying books, plants, and decor.',
    price: 28000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop&crop=center',
    ],
    category: 'Furniture',
    subcategory: 'Storage',
    rating: 4.5,
    reviewCount: 634,
    stock: 80,
    tags: ['bestseller'],
    specifications: new Map([
      ['Dimensions', '60cm x 20cm x 3cm each'],
      ['Material', 'Solid Pine'],
      ['Weight Capacity', '15kg per shelf'],
      ['Finish', 'Natural Wood'],
      ['Includes', 'Mounting hardware'],
    ]),
    discount: 0,
    isNewProduct: true,
    isFeatured: false,
    isActive: true,
    viewCount: 5800,
    isSellerFavorite: false,
    trendingScore: 92,
    lastViewedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },

  {
    name: 'King Size Platform Bed Frame',
    description:
      'Contemporary king size platform bed frame with upholstered headboard. No box spring needed. Features under-bed storage space and sturdy slat support.',
    price: 275000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=800&fit=crop&crop=center',
    ],
    category: 'Furniture',
    subcategory: 'Bedroom',
    rating: 4.8,
    reviewCount: 521,
    stock: 10,
    tags: ['bestseller'],
    specifications: new Map([
      ['Size', 'King (180cm x 200cm)'],
      ['Material', 'Engineered Wood & Fabric'],
      ['Headboard Height', '120cm'],
      ['Weight Capacity', '400kg'],
      ['Warranty', '2 years'],
    ]),
    discount: 15,
    isNewProduct: false,
    isFeatured: true,
    isActive: true,
    viewCount: 6700,
    isSellerFavorite: true,
    trendingScore: 110,
    lastViewedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },

  // ── Bestsellers only (non-Furniture) ────────────────────────────────────────

  {
    name: 'Stainless Steel Cookware Set 10-Piece',
    description:
      'Professional-grade stainless steel cookware set including pots, pans, and lids. Tri-ply construction for even heat distribution. Dishwasher safe and oven safe up to 260°C.',
    price: 95000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1584990347449-a2d4c2c044c9?w=800&h=800&fit=crop&crop=center',
    ],
    category: 'Kitchen',
    subcategory: 'Cookware',
    rating: 4.8,
    reviewCount: 1876,
    stock: 55,
    tags: ['bestseller'],
    specifications: new Map([
      ['Pieces', '10'],
      ['Material', '18/10 Stainless Steel'],
      ['Compatible', 'All stovetops including induction'],
      ['Oven Safe', 'Up to 260°C'],
      ['Dishwasher Safe', 'Yes'],
    ]),
    discount: 20,
    isNewProduct: false,
    isFeatured: true,
    isActive: true,
    viewCount: 9200,
    isSellerFavorite: true,
    trendingScore: 145,
    lastViewedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },

  // ── Top Rated (rating >= 4.5) + Bestsellers ──────────────────────────────────

  {
    name: 'Premium Leather Wallet Slim',
    description:
      'Handcrafted genuine leather slim wallet with RFID blocking technology. Holds up to 8 cards and cash. Available in classic brown and black.',
    price: 18500,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop&crop=center',
    ],
    category: 'Fashion',
    subcategory: 'Accessories',
    rating: 4.9,
    reviewCount: 2341,
    stock: 120,
    tags: ['bestseller'],
    specifications: new Map([
      ['Material', 'Genuine Leather'],
      ['Card Slots', '8'],
      ['RFID Blocking', 'Yes'],
      ['Dimensions', '11cm x 8.5cm x 0.8cm'],
      ['Colors', 'Brown, Black'],
    ]),
    discount: 0,
    isNewProduct: false,
    isFeatured: true,
    isActive: true,
    viewCount: 11500,
    isSellerFavorite: true,
    trendingScore: 160,
    lastViewedAt: new Date(Date.now() - 30 * 60 * 1000),
  },

  {
    name: 'Ceramic Pour-Over Coffee Set',
    description:
      'Artisan ceramic pour-over coffee dripper with matching carafe and two mugs. Brews a clean, flavorful cup. Microwave and dishwasher safe.',
    price: 22000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=800&fit=crop&crop=center',
    ],
    category: 'Kitchen',
    subcategory: 'Coffee & Tea',
    rating: 4.7,
    reviewCount: 987,
    stock: 65,
    tags: ['bestseller'],
    specifications: new Map([
      ['Material', 'Ceramic'],
      ['Capacity', '600ml carafe'],
      ['Includes', 'Dripper, carafe, 2 mugs, filters'],
      ['Microwave Safe', 'Yes'],
      ['Dishwasher Safe', 'Yes'],
    ]),
    discount: 8,
    isNewProduct: true,
    isFeatured: false,
    isActive: true,
    viewCount: 4500,
    isSellerFavorite: false,
    trendingScore: 78,
    lastViewedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },

  {
    name: 'Bamboo Bathroom Organizer Set',
    description:
      'Eco-friendly bamboo bathroom organizer with soap dispenser, toothbrush holder, cup, and tray. Water-resistant finish. Adds a natural spa-like feel to any bathroom.',
    price: 14500,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1620626011761-996317702519?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=800&fit=crop&crop=center',
    ],
    category: 'Home & Garden',
    subcategory: 'Bathroom',
    rating: 4.6,
    reviewCount: 743,
    stock: 90,
    tags: ['bestseller'],
    specifications: new Map([
      ['Material', 'Natural Bamboo'],
      ['Pieces', '4 (dispenser, holder, cup, tray)'],
      ['Finish', 'Water-resistant lacquer'],
      ['Eco-Friendly', 'Yes'],
      ['Dimensions', 'Tray: 30cm x 10cm'],
    ]),
    discount: 5,
    isNewProduct: false,
    isFeatured: false,
    isActive: true,
    viewCount: 3800,
    isSellerFavorite: false,
    trendingScore: 65,
    lastViewedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },

  // ── Customer Favorites only (rating >= 4.0, not already covered above) ──────

  {
    name: 'Portable Bluetooth Speaker Waterproof',
    description:
      'Compact waterproof Bluetooth speaker with 360° surround sound and 20-hour battery life. IPX7 rated, perfect for outdoor use. Pairs with two devices simultaneously.',
    price: 38000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&h=800&fit=crop&crop=center',
    ],
    category: 'Electronics',
    subcategory: 'Audio',
    rating: 4.4,
    reviewCount: 1562,
    stock: 75,
    tags: ['trending'],
    specifications: new Map([
      ['Battery Life', '20 hours'],
      ['Waterproof Rating', 'IPX7'],
      ['Connectivity', 'Bluetooth 5.0'],
      ['Output Power', '20W'],
      ['Weight', '540g'],
    ]),
    discount: 12,
    isNewProduct: false,
    isFeatured: false,
    isActive: true,
    viewCount: 7300,
    isSellerFavorite: false,
    trendingScore: 98,
    lastViewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },

  {
    name: 'Adjustable Laptop Stand Aluminum',
    description:
      'Ergonomic aluminum laptop stand with 6 adjustable height levels. Foldable and portable. Compatible with laptops 10–17 inches. Improves posture and reduces neck strain.',
    price: 16500,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=800&fit=crop&crop=center',
    ],
    category: 'Electronics',
    subcategory: 'Accessories',
    rating: 4.3,
    reviewCount: 2108,
    stock: 140,
    tags: ['trending'],
    specifications: new Map([
      ['Material', 'Aluminum Alloy'],
      ['Height Levels', '6'],
      ['Compatible', '10–17 inch laptops'],
      ['Weight Capacity', '10kg'],
      ['Foldable', 'Yes'],
    ]),
    discount: 0,
    isNewProduct: true,
    isFeatured: false,
    isActive: true,
    viewCount: 6100,
    isSellerFavorite: false,
    trendingScore: 85,
    lastViewedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
];

async function seedCollectionProducts() {
  try {
    console.log('🚀 Seeding collection products...\n');
    await connectDatabase();
    console.log('✅ Connected to database\n');

    // Find or create a supplier
    let supplier = await Supplier.findOne({ name: 'Demo Supplier' });
    if (!supplier) {
      supplier = new Supplier({
        name: 'Demo Supplier',
        email: 'demo@supplier.com',
        phone: '+234 123 456 7890',
        address: 'Lagos, Nigeria',
        businessType: 'Manufacturer',
        verified: true,
        rating: 4.7,
        totalOrders: 1250,
        responseTime: '2 hours',
        isActive: true,
      });
      await supplier.save();
      console.log('Created demo supplier');
    }

    let created = 0;
    let skipped = 0;

    for (const productData of newProducts) {
      const exists = await Product.findOne({ name: productData.name });
      if (exists) {
        console.log(`⏭️  Skipped (exists): ${productData.name}`);
        skipped++;
        continue;
      }

      await Product.create({ ...productData, supplierId: supplier._id });
      console.log(`✅ Created: ${productData.name}`);
      created++;
    }

    console.log(`\n🎉 Done! Created: ${created}, Skipped: ${skipped}`);
    console.log('\nCollection coverage:');
    console.log('  Home & Living  (Furniture category) → 4 products');
    console.log('  Bestsellers    (tag: bestseller)    → 8 products (some shared)');
    console.log('  Top Rated      (rating >= 4.5)      → 8 products (some shared)');
    console.log('  Customer Favs  (rating >= 4.0)      → all 10 products qualify');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

if (require.main === module) {
  seedCollectionProducts();
}

export default seedCollectionProducts;
