import mongoose, { Schema, Document } from 'mongoose';

// Collection filter interface
export interface CollectionFilter {
  type: 'category' | 'name_contains' | 'tag' | 'price_range' | 'rating_min' | 'discount_min' | 'supplier';
  value: string | number | { min?: number; max?: number };
  operator?: 'equals' | 'contains' | 'gte' | 'lte' | 'in';
}

// Collection document interface
export interface ICollection extends Document {
  name: string;
  description?: string;
  filters: CollectionFilter[];
  isActive: boolean;
  displayOrder: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  // Computed fields
  productCount?: number;
  lastUpdated?: Date;
}

// Collection schema
const CollectionSchema = new Schema<ICollection>(
  {
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
      minlength: [3, 'Collection name must be at least 3 characters'],
      maxlength: [100, 'Collection name must not exceed 100 characters'],
      unique: true
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must not exceed 500 characters']
    },
    filters: [{
      type: {
        type: String,
        required: true,
        enum: ['category', 'name_contains', 'tag', 'price_range', 'rating_min', 'discount_min', 'supplier']
      },
      value: {
        type: Schema.Types.Mixed,
        required: true
      },
      operator: {
        type: String,
        enum: ['equals', 'contains', 'gte', 'lte', 'in'],
        default: 'equals'
      }
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
CollectionSchema.index({ isActive: 1, displayOrder: 1 });
CollectionSchema.index({ createdBy: 1 });
CollectionSchema.index({ name: 1 });

// Virtual for product count (computed when needed)
CollectionSchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'collections',
  count: true
});

export const Collection = mongoose.model<ICollection>('Collection', CollectionSchema);
export default Collection;