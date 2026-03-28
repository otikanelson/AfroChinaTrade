import mongoose from 'mongoose';
import Product from '../models/Product';
import Supplier from '../models/Supplier';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';

// Load environment variables
dotenv.config();

const categoryProducts = [
  // AUTOMOTIVE PRODUCTS (2)
  {
    name: 'Premium Car Dashboard Camera 4K',
    description: 'Advanced 4K dashboard camera with night vision, GPS tracking, and collision detection. Features loop recording, G-sensor, and mobile app connectivity for real-time monitoring and footage download.',
    price: 125000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=800&fit=crop&crop=center'
    ],
    category: 'Automotive',
    subcategory: 'Electronics & Accessories',
    rating: 4.7,
    reviewCount: 456,
    stock: 18,
    tags: ['dashcam', 'car camera', '4k', 'gps', 'night vision', 'automotive'],
    specifications: new Map([
      ['Video Resolution', '4K Ultra HD (3840x2160)'],
      ['Night Vision', 'Advanced infrared technology'],
      ['Storage', 'Supports up to 256GB microSD'],
      ['GPS', 'Built-in GPS with speed tracking'],
      ['G-Sensor', '3-axis accelerometer'],
      ['Screen Size', '3.0 inch IPS display'],
      ['Loop Recording', 'Yes, with seamless overwrite'],
      ['Mobile App', 'iOS & Android compatible'],
      ['Operating Temperature', '-10°C to 60°C'],
      ['Warranty', '2 years manufacturer warranty']
    ]),
    policies: {
      paymentPolicy: 'Full payment required before shipping. Accepts bank transfer, card payments, and mobile money.',
      shippingPolicy: 'Free shipping within Lagos. ₦2,500 shipping fee for other states. Delivery within 3-5 business days.',
      refundPolicy: '30-day return policy. Product must be in original condition with all accessories.',
      guidelines: 'Professional installation recommended. Ensure proper positioning for optimal recording angle.',
      suggestions: 'Use high-speed microSD card (Class 10 or higher) for best performance. Regular firmware updates available.'
    },
    discount: 12,
    isNewProduct: true,
    isFeatured: true,
    isActive: true,
    viewCount: Math.floor(Math.random() * 3000) + 800,
    isSellerFavorite: true,
    trendingScore: Math.floor(Math.random() * 40) + 80,
    lastViewedAt: new Date(Date.now() - Math.floor(Math.random() * 2 * 24 * 60 * 60 * 1000))
  },
  {
    name: 'Professional Car Detailing Kit Complete',
    description: 'Complete professional-grade car detailing kit with premium microfiber cloths, car shampoo, wax, tire shine, interior cleaner, and detailing brushes. Everything needed for showroom-quality car care.',
    price: 45000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1562141961-d80459d0c5b8?w=800&h=800&fit=crop&crop=center'
    ],
    category: 'Automotive',
    subcategory: 'Car Care & Maintenance',
    rating: 4.5,
    reviewCount: 234,
    stock: 35,
    tags: ['car detailing', 'car care', 'cleaning kit', 'wax', 'automotive maintenance'],
    specifications: new Map([
      ['Kit Contents', '15-piece complete detailing set'],
      ['Microfiber Cloths', '6 premium grade cloths (different sizes)'],
      ['Car Shampoo', '500ml pH-balanced formula'],
      ['Car Wax', '250ml premium carnauba wax'],
      ['Tire Shine', '300ml long-lasting formula'],
      ['Interior Cleaner', '400ml multi-surface cleaner'],
      ['Detailing Brushes', '3 different sizes for various surfaces'],
      ['Applicator Pads', '4 foam applicators'],
      ['Storage Case', 'Organized carrying case included'],
      ['Suitable For', 'All vehicle types and paint finishes']
    ]),
    policies: {
      paymentPolicy: 'Payment on delivery available within Lagos. Other locations require advance payment.',
      shippingPolicy: 'Free delivery within Lagos mainland. ₦1,500 shipping to other areas.',
      refundPolicy: '14-day return policy. Unused products only with original packaging.',
      guidelines: 'Test products on small area first. Use in shaded area, not under direct sunlight.',
      suggestions: 'Regular use maintains vehicle appearance and value. Follow included instruction manual for best results.'
    },
    discount: 8,
    isNewProduct: false,
    isFeatured: false,
    isActive: true,
    viewCount: Math.floor(Math.random() * 1500) + 300,
    isSellerFavorite: false,
    trendingScore: Math.floor(Math.random() * 30) + 25,
    lastViewedAt: new Date(Date.now() - Math.floor(Math.random() * 5 * 24 * 60 * 60 * 1000))
  },

  // BOOKS AND MEDIA PRODUCTS (2)
  {
    name: 'The Psychology of Money - Financial Wisdom Book',
    description: 'Bestselling book by Morgan Housel exploring the psychology behind financial decisions. Learn timeless lessons on wealth, greed, and happiness through engaging stories and practical insights for better money management.',
    price: 8500,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&h=800&fit=crop&crop=center'
    ],
    category: 'Books and Media',
    subcategory: 'Business & Finance',
    rating: 4.8,
    reviewCount: 892,
    stock: 67,
    tags: ['finance book', 'psychology', 'money management', 'bestseller', 'personal finance'],
    specifications: new Map([
      ['Author', 'Morgan Housel'],
      ['Publisher', 'Harriman House'],
      ['Pages', '256 pages'],
      ['Language', 'English'],
      ['Format', 'Paperback'],
      ['ISBN', '978-0857197689'],
      ['Dimensions', '19.8 x 12.9 x 2.0 cm'],
      ['Publication Date', 'September 2020'],
      ['Genre', 'Personal Finance, Psychology'],
      ['Reading Level', 'Intermediate to Advanced']
    ]),
    policies: {
      paymentPolicy: 'Pay on delivery available. Online payment gets 5% discount.',
      shippingPolicy: 'Free shipping nationwide for orders above ₦5,000. Standard delivery 2-4 days.',
      refundPolicy: '7-day return policy for damaged books only. No returns for read books.',
      guidelines: 'Handle with care. Keep away from moisture and direct sunlight.',
      suggestions: 'Perfect for entrepreneurs, investors, and anyone interested in financial psychology. Great gift for graduates.'
    },
    discount: 15,
    isNewProduct: false,
    isFeatured: true,
    isActive: true,
    viewCount: Math.floor(Math.random() * 4000) + 1200,
    isSellerFavorite: true,
    trendingScore: Math.floor(Math.random() * 50) + 70,
    lastViewedAt: new Date(Date.now() - Math.floor(Math.random() * 1 * 24 * 60 * 60 * 1000))
  },
  {
    name: 'Premium Vinyl Record Collection - Classic Jazz',
    description: 'Curated collection of 5 classic jazz vinyl records featuring Miles Davis, John Coltrane, and other legends. High-quality 180g vinyl pressings with original artwork and liner notes. Perfect for audiophiles and collectors.',
    price: 75000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=800&h=800&fit=crop&crop=center'
    ],
    category: 'Books and Media',
    subcategory: 'Music & Audio',
    rating: 4.9,
    reviewCount: 156,
    stock: 12,
    tags: ['vinyl records', 'jazz music', 'collectibles', 'audiophile', 'vintage music'],
    specifications: new Map([
      ['Collection Size', '5 vinyl records'],
      ['Artists', 'Miles Davis, John Coltrane, Bill Evans, Art Blakey, Thelonious Monk'],
      ['Vinyl Weight', '180g high-quality pressing'],
      ['Speed', '33⅓ RPM'],
      ['Size', '12-inch LP format'],
      ['Condition', 'Brand new, sealed'],
      ['Packaging', 'Original gatefold sleeves with liner notes'],
      ['Audio Quality', 'Audiophile grade mastering'],
      ['Era', 'Classic recordings from 1950s-1960s'],
      ['Total Runtime', 'Approximately 4 hours of music']
    ]),
    policies: {
      paymentPolicy: 'Full payment required due to limited stock. Bank transfer or secure online payment.',
      shippingPolicy: 'Careful packaging with bubble wrap. ₦3,000 shipping fee. Insured delivery.',
      refundPolicy: '3-day return policy for damaged items only. Must be unopened for full refund.',
      guidelines: 'Handle records by edges only. Store vertically in cool, dry place.',
      suggestions: 'Requires turntable for playback. Clean stylus recommended for optimal sound quality.'
    },
    discount: 0,
    isNewProduct: true,
    isFeatured: true,
    isActive: true,
    viewCount: Math.floor(Math.random() * 800) + 200,
    isSellerFavorite: true,
    trendingScore: Math.floor(Math.random() * 35) + 45,
    lastViewedAt: new Date(Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000))
  },

  // FASHION PRODUCTS (2)
  {
    name: 'Designer Leather Handbag - Premium Collection',
    description: 'Elegant genuine leather handbag crafted from premium Italian leather. Features multiple compartments, adjustable shoulder strap, and gold-tone hardware. Perfect for professional and casual occasions.',
    price: 95000,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=800&fit=crop&crop=center'
    ],
    category: 'Fashion',
    subcategory: 'Bags & Accessories',
    rating: 4.6,
    reviewCount: 324,
    stock: 28,
    tags: ['leather handbag', 'designer bag', 'women fashion', 'luxury accessories', 'italian leather'],
    specifications: new Map([
      ['Material', '100% Genuine Italian Leather'],
      ['Dimensions', '32cm x 25cm x 12cm'],
      ['Weight', '850g'],
      ['Compartments', 'Main compartment + 2 interior pockets + 1 zippered pocket'],
      ['Strap', 'Adjustable shoulder strap (70-120cm)'],
      ['Hardware', 'Gold-tone metal fittings'],
      ['Closure', 'Magnetic snap closure'],
      ['Lining', 'Premium fabric lining'],
      ['Colors Available', 'Black, Brown, Burgundy'],
      ['Care Instructions', 'Clean with leather conditioner, avoid water']
    ]),
    policies: {
      paymentPolicy: 'Installment payment available (50% upfront, 50% on delivery). Full payment gets 3% discount.',
      shippingPolicy: 'Free shipping nationwide. Express delivery available for ₦2,000 extra.',
      refundPolicy: '14-day return policy. Must be unused with original packaging and dust bag.',
      guidelines: 'Avoid exposure to direct sunlight and moisture. Use leather conditioner monthly.',
      suggestions: 'Perfect for office, dinner dates, and special occasions. Matches well with both formal and casual outfits.'
    },
    discount: 20,
    isNewProduct: false,
    isFeatured: true,
    isActive: true,
    viewCount: Math.floor(Math.random() * 2500) + 600,
    isSellerFavorite: true,
    trendingScore: Math.floor(Math.random() * 45) + 55,
    lastViewedAt: new Date(Date.now() - Math.floor(Math.random() * 2 * 24 * 60 * 60 * 1000))
  },
  {
    name: 'Premium Cotton Polo Shirt - Classic Fit',
    description: 'High-quality 100% cotton polo shirt with classic fit and timeless design. Features reinforced collar, mother-of-pearl buttons, and pre-shrunk fabric. Available in multiple colors for versatile styling.',
    price: 18500,
    currency: 'NGN',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1622445275576-721325763afe?w=800&h=800&fit=crop&crop=center'
    ],
    category: 'Fashion',
    subcategory: 'Men\'s Clothing',
    rating: 4.4,
    reviewCount: 567,
    stock: 45,
    tags: ['polo shirt', 'cotton shirt', 'men fashion', 'casual wear', 'classic fit'],
    specifications: new Map([
      ['Material', '100% Premium Cotton'],
      ['Fit', 'Classic Regular Fit'],
      ['Collar', 'Reinforced ribbed collar'],
      ['Buttons', 'Mother-of-pearl 2-button placket'],
      ['Sleeves', 'Short sleeves with ribbed cuffs'],
      ['Sizes Available', 'S, M, L, XL, XXL'],
      ['Colors', 'Navy, White, Black, Grey, Burgundy'],
      ['Care Instructions', 'Machine wash cold, tumble dry low'],
      ['Pre-shrunk', 'Yes, minimal shrinkage'],
      ['Origin', 'Made in Nigeria with imported cotton']
    ]),
    policies: {
      paymentPolicy: 'Pay on delivery available within Lagos. Other areas require advance payment.',
      shippingPolicy: 'Free shipping for orders above ₦15,000. Standard shipping ₦1,200.',
      refundPolicy: '7-day exchange policy for size issues. 14-day return for defects.',
      guidelines: 'Check size chart before ordering. Wash in cold water to maintain color and fit.',
      suggestions: 'Perfect for casual Fridays, weekend outings, and smart-casual events. Pairs well with chinos or jeans.'
    },
    discount: 10,
    isNewProduct: false,
    isFeatured: false,
    isActive: true,
    viewCount: Math.floor(Math.random() * 1800) + 400,
    isSellerFavorite: false,
    trendingScore: Math.floor(Math.random() * 35) + 20,
    lastViewedAt: new Date(Date.now() - Math.floor(Math.random() * 4 * 24 * 60 * 60 * 1000))
  }
];

