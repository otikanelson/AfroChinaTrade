import mongoose, { Schema, Document } from 'mongoose';

// Refund document interface
export interface IRefund extends Document {
  orderId: mongoose.Types.ObjectId;
  type: 'full' | 'partial';
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  processedBy?: mongoose.Types.ObjectId;
  processedAt?: Date;
  adminNotes?: string;
  createdAt: Date;
}

// Refund schema
const RefundSchema = new Schema<IRefund>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
    },
    type: {
      type: String,
      enum: {
        values: ['full', 'partial'],
        message: '{VALUE} is not a valid refund type',
      },
      required: [true, 'Refund type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Refund amount is required'],
      min: [0, 'Refund amount must be a positive number'],
    },
    reason: {
      type: String,
      required: [true, 'Refund reason is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected', 'processed'],
        message: '{VALUE} is not a valid refund status',
      },
      default: 'pending',
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    processedAt: {
      type: Date,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only track creation time
  }
);

// Indexes
// Index on orderId for order refunds
RefundSchema.index({ orderId: 1 });

// Compound index on status and createdAt for filtering refunds
RefundSchema.index({ status: 1, createdAt: -1 });

// Create and export the Refund model
const Refund = mongoose.model<IRefund>('Refund', RefundSchema);

export default Refund;
