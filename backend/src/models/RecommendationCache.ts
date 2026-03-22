import mongoose, { Schema, Document } from 'mongoose';

// RecommendationCache document interface
export interface IRecommendationCache extends Document {
  userId: mongoose.Types.ObjectId;
  recommendations: {
    productId: mongoose.Types.ObjectId;
    score: number;
    reason: string;
  }[];
  generatedAt: Date;
  expiresAt: Date;
  version: number;
}

// RecommendationCache schema
const RecommendationCacheSchema = new Schema<IRecommendationCache>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    recommendations: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Product ID is required'],
        },
        score: {
          type: Number,
          required: [true, 'Recommendation score is required'],
          min: [0, 'Score cannot be negative'],
          max: [1, 'Score cannot exceed 1'],
        },
        reason: {
          type: String,
          required: [true, 'Recommendation reason is required'],
          trim: true,
        },
      },
    ],
    generatedAt: {
      type: Date,
      default: Date.now,
      required: [true, 'Generated timestamp is required'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration timestamp is required'],
      default: function() {
        // Default expiration: 2 hours from now
        return new Date(Date.now() + 2 * 60 * 60 * 1000);
      },
    },
    version: {
      type: Number,
      default: 1,
      min: [1, 'Version must be at least 1'],
    },
  },
  {
    timestamps: false, // We use our own timestamp fields
  }
);

// Indexes for optimal query performance
// Unique index on userId (enforced by unique: true above)
RecommendationCacheSchema.index({ userId: 1 }, { unique: true });

// TTL index for automatic cache expiration
RecommendationCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index on generatedAt for cache maintenance
RecommendationCacheSchema.index({ generatedAt: -1 });

// Create and export the RecommendationCache model
const RecommendationCache = mongoose.model<IRecommendationCache>('RecommendationCache', RecommendationCacheSchema);

export default RecommendationCache;