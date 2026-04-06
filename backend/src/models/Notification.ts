import mongoose, { Schema, Document } from 'mongoose';

// Notification document interface
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'refund_request' | 'order_update' | 'system' | 'general' | 'promotion' | 'new_product' | 'discounted_product' | 'new_ad' | 'chat_message' | 'help_support' | 'newsletter' | 'new_order' | 'new_refund_request';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Notification schema
const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    type: {
      type: String,
      enum: {
        values: ['refund_request', 'order_update', 'system', 'general', 'promotion', 'new_product', 'discounted_product', 'new_ad', 'chat_message', 'help_support', 'newsletter', 'new_order', 'new_refund_request'],
        message: '{VALUE} is not a valid notification type',
      },
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// Index on userId and read status for efficient queries
NotificationSchema.index({ userId: 1, read: 1 });

// Index on createdAt for sorting
NotificationSchema.index({ createdAt: -1 });

// Compound index for unread notifications by user
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

// Create and export the Notification model
const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;