import mongoose, { Schema, Document } from 'mongoose';

// Category document interface
export interface ICategory extends Document {
  name: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  subcategories: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Category schema
const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    subcategories: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes
// Unique index on name (already enforced by unique: true, but explicit for clarity)
CategorySchema.index({ name: 1 }, { unique: true });

// Index on isActive for filtering active categories
CategorySchema.index({ isActive: 1 });

// Create and export the Category model
const Category = mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
