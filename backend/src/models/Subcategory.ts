import mongoose, { Schema, Document } from 'mongoose';

// Subcategory document interface
export interface ISubcategory extends Document {
  name: string;
  description?: string;
  categoryId: mongoose.Types.ObjectId;
  categoryName: string; // Denormalized for easier queries
  icon?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Subcategory schema
const SubcategorySchema = new Schema<ISubcategory>(
  {
    name: {
      type: String,
      required: [true, 'Subcategory name is required'],
      trim: true,
      minlength: [2, 'Subcategory name must be at least 2 characters'],
      maxlength: [100, 'Subcategory name must not exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must not exceed 500 characters'],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category ID is required'],
    },
    categoryName: {
      type: String,
      required: [true, 'Category name is required'],
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
// Compound index on categoryId and name for uniqueness within category
SubcategorySchema.index({ categoryId: 1, name: 1 }, { unique: true });

// Index on categoryId for efficient category-based queries
SubcategorySchema.index({ categoryId: 1 });

// Index on categoryName for denormalized queries
SubcategorySchema.index({ categoryName: 1 });

// Index on isActive for filtering active subcategories
SubcategorySchema.index({ isActive: 1 });

// Compound index for active subcategories by category
SubcategorySchema.index({ categoryId: 1, isActive: 1 });

// Create and export the Subcategory model
const Subcategory = mongoose.model<ISubcategory>('Subcategory', SubcategorySchema);

export default Subcategory;