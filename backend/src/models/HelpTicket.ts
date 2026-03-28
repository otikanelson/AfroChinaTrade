import mongoose, { Document, Schema } from 'mongoose';

export interface IHelpTicket extends Document {
  userId: mongoose.Types.ObjectId;
  ticketNumber: string;
  subject: string;
  category: 'order' | 'payment' | 'product' | 'account' | 'technical' | 'suspension_appeal' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  description: string;
  attachments?: string[];
  
  // Admin response
  adminResponse?: string;
  adminId?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  
  // Suspension appeal specific
  isSuspensionAppeal?: boolean;
  appealReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const helpTicketSchema = new Schema<IHelpTicket>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  ticketNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    enum: ['order', 'payment', 'product', 'account', 'technical', 'suspension_appeal', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
    index: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  attachments: [{
    type: String // URLs to uploaded files
  }],
  adminResponse: {
    type: String,
    maxlength: 2000
  },
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,
  
  // Suspension appeal specific
  isSuspensionAppeal: {
    type: Boolean,
    default: false
  },
  appealReason: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Generate ticket number before saving
helpTicketSchema.pre('save', async function() {
  if (this.isNew) {
    const count = await mongoose.model('HelpTicket').countDocuments();
    this.ticketNumber = `HT${String(count + 1).padStart(6, '0')}`;
  }
  
  if (this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
});

export default mongoose.model<IHelpTicket>('HelpTicket', helpTicketSchema);