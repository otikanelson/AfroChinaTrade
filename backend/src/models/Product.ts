import mongoose, { Schema, Document } from 'mongoose';

// Product document interface
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: string;
  subcategory?: string;
  supplierId: mongoose.Types.ObjectId;
  rating: number;
  reviewCount: number;
  stock: number;
  tags: string[];
  specifications: Map<string, string>;
  policies?: {
    paymentPolicy?: string;
    shippingPolicy?: string;
    refundPolicy?: string;
    guidelines?: string;
    suggestions?: string;
  };
  discount: number;
  isNewProduct: boolean;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Product schema
const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters'],
      maxlength: [200, 'Product name must not exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      minlength: [10, 'Product description must be at least 10 characters'],
      maxlength: [2000, 'Product description must not exceed 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be a positive number'],
    },
    currency: {
      type: String,
      default: 'NGN',
      trim: true,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (images: string[]) {
          return images.length <= 10;
        },
        message: 'Maximum 10 images allowed per product',
      },
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier ID is required'],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be between 0 and 5'],
      max: [5, 'Rating must be between 0 and 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
    },
    tags: {
      type: [String],
      default: [],
    },
    specifications: {
      type: Map,
      of: String,
      default: new Map(),
    },
    policies: {
      paymentPolicy: { type: String, trim: true },
      shippingPolicy: { type: String, trim: true },
      refundPolicy: { type: String, trim: true },
      guidelines: { type: String, trim: true },
      suggestions: { type: String, trim: true },
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount must be between 0 and 100'],
      max: [100, 'Discount must be between 0 and 100'],
    },
    isNewProduct: {
      type: Boolean,
      default: false,
      alias: 'isNew',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes
// Text index on name and description for full-text search
ProductSchema.index({ name: 'text', description: 'text' });

// Compound index on category and isFeatured for efficient category-based queries
ProductSchema.index({ category: 1, isFeatured: 1 });

// Compound index on supplierId and isActive for supplier product queries
ProductSchema.index({ supplierId: 1, isActive: 1 });

// Index on tags array for tag-based filtering
ProductSchema.index({ tags: 1 });

// Index on createdAt for sorting by creation date
ProductSchema.index({ createdAt: -1 });

// Create and export the Product model
const Product = mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
