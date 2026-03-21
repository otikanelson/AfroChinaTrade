import mongoose, { Schema, Document } from 'mongoose';

// Message document interface
export interface IMessage extends Document {
  threadId: string;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderRole: 'customer' | 'admin';
  text: string;
  isRead: boolean;
  createdAt: Date;
}

// Message schema
const MessageSchema = new Schema<IMessage>(
  {
    threadId: {
      type: String,
      required: [true, 'Thread ID is required'],
      trim: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required'],
    },
    senderName: {
      type: String,
      required: [true, 'Sender name is required'],
      trim: true,
    },
    senderRole: {
      type: String,
      enum: {
        values: ['customer', 'admin'],
        message: '{VALUE} is not a valid sender role',
      },
      required: [true, 'Sender role is required'],
    },
    text: {
      type: String,
      required: [true, 'Message text is required'],
      trim: true,
      maxlength: [1000, 'Message text must not exceed 1000 characters'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only track creation time
  }
);

// Indexes
// Compound index on threadId and createdAt for retrieving messages in a thread
MessageSchema.index({ threadId: 1, createdAt: 1 });

// Compound index on senderId and isRead for sender's unread messages
MessageSchema.index({ senderId: 1, isRead: 1 });

// Index on isRead for filtering unread messages
MessageSchema.index({ isRead: 1 });

// Create and export the Message model
const Message = mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