async function seedCategoryProducts() {
  try {
    console.log('🚀 Starting category products seeding...');
    console.log('=====================================');

    // Find or create suppliers for each category
    const suppliers = {
      automotive: await findOrCreateSupplier('AutoTech Solutions', 'autotech@supplier.com', 'Automotive parts and accessories specialist'),
      books: await findOrCreateSupplier('BookWorld Nigeria', 'books@supplier.com', 'Books, media, and educational materials'),
      fashion: await findOrCreateSupplier('Fashion Forward Ltd', 'fashion@supplier.com', 'Premium fashion and accessories')
    };

    // Create products with appropriate suppliers
    for (const productData of categoryProducts) {
      const existingProduct = await Product.findOne({ name: productData.name });
      if (!existingProduct) {
        let supplierId;
        
        // Assign supplier based on category
        switch (productData.category) {
          case 'Automotive':
            supplierId = suppliers.automotive._id;
            break;
          case 'Books and Media':
            supplierId = suppliers.books._id;
            break;
          case 'Fashion':
            supplierId = suppliers.fashion._id;
            break;
          default:
            supplierId = suppliers.automotive._id; // fallback
        }

        const product = new Product({
          ...productData,
          supplierId
        });
        
        await product.save();
        console.log(`✅ Created ${productData.category} product: ${product.name}`);
        console.log(`   Price: ₦${product.price.toLocaleString()}, Stock: ${product.stock}, Rating: ${product.rating}`);
      } else {
        console.log(`⚠️  Product already exists: ${productData.name}`);
      }
    }

    console.log('\n🎉 Category products seeded successfully!');
    console.log('📊 Summary:');
    console.log('   - Automotive: 2 products');
    console.log('   - Books and Media: 2 products');
    console.log('   - Fashion: 2 products');
    console.log('   - Total: 6 new products added');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding category products:', error);
    process.exit(1);
  }
}

async function findOrCreateSupplier(name: string, email: string, description: string) {
  let supplier = await Supplier.findOne({ name });
  if (!supplier) {
    supplier = new Supplier({
      name,
      email,
      phone: '+234 ' + Math.floor(Math.random() * 900000000 + 100000000),
      address: 'Lagos, Nigeria',
      location: 'Lagos, Nigeria',
      verified: true,
      rating: 4.5 + Math.random() * 0.5, // 4.5-5.0 rating
      reviewCount: Math.floor(Math.random() * 500) + 100,
      responseTime: Math.random() > 0.5 ? '2 hours' : '4 hours'
    });
    await supplier.save();
    console.log(`📦 Created supplier: ${supplier.name}`);
  }
  return supplier;
}

// Run the seeding function
if (require.main === module) {
  const runSeeding = async () => {
    try {
      await connectDatabase();
      await seedCategoryProducts();
    } catch (error) {
      console.error('💥 Category products seeding failed:', error);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      process.exit(0);
    }
  };

  runSeeding();
}