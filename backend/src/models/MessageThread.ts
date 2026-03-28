import mongoose, { Schema, Document } from 'mongoose';

// MessageThread document interface
export interface IMessageThread extends Document {
  threadId: string;
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  productId?: mongoose.Types.ObjectId;
  productName?: string;
  productImage?: string;
  threadType: 'general' | 'product_inquiry' | 'quote_request';
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

// MessageThread schema
const MessageThreadSchema = new Schema<IMessageThread>(
  {
    threadId: {
      type: String,
      unique: true,
      required: [true, 'Thread ID is required'],
      trim: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required'],
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: false,
    },
    productName: {
      type: String,
      trim: true,
    },
    productImage: {
      type: String,
      trim: true,
    },
    threadType: {
      type: String,
      enum: {
        values: ['general', 'product_inquiry', 'quote_request'],
        message: '{VALUE} is not a valid thread type',
      },
      default: 'general',
    },
    lastMessage: {
      type: String,
      default: '',
      trim: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Number,
      default: 0,
      min: [0, 'Unread count cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'archived'],
        message: '{VALUE} is not a valid thread status',
      },
      default: 'active',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes
// Unique index on threadId
MessageThreadSchema.index({ threadId: 1 }, { unique: true });

// Index on customerId for retrieving customer's threads
MessageThreadSchema.index({ customerId: 1 });

// Index on lastMessageAt for sorting threads by recent activity
MessageThreadSchema.index({ lastMessageAt: -1 });

// Create and export the MessageThread model
const MessageThread = mongoose.model<IMessageThread>('MessageThread', MessageThreadSchema);

export default MessageThread;
