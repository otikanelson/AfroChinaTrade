import mongoose, { Schema, Document } from 'mongoose';

// BrowsingHistory document interface
export interface IBrowsingHistory extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  interactionType: 'view' | 'cart_add' | 'wishlist_add' | 'purchase';
  sessionId?: string;
  timestamp: Date;
  deviceInfo?: {
    platform: string;
    userAgent?: string;
  };
  metadata?: {
    viewDuration?: number;            // Time spent viewing (seconds)
    scrollDepth?: number;             // Percentage scrolled
    imageViews?: number;              // Number of images viewed
  };
}

// BrowsingHistory schema
const BrowsingHistorySchema = new Schema<IBrowsingHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    interactionType: {
      type: String,
      enum: ['view', 'cart_add', 'wishlist_add', 'purchase'],
      required: [true, 'Interaction type is required'],
    },
    sessionId: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: [true, 'Timestamp is required'],
    },
    deviceInfo: {
      platform: {
        type: String,
        trim: true,
      },
      userAgent: {
        type: String,
        trim: true,
      },
    },
    metadata: {
      viewDuration: {
        type: Number,
        min: [0, 'View duration cannot be negative'],
      },
      scrollDepth: {
        type: Number,
        min: [0, 'Scroll depth cannot be negative'],
        max: [100, 'Scroll depth cannot exceed 100%'],
      },
      imageViews: {
        type: Number,
        min: [0, 'Image views cannot be negative'],
      },
    },
  },
  {
    timestamps: false, // We use our own timestamp field
  }
);

// Indexes for optimal query performance
// Primary index for user browsing history queries
BrowsingHistorySchema.index({ userId: 1, timestamp: -1 });

// Index for product interaction analysis
BrowsingHistorySchema.index({ productId: 1, timestamp: -1 });

// Compound index for user interaction type queries
BrowsingHistorySchema.index({ userId: 1, interactionType: 1, timestamp: -1 });

// Index for trending calculations (time-based queries)
BrowsingHistorySchema.index({ timestamp: -1 });

// Index for session-based queries
BrowsingHistorySchema.index({ sessionId: 1, timestamp: -1 });

// Compound index for interaction type and timestamp (for trending)
BrowsingHistorySchema.index({ interactionType: 1, timestamp: -1 });

// Static method to cleanup orphaned entries
BrowsingHistorySchema.statics.cleanupOrphanedEntries = async function() {
  const pipeline = [
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $match: {
        product: { $size: 0 } // No matching product found
      }
    },
    {
      $project: {
        _id: 1
      }
    }
  ];
  
  const orphanedEntries = await this.aggregate(pipeline);
  const orphanedIds = orphanedEntries.map(entry => entry._id);
  
  if (orphanedIds.length > 0) {
    const result = await this.deleteMany({ _id: { $in: orphanedIds } });
    return result.deletedCount;
  }
  
  return 0;
};

// Create and export the BrowsingHistory model
const BrowsingHistory = mongoose.model<IBrowsingHistory>('BrowsingHistory', BrowsingHistorySchema);

export default BrowsingHistory;