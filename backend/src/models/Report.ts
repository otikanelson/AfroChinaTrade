import mongoose, { Schema, Document } from 'mongoose';

// Report document interface
export interface IReport extends Document {
  type: 'spam' | 'abuse' | 'fraud' | 'other';
  reportedContent: string;
  reportedEntityType: 'product' | 'review' | 'user' | 'order';
  reportedEntityId?: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId;
  reporterName: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
}

// Report schema
const ReportSchema = new Schema<IReport>(
  {
    type: {
      type: String,
      enum: {
        values: ['spam', 'abuse', 'fraud', 'other'],
        message: '{VALUE} is not a valid report type',
      },
      required: [true, 'Report type is required'],
    },
    reportedContent: {
      type: String,
      required: [true, 'Reported content is required'],
      trim: true,
    },
    reportedEntityType: {
      type: String,
      enum: {
        values: ['product', 'review', 'user', 'order'],
        message: '{VALUE} is not a valid entity type',
      },
      required: [true, 'Reported entity type is required'],
    },
    reportedEntityId: {
      type: Schema.Types.ObjectId,
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter ID is required'],
    },
    reporterName: {
      type: String,
      required: [true, 'Reporter name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'investigating', 'resolved', 'dismissed'],
        message: '{VALUE} is not a valid report status',
      },
      default: 'pending',
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only track creation time
  }
);

// Indexes
// Compound index on status and createdAt for filtering reports
ReportSchema.index({ status: 1, createdAt: -1 });

// Index on type for filtering by report type
ReportSchema.index({ type: 1 });

// Create and export the Report model
const Report = mongoose.model<IReport>('Report', ReportSchema);

export default Report;
