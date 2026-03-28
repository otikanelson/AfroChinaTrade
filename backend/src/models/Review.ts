import mongoose, { Schema, Document } from 'mongoose';

// Review document interface
export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  rating: number;
  comment: string;
  response?: string;
  responseAt?: Date;
  isFlagged: boolean;
  createdAt: Date;
}

// Review schema
const ReviewSchema = new Schema<IReview>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment must not exceed 1000 characters'],
    },
    response: {
      type: String,
      trim: true,
    },
    responseAt: {
      type: Date,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only track creation time
  }
);

// Indexes
// Compound index on productId and createdAt for product reviews
ReviewSchema.index({ productId: 1, createdAt: -1 });

// Index on userId for user's reviews
ReviewSchema.index({ userId: 1 });

// Index on isFlagged for filtering flagged reviews
ReviewSchema.index({ isFlagged: 1 });

// Create and export the Review model
const Review = mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
