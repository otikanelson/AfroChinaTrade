import mongoose, { Schema, Document } from 'mongoose';

// ProductViewCache document interface
export interface IProductViewCache extends Document {
  productId: mongoose.Types.ObjectId;
  hourlyViews: Map<string, number>;    // Hour-based view counts
  dailyViews: Map<string, number>;     // Day-based view counts
  weeklyViews: Map<string, number>;    // Week-based view counts
  totalViews: number;
  lastUpdated: Date;
  trendingScore: number;
}

// ProductViewCache schema
const ProductViewCacheSchema = new Schema<IProductViewCache>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      unique: true,
    },
    hourlyViews: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    dailyViews: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    weeklyViews: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    totalViews: {
      type: Number,
      default: 0,
      min: [0, 'Total views cannot be negative'],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
      required: [true, 'Last updated timestamp is required'],
    },
    trendingScore: {
      type: Number,
      default: 0,
      min: [0, 'Trending score cannot be negative'],
    },
  },
  {
    timestamps: false, // We use our own lastUpdated field
  }
);

// Indexes for optimal query performance
// Unique index on productId (enforced by unique: true above)
ProductViewCacheSchema.index({ productId: 1 }, { unique: true });

// Index on trending score for trending product queries
ProductViewCacheSchema.index({ trendingScore: -1 });

// Index on lastUpdated for cache maintenance
ProductViewCacheSchema.index({ lastUpdated: -1 });

// Create and export the ProductViewCache model
const ProductViewCache = mongoose.model<IProductViewCache>('ProductViewCache', ProductViewCacheSchema);

export default ProductViewCache;