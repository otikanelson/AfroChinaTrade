import mongoose, { Schema, Document } from 'mongoose';

export interface ITag extends Document {
  name: string;
  description?: string;
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Tag name must be at least 2 characters'],
      maxlength: [50, 'Tag name must not exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description must not exceed 200 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TagSchema.index({ name: 1 });
TagSchema.index({ isActive: 1, usageCount: -1 });

export const Tag = mongoose.model<ITag>('Tag', TagSchema);
export default Tag;
