import mongoose, { Schema, Document } from 'mongoose';

// User audit log document interface
export interface IUserAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  action: 'status_change' | 'suspension' | 'reactivation' | 'block' | 'unblock';
  previousStatus?: string;
  newStatus: string;
  reason?: string;
  suspensionDuration?: Date;
  createdAt: Date;
}

// User audit log schema
const UserAuditLogSchema = new Schema<IUserAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin ID is required'],
    },
    action: {
      type: String,
      enum: {
        values: ['status_change', 'suspension', 'reactivation', 'block', 'unblock'],
        message: '{VALUE} is not a valid audit action',
      },
      required: [true, 'Action is required'],
    },
    previousStatus: {
      type: String,
      enum: ['active', 'suspended', 'blocked'],
    },
    newStatus: {
      type: String,
      enum: {
        values: ['active', 'suspended', 'blocked'],
        message: '{VALUE} is not a valid status',
      },
      required: [true, 'New status is required'],
    },
    reason: {
      type: String,
      trim: true,
    },
    suspensionDuration: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes
// Compound index on userId and createdAt for user audit history queries
UserAuditLogSchema.index({ userId: 1, createdAt: -1 });

// Index on adminId for admin action tracking
UserAuditLogSchema.index({ adminId: 1, createdAt: -1 });

// Create and export the UserAuditLog model
const UserAuditLog = mongoose.model<IUserAuditLog>('UserAuditLog', UserAuditLogSchema);

export default UserAuditLog;