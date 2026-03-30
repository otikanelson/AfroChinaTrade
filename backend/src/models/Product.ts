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
  // New discovery fields
  viewCount: number;
  isSellerFavorite: boolean;
  trendingScore: number;
  lastViewedAt?: Date;
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
      validate: {
        validator: function (tags: string[]) {
          const validTags = ['trending', 'new', 'sale', 'bestseller', 'limited', 'premium', 'eco-friendly'];
          return tags.every(tag => validTags.includes(tag));
        },
        message: 'Invalid tag. Valid tags are: trending, new, sale, bestseller, limited, premium, eco-friendly',
      },
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
    // New discovery fields
    viewCount: {
      type: Number,
      default: 0,
      min: [0, 'View count cannot be negative'],
    },
    isSellerFavorite: {
      type: Boolean,
      default: false,
    },
    trendingScore: {
      type: Number,
      default: 0,
      min: [0, 'Trending score cannot be negative'],
    },
    lastViewedAt: {
      type: Date,
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

// New indexes for discovery features
// Compound index for active products with view count (trending)
ProductSchema.index({ isActive: 1, viewCount: -1 });

// Compound index for active featured products
ProductSchema.index({ isActive: 1, isFeatured: 1 });

// Compound index for active seller favorites
ProductSchema.index({ isActive: 1, isSellerFavorite: 1 });

// Compound index for category-based trending
ProductSchema.index({ isActive: 1, category: 1, viewCount: -1 });

// Index on trending score for trending calculations
ProductSchema.index({ trendingScore: -1 });

// Index on lastViewedAt for trending timeframe queries
ProductSchema.index({ lastViewedAt: -1 });

// Create and export the Product model
const Product = mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
