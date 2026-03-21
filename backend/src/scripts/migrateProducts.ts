import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { connectDatabase } from '../config/database';
import Product from '../models/Product';
import Category from '../models/Category';
import Supplier from '../models/Supplier';

interface MockProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  categoryName: string;
  supplierName: string;
  stock: number;
  images: string[];
  tags: string[];
  specifications?: Record<string, any>;
  isFeatured?: boolean;
  isActive?: boolean;
  rating?: number;
  reviewCount?: number;
}

/**
 * Migrate mock product data from JSON file to MongoDB
 */
export const migrateProducts = async (mockDataPath?: string): Promise<void> => {
  try {
    console.log('🔄 Starting product data migration...');

    // Default path for mock data
    const dataPath = mockDataPath || path.join(__dirname, '../../data/mock-products.json');

    // Check if mock data file exists
    if (!fs.existsSync(dataPath)) {
      console.log(`⚠️  Mock data file not found at ${dataPath}. Skipping migration.`);
      return;
    }

    // Read mock data
    const mockData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const mockProducts: MockProduct[] = mockData.products || mockData;

    if (!Array.isArray(mockProducts) || mockProducts.length === 0) {
      console.log('⚠️  No products found in mock data. Skipping migration.');
      return;
    }

    console.log(`📦 Found ${mockProducts.length} products to migrate`);

    // Get existing categories and suppliers for mapping
    const categories = await Category.find();
    const suppliers = await Supplier.find();

    const categoryMap = new Map(categories.map(cat => [cat.name.toLowerCase(), cat._id]));
    const supplierMap = new Map(suppliers.map(sup => [sup.name.toLowerCase(), sup._id]));

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each product
    for (const mockProduct of mockProducts) {
      try {
        // Check if product already exists
        const existingProduct = await Product.findOne({ 
          $or: [
            { name: mockProduct.name },
            { 'specifications.model': mockProduct.id }
          ]
        });

        if (existingProduct) {
          console.log(`⚠️  Product "${mockProduct.name}" already exists. Skipping.`);
          continue;
        }

        // Map category
        const categoryId = categoryMap.get(mockProduct.categoryName.toLowerCase());
        if (!categoryId) {
          const error = `Category "${mockProduct.categoryName}" not found for product "${mockProduct.name}"`;
          errors.push(error);
          console.log(`❌ ${error}`);
          errorCount++;
          continue;
        }

        // Map supplier
        const supplierId = supplierMap.get(mockProduct.supplierName.toLowerCase());
        if (!supplierId) {
          const error = `Supplier "${mockProduct.supplierName}" not found for product "${mockProduct.name}"`;
          errors.push(error);
          console.log(`❌ ${error}`);
          errorCount++;
          continue;
        }

        // Create product document
        const productData = {
          name: mockProduct.name,
          description: mockProduct.description,
          price: mockProduct.price,
          originalPrice: mockProduct.originalPrice || mockProduct.price,
          discount: mockProduct.discount || 0,
          categoryId,
          supplierId,
          stock: mockProduct.stock,
          images: mockProduct.images || [],
          tags: mockProduct.tags || [],
          specifications: {
            ...mockProduct.specifications,
            originalId: mockProduct.id // Keep reference to original mock ID
          },
          isFeatured: mockProduct.isFeatured || false,
          isActive: mockProduct.isActive !== false, // Default to true
          rating: mockProduct.rating || 0,
          reviewCount: mockProduct.reviewCount || 0
        };

        // Create and save product
        const product = new Product(productData);
        await product.save();

        console.log(`✅ Migrated product: ${product.name}`);
        successCount++;

      } catch (error) {
        const errorMsg = `Error migrating product "${mockProduct.name}": ${error}`;
        errors.push(errorMsg);
        console.log(`❌ ${errorMsg}`);
        errorCount++;
      }
    }

    // Migration summary
    console.log('');
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${successCount} products`);
    console.log(`   ❌ Failed migrations: ${errorCount} products`);
    console.log(`   📝 Total processed: ${mockProducts.length} products`);

    if (errors.length > 0) {
      console.log('');
      console.log('❌ Migration Errors:');
      errors.forEach(error => console.log(`   - ${error}`));
    }

  } catch (error) {
    console.error('❌ Error during product migration:', error);
    throw error;
  }
};

// Run script directly if called from command line
if (require.main === module) {
  const runMigration = async () => {
    try {
      await connectDatabase();
      
      // Get file path from command line argument
      const filePath = process.argv[2];
      await migrateProducts(filePath);
      
      console.log('🎉 Product migration completed');
    } catch (error) {
      console.error('💥 Product migration failed:', error);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      process.exit(0);
    }
  };

  runMigration();
}