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
    isActive: true
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
    isActive: true
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
    isActive: true
  }
];

async function seedDemoProducts() {
  try {
    // Use MongoDB URI from environment or default
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/afrochinatrade';
    
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
        console.log(`Created product: ${product.name}`);
      } else {
        console.log(`Product already exists: ${productData.name}`);
      }
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