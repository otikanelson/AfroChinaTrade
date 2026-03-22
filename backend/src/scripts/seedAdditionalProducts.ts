import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product';
import Supplier from '../models/Supplier';

// Load environment variables
dotenv.config();

const additionalProducts = [
  {
    name: 'Wireless Gaming Headset Pro',
    description: 'Immerse yourself in gaming with this premium wireless headset. Features 7.1 surround sound, noise cancellation, RGB lighting, and 20-hour battery life.',
    price: 95000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1599669454699-248893623440?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop&crop=center'
    ],
    category: 'Electronics',
    subcategory: 'Gaming',
    rating: 4.6,
    reviewCount: 1247,
    stock: 45,
    tags: ['gaming', 'headset', 'wireless', 'rgb', 'surround sound'],
    specifications: new Map([
      ['Driver Size', '50mm'],
      ['Frequency Response', '20Hz - 20kHz'],
      ['Battery Life', '20 hours'],
      ['Connectivity', 'Wireless 2.4GHz + Bluetooth'],
      ['Microphone', 'Detachable boom mic'],
      ['RGB Lighting', 'Customizable']
    ]),
    discount: 20,
    isNewProduct: true,
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Minimalist Desk Organizer Set',
    description: 'Keep your workspace tidy with this elegant bamboo desk organizer set. Includes pen holders, document trays, and cable management solutions.',
    price: 35000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop&crop=center'
    ],
    category: 'Office Supplies',
    subcategory: 'Organization',
    rating: 4.3,
    reviewCount: 689,
    stock: 78,
    tags: ['desk', 'organizer', 'bamboo', 'minimalist', 'office'],
    specifications: new Map([
      ['Material', 'Sustainable Bamboo'],
      ['Dimensions', '30cm x 20cm x 15cm'],
      ['Weight', '1.2kg'],
      ['Finish', 'Natural Wood'],
      ['Components', '5-piece set'],
      ['Care', 'Wipe clean with damp cloth']
    ]),
    discount: 5,
    isNewProduct: false,
    isFeatured: false,
    isActive: true
  }
];

async function seedAdditionalProducts() {
  try {
    // Use MongoDB URI from environment (Atlas connection)
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    console.log('Using MongoDB URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in log
    
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
        address: '123 Business District, Victoria Island',
        location: 'Lagos, Nigeria',
        verified: true,
        rating: 4.7,
        reviewCount: 1250,
        responseTime: '2 hours'
      });
      await supplier.save();
      console.log('Created demo supplier');
    }

    // Add supplier ID to products and create them
    for (const productData of additionalProducts) {
      const existingProduct = await Product.findOne({ name: productData.name });
      if (!existingProduct) {
        const product = new Product({
          ...productData,
          supplierId: supplier._id
        });
        await product.save();
        console.log(`✅ Created product: ${product.name}`);
      } else {
        console.log(`⚠️  Product already exists: ${productData.name}`);
      }
    }

    console.log('🎉 Additional products seeded successfully!');
    console.log(`📦 Added ${additionalProducts.length} new products to the database`);
    
    // Display summary
    console.log('\n📋 Products Summary:');
    additionalProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - ₦${product.price.toLocaleString()}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding additional products:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedAdditionalProducts();