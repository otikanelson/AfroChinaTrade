import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product';
import Category from '../models/Category';
import Supplier from '../models/Supplier';
import { connectDatabase } from '../config/database';
import { validateEnvironment } from '../config/validateEnv';

// Load environment variables
dotenv.config();

// Validate environment variables
validateEnvironment();

async function seedDetailedProduct() {
  try {
    console.log('🌱 Starting detailed product seeding...');
    
    // Connect to database
    await connectDatabase();
    console.log('✅ Connected to database');

    // First, ensure we have a category and supplier
    let category = await Category.findOne({ name: 'Electronics' });
    if (!category) {
      category = await Category.create({
        name: 'Electronics',
        icon: 'phone-portrait-outline',
        subcategories: ['Smartphones', 'Laptops', 'Tablets', 'Accessories']
      });
      console.log('✅ Created Electronics category');
    } else {
      console.log('✅ Using existing Electronics category');
    }

    // Find or use existing supplier
    let supplier = await Supplier.findOne({ email: 'contact@techcorp.com' });
    if (!supplier) {
      supplier = await Supplier.findOne(); // Use any existing supplier
      if (!supplier) {
        supplier = await Supplier.create({
          name: 'TechCorp Solutions',
          email: 'contact@techcorp.com',
          phone: '+1-555-0123',
          address: '123 Tech Street, San Francisco, CA 94105, USA',
          verified: true,
          rating: 4.8,
          location: 'San Francisco, CA',
          responseTime: '2-4 hours',
        });
        console.log('✅ Created TechCorp Solutions supplier');
      } else {
        console.log('✅ Using existing supplier:', supplier.name);
      }
    } else {
      console.log('✅ Using existing TechCorp Solutions supplier');
    }

    // Check if detailed product already exists
    let existingProduct = await Product.findOne({ name: 'Premium Wireless Bluetooth Headphones Pro Max' });
    if (existingProduct) {
      console.log('⚠️ Detailed product already exists. Updating with new pricing...');
      
      // Update the existing product
      existingProduct.price = 120000;
      existingProduct.currency = 'NGN';
      existingProduct.policies = {
        paymentPolicy: `Payment Terms & Methods:
• All major credit cards accepted (Visa, MasterCard, Verve)
• Bank transfers and USSD payments supported
• Mobile money payments (Opay, PalmPay, Kuda) available
• Buy now, pay later options available through selected partners
• Corporate purchase orders accepted for orders over ₦200,000
• Payment is processed securely through encrypted channels
• All prices are in Nigerian Naira (₦) and include applicable taxes
• International customers may be subject to additional customs duties`,

        shippingPolicy: `Shipping Information:
• FREE standard shipping on orders over ₦80,000 (3-5 business days)
• Express shipping available for ₦5,000 (1-2 business days)
• Same-day delivery available in Lagos for ₦8,000 (within Lagos Island/Mainland)
• Nationwide shipping available to all 36 states
• All orders are processed within 1 business day
• Tracking information provided via SMS and WhatsApp
• Signature confirmation required for orders over ₦100,000
• Ships from our Lagos warehouse
• Eco-friendly packaging materials used`,

        refundPolicy: `Return & Refund Policy:
• 30-day money-back guarantee from date of delivery
• Items must be returned in original condition with all accessories
• Original packaging required for full refund
• Return shipping is FREE for defective items
• Customer pays return shipping for change of mind returns
• Refunds processed within 3-5 business days after inspection
• Store credit option available for faster processing
• Exchanges available for different colors or sizes
• Warranty claims handled directly through manufacturer
• No restocking fees for unopened items`,

        guidelines: `Product Care & Usage Guidelines:
• Clean ear cups with soft, dry cloth only
• Avoid exposure to extreme temperatures (-10°C to 60°C)
• Store in provided carrying case when not in use
• Charge regularly to maintain battery health
• Use only provided USB-C cable for charging
• Keep away from water and moisture (despite IPX4 rating)
• Adjust headband carefully to avoid damage
• Update firmware regularly through companion app
• Do not disassemble or attempt repairs
• Register product for warranty coverage within 30 days`,

        suggestions: `Optimization Tips & Recommendations:
• Download the AudioTech Pro app for custom EQ settings
• Use LDAC codec with compatible Android devices for best quality
• Enable adaptive noise cancellation for automatic environment adjustment
• Pair with AudioTech Pro wireless charging stand (sold separately)
• Consider AudioTech Pro replacement ear pads for extended comfort
• Works excellently with AudioTech Pro DAC/Amp for wired listening
• Perfect companion for AudioTech Pro wireless transmitter for TV
• Recommended for: Music production, Gaming, Travel, Office work
• Best genres: Classical, Jazz, Electronic, Rock, Podcasts
• Ideal for users who prioritize: Sound quality, Comfort, Battery life`
      };
      
      await existingProduct.save();
      
      console.log('✅ Updated existing product with Naira pricing');
      console.log('📊 Product details:');
      console.log(`   - ID: ${existingProduct._id}`);
      console.log(`   - Price: ₦${existingProduct.price.toLocaleString()}`);
      console.log(`   - Currency: ${existingProduct.currency}`);
      console.log(`   - Discount: ${existingProduct.discount}% off`);
      console.log(`   - Final Price: ₦${Math.round(existingProduct.price * (1 - existingProduct.discount / 100)).toLocaleString()}`);
      
      return;
    }

    // Create a comprehensive product with all features
    const detailedProduct = await Product.create({
      name: 'Premium Wireless Bluetooth Headphones Pro Max',
      description: `Experience unparalleled audio quality with our flagship wireless headphones. Featuring advanced noise cancellation technology, premium materials, and exceptional comfort for all-day listening. Perfect for music enthusiasts, professionals, and anyone who demands the best in audio technology.

Key Features:
• Active Noise Cancellation (ANC) with 3 modes
• 40mm dynamic drivers for rich, detailed sound
• 30-hour battery life with quick charge
• Premium leather and memory foam construction
• Multi-device connectivity
• Touch controls and voice assistant support
• Foldable design with premium carrying case`,

      price: 120000, // ₦120,000 (reasonable price for premium headphones in Naira)
      currency: 'NGN',
      stock: 45,
      category: category.name,
      supplierId: supplier._id,
      
      // High-quality stock images for headphones
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&h=800&fit=crop&crop=center'
      ],

      // Comprehensive specifications
      specifications: new Map([
        ['Brand', 'AudioTech Pro'],
        ['Model', 'ATP-WH1000XM5'],
        ['Type', 'Over-Ear Wireless Headphones'],
        ['Driver Size', '40mm Dynamic'],
        ['Frequency Response', '4Hz - 40kHz'],
        ['Impedance', '16 ohms'],
        ['Sensitivity', '104.5 dB'],
        ['Battery Life', '30 hours (ANC on), 40 hours (ANC off)'],
        ['Charging Time', '3 hours (full), 10 min (3 hours playback)'],
        ['Charging Port', 'USB-C'],
        ['Bluetooth Version', '5.2'],
        ['Bluetooth Codecs', 'SBC, AAC, LDAC, aptX HD'],
        ['Active Noise Cancellation', 'Yes (3 modes)'],
        ['Microphone', 'Dual beamforming mics'],
        ['Weight', '254g'],
        ['Colors Available', 'Midnight Black, Silver, Rose Gold'],
        ['Foldable', 'Yes'],
        ['Water Resistance', 'IPX4'],
        ['Voice Assistant', 'Google Assistant, Alexa, Siri'],
        ['Multi-point Connection', 'Yes (2 devices)'],
        ['Touch Controls', 'Yes'],
        ['Carrying Case', 'Premium hard case included'],
        ['Cable Included', '3.5mm audio cable, USB-C charging cable'],
        ['Warranty', '2 years international warranty']
      ]),

      // Comprehensive policies
      policies: {
        paymentPolicy: `Payment Terms & Methods:
• All major credit cards accepted (Visa, MasterCard, Verve)
• Bank transfers and USSD payments supported
• Mobile money payments (Opay, PalmPay, Kuda) available
• Buy now, pay later options available through selected partners
• Corporate purchase orders accepted for orders over ₦200,000
• Payment is processed securely through encrypted channels
• All prices are in Nigerian Naira (₦) and include applicable taxes
• International customers may be subject to additional customs duties`,

        shippingPolicy: `Shipping Information:
• FREE standard shipping on orders over ₦80,000 (3-5 business days)
• Express shipping available for ₦5,000 (1-2 business days)
• Same-day delivery available in Lagos for ₦8,000 (within Lagos Island/Mainland)
• Nationwide shipping available to all 36 states
• All orders are processed within 1 business day
• Tracking information provided via SMS and WhatsApp
• Signature confirmation required for orders over ₦100,000
• Ships from our Lagos warehouse
• Eco-friendly packaging materials used`,

        refundPolicy: `Return & Refund Policy:
• 30-day money-back guarantee from date of delivery
• Items must be returned in original condition with all accessories
• Original packaging required for full refund
• Return shipping is FREE for defective items
• Customer pays return shipping for change of mind returns
• Refunds processed within 3-5 business days after inspection
• Store credit option available for faster processing
• Exchanges available for different colors or sizes
• Warranty claims handled directly through manufacturer
• No restocking fees for unopened items`,

        guidelines: `Product Care & Usage Guidelines:
• Clean ear cups with soft, dry cloth only
• Avoid exposure to extreme temperatures (-10°C to 60°C)
• Store in provided carrying case when not in use
• Charge regularly to maintain battery health
• Use only provided USB-C cable for charging
• Keep away from water and moisture (despite IPX4 rating)
• Adjust headband carefully to avoid damage
• Update firmware regularly through companion app
• Do not disassemble or attempt repairs
• Register product for warranty coverage within 30 days`,

        suggestions: `Optimization Tips & Recommendations:
• Download the AudioTech Pro app for custom EQ settings
• Use LDAC codec with compatible Android devices for best quality
• Enable adaptive noise cancellation for automatic environment adjustment
• Pair with AudioTech Pro wireless charging stand (sold separately)
• Consider AudioTech Pro replacement ear pads for extended comfort
• Works excellently with AudioTech Pro DAC/Amp for wired listening
• Perfect companion for AudioTech Pro wireless transmitter for TV
• Recommended for: Music production, Gaming, Travel, Office work
• Best genres: Classical, Jazz, Electronic, Rock, Podcasts
• Ideal for users who prioritize: Sound quality, Comfort, Battery life`
      },

      // Additional product attributes
      rating: 4.7,
      reviewCount: 1247,
      tags: ['wireless', 'bluetooth', 'noise-cancelling', 'premium', 'audiophile', 'travel', 'professional'],
      discount: 25, // 25% discount - making it more attractive
      isNewProduct: false,
      isFeatured: true,
      isActive: true,
    });

    console.log('✅ Created detailed product:', detailedProduct.name);
    console.log('📊 Product details:');
    console.log(`   - ID: ${detailedProduct._id}`);
    console.log(`   - Price: $${detailedProduct.price}`);
    console.log(`   - Stock: ${detailedProduct.stock} units`);
    console.log(`   - Category: ${detailedProduct.category}`);
    console.log(`   - Supplier: ${supplier.name}`);
    console.log(`   - Images: ${detailedProduct.images.length} high-quality photos`);
    console.log(`   - Specifications: ${Object.keys(detailedProduct.specifications).length} detailed specs`);
    console.log(`   - Policies: Complete payment, shipping, refund, guidelines, and suggestions`);
    console.log(`   - Rating: ${detailedProduct.rating}/5 (${detailedProduct.reviewCount} reviews)`);
    console.log(`   - Featured: ${detailedProduct.isFeatured ? 'Yes' : 'No'}`);
    console.log(`   - Discount: ${detailedProduct.discount}% off`);

    console.log('🎉 Detailed product seeding completed successfully!');
    console.log('');
    console.log('📱 You can now:');
    console.log('   1. View this product in the admin dashboard');
    console.log('   2. See it featured on the home page');
    console.log('   3. Test the specifications table');
    console.log('   4. Review the comprehensive policies');
    console.log('   5. Add it to cart and test checkout flow');
    console.log('   6. Add it to wishlist');

  } catch (error) {
    console.error('❌ Error seeding detailed product:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('📡 Database connection closed');
  }
}

// Run the seeding function
if (require.main === module) {
  seedDetailedProduct()
    .then(() => {
      console.log('✅ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding process failed:', error);
      process.exit(1);
    });
}

export { seedDetailedProduct };