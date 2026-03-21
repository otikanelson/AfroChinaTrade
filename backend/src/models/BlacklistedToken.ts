import mongoose, { Schema, Document } from 'mongoose';

export interface IBlacklistedToken extends Document {
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

const BlacklistedTokenSchema = new Schema<IBlacklistedToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB TTL index
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index for efficient queries
BlacklistedTokenSchema.index({ token: 1 });
BlacklistedTokenSchema.index({ userId: 1 });

const BlacklistedToken = mongoose.model<IBlacklistedToken>('BlacklistedToken', BlacklistedTokenSchema);

export default BlacklistedToken;