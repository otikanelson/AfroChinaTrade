import mongoose, { Schema, Document } from 'mongoose';

// Supplier Review document interface
export interface ISupplierReview extends Document {
  supplierId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Supplier Review schema
const SupplierReviewSchema = new Schema<ISupplierReview>(
  {
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
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
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SupplierReviewSchema.index({ supplierId: 1 });
SupplierReviewSchema.index({ userId: 1 });
SupplierReviewSchema.index({ supplierId: 1, userId: 1 }, { unique: true }); // One review per user per supplier

// Create and export the SupplierReview model
const SupplierReview = mongoose.model<ISupplierReview>('SupplierReview', SupplierReviewSchema);

export default SupplierReview;