import mongoose from 'mongoose';
import Product from '../models/Product';
import Supplier from '../models/Supplier';

const demoProducts = [
  {
    name: 'Smart Fitness Watch Series 7',
    description: 'Track your health and fitness goals with this advanced smartwatch. Features heart rate monitoring, GPS tracking, sleep analysis, and 7-day battery life.',
    price: 85000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&h=800&fit=crop&crop=center'
    ],
    category: 'Electronics',
    subcategory: 'Wearables',
    rating: 4.5,
    reviewCount: 892,
    stock: 32,
    tags: ['smartwatch', 'fitness', 'health', 'gps'],
    specifications: new Map([
      ['Display', '1.9" AMOLED'],
      ['Battery Life', '7 days'],
      ['Water Resistance', '5ATM'],
      ['Sensors', 'Heart Rate, GPS, Accelerometer'],
      ['Compatibility', 'iOS & Android']
    ]),
    discount: 15,
    isNewProduct: true,
    isFeatured: true,
    isActive: true,
    // Enhanced discovery fields
    viewCount: Math.floor(Math.random() * 5000) + 1000, // 1000-6000 views
    isSellerFavorite: true,
    trendingScore: Math.floor(Math.random() * 100) + 50, // 50-150 trending score
    lastViewedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) // Within last 7 days
  },
  {
    name: 'Professional Camera Lens 85mm f/1.4',
    description: 'Capture stunning portraits with this professional-grade camera lens. Features ultra-fast f/1.4 aperture, premium glass elements, and weather sealing.',
    price: 450000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=800&fit=crop&crop=center'
    ],
    category: 'Electronics',
    subcategory: 'Photography',
    rating: 4.9,
    reviewCount: 324,
    stock: 12,
    tags: ['camera', 'lens', 'photography', 'professional'],
    specifications: new Map([
      ['Focal Length', '85mm'],
      ['Aperture', 'f/1.4 - f/16'],
      ['Mount', 'Canon EF'],
      ['Weight', '950g'],
      ['Weather Sealing', 'Yes']
    ]),
    discount: 0,
    isNewProduct: false,
    isFeatured: true,
    isActive: true,
    // Enhanced discovery fields
    viewCount: Math.floor(Math.random() * 3000) + 500, // 500-3500 views
    isSellerFavorite: false,
    trendingScore: Math.floor(Math.random() * 80) + 20, // 20-100 trending score
    lastViewedAt: new Date(Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000)) // Within last 3 days
  },
  {
    name: 'Ergonomic Office Chair Premium',
    description: 'Enhance your workspace comfort with this premium ergonomic office chair. Features lumbar support, adjustable height, and breathable mesh design.',
    price: 180000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1549497538-303791108f95?w=800&h=800&fit=crop&crop=center'
    ],
    category: 'Furniture',
    subcategory: 'Office',
    rating: 4.4,
    reviewCount: 567,
    stock: 28,
    tags: ['office', 'chair', 'ergonomic', 'furniture'],
    specifications: new Map([
      ['Material', 'Mesh & Leather'],
      ['Weight Capacity', '150kg'],
      ['Height Adjustment', '42-52cm'],
      ['Armrests', 'Adjustable'],
      ['Warranty', '3 years']
    ]),
    discount: 10,
    isNewProduct: false,
    isFeatured: false,
    isActive: true,
    // Enhanced discovery fields
    viewCount: Math.floor(Math.random() * 2000) + 200, // 200-2200 views
    isSellerFavorite: true,
    trendingScore: Math.floor(Math.random() * 60) + 10, // 10-70 trending score
    lastViewedAt: new Date(Date.now() - Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000)) // Within last 5 days
  },
  // Add more products with enhanced discovery fields
  {
    name: 'Wireless Bluetooth Headphones Pro',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life and superior sound quality.',
    price: 65000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop&crop=center'
    ],
    category: 'Electronics',
    subcategory: 'Audio',
    rating: 4.6,
    reviewCount: 1234,
    stock: 45,
    tags: ['headphones', 'wireless', 'bluetooth', 'noise-cancelling'],
    specifications: new Map([
      ['Battery Life', '30 hours'],
      ['Connectivity', 'Bluetooth 5.0'],
      ['Noise Cancellation', 'Active'],
      ['Weight', '250g'],
      ['Warranty', '2 years']
    ]),
    discount: 20,
    isNewProduct: true,
    isFeatured: true,
    isActive: true,
    viewCount: Math.floor(Math.random() * 8000) + 2000, // 2000-10000 views (trending)
    isSellerFavorite: true,
    trendingScore: Math.floor(Math.random() * 50) + 100, // 100-150 trending score (high)
    lastViewedAt: new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)) // Within last day
  },
  {
    name: 'Gaming Mechanical Keyboard RGB',
    description: 'High-performance mechanical gaming keyboard with customizable RGB lighting and tactile switches.',
    price: 45000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&h=800&fit=crop&crop=center'
    ],
    category: 'Electronics',
    subcategory: 'Gaming',
    rating: 4.3,
    reviewCount: 678,
    stock: 23,
    tags: ['keyboard', 'gaming', 'mechanical', 'rgb'],
    specifications: new Map([
      ['Switch Type', 'Cherry MX Blue'],
      ['Backlighting', 'RGB'],
      ['Layout', 'Full Size'],
      ['Connection', 'USB-C'],
      ['Warranty', '1 year']
    ]),
    discount: 0,
    isNewProduct: false,
    isFeatured: false,
    isActive: true,
    viewCount: Math.floor(Math.random() * 1500) + 300, // 300-1800 views
    isSellerFavorite: false,
    trendingScore: Math.floor(Math.random() * 40) + 15, // 15-55 trending score
    lastViewedAt: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)) // Within last 10 days
  }
];

