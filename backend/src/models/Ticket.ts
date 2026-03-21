import mongoose, { Schema, Document } from 'mongoose';

// Ticket document interface
export interface ITicket extends Document {
  subject: string;
  description: string;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  assignedTo?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Ticket schema
const TicketSchema = new Schema<ITicket>(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
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
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
      trim: true,
      lowercase: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'medium',
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'in_progress', 'resolved'],
        message: '{VALUE} is not a valid ticket status',
      },
      default: 'open',
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes
// Compound index on userId and status for user's tickets
TicketSchema.index({ userId: 1, status: 1 });

// Compound index on priority and status for filtering tickets
TicketSchema.index({ priority: 1, status: 1 });

// Index on createdAt for sorting by creation date
TicketSchema.index({ createdAt: -1 });

// Create and export the Ticket model
const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;
