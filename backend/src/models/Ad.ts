import mongoose, { Schema, Document } from 'mongoose';

export interface IAd extends Document {
  title: string;
  description?: string;
  imageUrl: string;
  linkPath?: string;
  linkParams?: Record<string, string>;
  isActive: boolean;
  displayOrder: number;
  placement: {
    home?: 'carousel' | 'tile';
    'buy-now'?: 'carousel' | 'tile';
    'product-detail'?: 'carousel' | 'tile';
    app?: 'splash';
  };
  // Splash ad specific fields
  splashFrequency?: 'once' | 'daily' | 'session' | 'always';
  splashDuration?: number; // Duration in milliseconds
  createdAt: Date;
  updatedAt: Date;
}

const AdSchema = new Schema<IAd>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 300 },
    imageUrl: { type: String, required: true, trim: true },
    linkPath: { type: String, trim: true },
    linkParams: { type: Map, of: String, default: {} },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
    placement: {
      type: Map,
      of: { type: String, enum: ['carousel', 'tile', 'splash'] },
      default: {},
    },
    splashFrequency: { 
      type: String, 
      enum: ['once', 'daily', 'session', 'always'], 
      default: 'daily' 
    },
    splashDuration: { type: Number, default: 3000 }, // 3 seconds default
  },
  { timestamps: true }
);

AdSchema.index({ isActive: 1, displayOrder: 1 });

// Transform Map to plain object when converting to JSON
AdSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.placement instanceof Map) {
      ret.placement = Object.fromEntries(ret.placement);
    }
    if (ret.linkParams instanceof Map) {
      ret.linkParams = Object.fromEntries(ret.linkParams);
    }
    return ret;
  }
});

export default mongoose.model<IAd>('Ad', AdSchema);