async function seedDemoProducts() {
  try {
    // Use MongoDB URI from environment or Atlas as fallback
    const mongoUri = process.env.MONGODB_URI || 'mongodb://Nelson:NELSON2005@ac-e3a4d1f-shard-00-00.pg9c7ou.mongodb.net:27017,ac-e3a4d1f-shard-00-01.pg9c7ou.mongodb.net:27017,ac-e3a4d1f-shard-00-02.pg9c7ou.mongodb.net:27017/afrochinatrade?ssl=true&authSource=admin&retryWrites=true&w=majority';
    
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find or create a default supplier
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
        isActive: true
      });
      await supplier.save();
      console.log('Created demo supplier');
    }

    // Add supplier ID to products and create them
    for (const productData of demoProducts) {
      const existingProduct = await Product.findOne({ name: productData.name });
      if (!existingProduct) {
        const product = new Product({
          ...productData,
          supplierId: supplier._id
        });
        await product.save();
        console.log(`Created product: ${product.name} (Views: ${product.viewCount}, Trending: ${product.trendingScore})`);
      } else {
        // Update existing products with new discovery fields if they don't have them
        const updateData: any = {};
        if (existingProduct.viewCount === undefined) updateData.viewCount = productData.viewCount;
        if (existingProduct.isSellerFavorite === undefined) updateData.isSellerFavorite = productData.isSellerFavorite;
        if (existingProduct.trendingScore === undefined) updateData.trendingScore = productData.trendingScore;
        if (existingProduct.lastViewedAt === undefined) updateData.lastViewedAt = productData.lastViewedAt;
        
        if (Object.keys(updateData).length > 0) {
          await Product.findByIdAndUpdate(existingProduct._id, updateData);
          console.log(`Updated product with discovery fields: ${productData.name}`);
        } else {
          console.log(`Product already exists with discovery fields: ${productData.name}`);
        }
      }
    }

    // Update any existing products that don't have the new discovery fields
    const productsWithoutDiscoveryFields = await Product.find({
      $or: [
        { viewCount: { $exists: false } },
        { isSellerFavorite: { $exists: false } },
        { trendingScore: { $exists: false } }
      ]
    });

    for (const product of productsWithoutDiscoveryFields) {
      const updateData: any = {};
      if (product.viewCount === undefined) updateData.viewCount = Math.floor(Math.random() * 1000) + 50;
      if (product.isSellerFavorite === undefined) updateData.isSellerFavorite = Math.random() > 0.7; // 30% chance
      if (product.trendingScore === undefined) updateData.trendingScore = Math.floor(Math.random() * 50) + 10;
      if (product.lastViewedAt === undefined) {
        updateData.lastViewedAt = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)); // Within last 30 days
      }
      
      await Product.findByIdAndUpdate(product._id, updateData);
      console.log(`Updated existing product with discovery fields: ${product.name}`);
    }

    console.log('Demo products seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo products:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDemoProducts();