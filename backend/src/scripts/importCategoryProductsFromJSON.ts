import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import Product from '../models/Product';
import Supplier from '../models/Supplier';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

interface ProductData {
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: string;
  subcategory: string;
  supplierName: string;
  rating: number;
  reviewCount: number;
  stock: number;
  tags: string[];
  specifications: Record<string, string>;
  policies: {
    paymentPolicy: string;
    shippingPolicy: string;
    refundPolicy: string;
    guidelines: string;
    suggestions: string;
  };
  discount: number;
  isNewProduct: boolean;
  isFeatured: boolean;
  isActive: boolean;
  viewCount: number;
  isSellerFavorite: boolean;
  trendingScore: number;
}

interface SupplierData {
  name: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  responseTime: string;
}

interface ImportData {
  suppliers: SupplierData[];
  products: ProductData[];
}

export const importCategoryProductsFromJSON = async (): Promise<void> => {
  try {
    console.log('🚀 Starting category products import from JSON...');
    console.log('=====================================');

    // Read JSON data
    const dataPath = path.join(__dirname, '../data/categoryProductsData.json');
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    const importData: ImportData = JSON.parse(jsonData);

    console.log(`📦 Found ${importData.suppliers.length} suppliers and ${importData.products.length} products in JSON`);

    // Create suppliers first
    const supplierMap = new Map<string, mongoose.Types.ObjectId>();
    
    for (const supplierData of importData.suppliers) {
      let supplier = await Supplier.findOne({ name: supplierData.name });
      
      if (!supplier) {
        supplier = new Supplier(supplierData);
        await supplier.save();
        console.log(`✅ Created supplier: ${supplier.name}`);
      } else {
        console.log(`⚠️  Supplier already exists: ${supplier.name}`);
      }
      
      supplierMap.set(supplierData.name, supplier._id);
    }

    // Create products
    let createdCount = 0;
    let existingCount = 0;

    for (const productData of importData.products) {
      const existingProduct = await Product.findOne({ name: productData.name });
      
      if (!existingProduct) {
        const supplierId = supplierMap.get(productData.supplierName);
        
        if (!supplierId) {
          console.error(`❌ Supplier not found for product: ${productData.name}`);
          continue;
        }

        // Convert specifications object to Map
        const specificationsMap = new Map(Object.entries(productData.specifications));

        // Create product with proper data structure
        const product = new Product({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          currency: productData.currency,
          images: productData.images,
          category: productData.category,
          subcategory: productData.subcategory,
          supplierId: supplierId,
          rating: productData.rating,
          reviewCount: productData.reviewCount,
          stock: productData.stock,
          tags: productData.tags,
          specifications: specificationsMap,
          policies: productData.policies,
          discount: productData.discount,
          isNewProduct: productData.isNewProduct,
          isFeatured: productData.isFeatured,
          isActive: productData.isActive,
          viewCount: productData.viewCount,
          isSellerFavorite: productData.isSellerFavorite,
          trendingScore: productData.trendingScore,
          lastViewedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
        });

        await product.save();
        createdCount++;
        console.log(`✅ Created ${productData.category} product: ${product.name}`);
        console.log(`   Price: ₦${product.price.toLocaleString()}, Stock: ${product.stock}, Rating: ${product.rating}`);
      } else {
        existingCount++;
        console.log(`⚠️  Product already exists: ${productData.name}`);
      }
    }

    console.log('\n🎉 Category products import completed!');
    console.log('📊 Summary:');
    console.log(`   - New products created: ${createdCount}`);
    console.log(`   - Existing products skipped: ${existingCount}`);
    console.log('   - Categories: Automotive (2), Books and Media (2), Fashion (2)');
    console.log('   - Total suppliers: 3');

  } catch (error) {
    console.error('❌ Error importing category products from JSON:', error);
    throw error;
  }
};

// Run script directly if called from command line
if (require.main === module) {
  const runImport = async () => {
    try {
      await connectDatabase();
      await importCategoryProductsFromJSON();
    } catch (error) {
      console.error('💥 Category products import failed:', error);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      process.exit(0);
    }
  };

  runImport();
}