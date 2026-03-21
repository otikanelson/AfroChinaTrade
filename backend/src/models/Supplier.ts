import mongoose, { Schema, Document } from 'mongoose';

// Supplier document interface
export interface ISupplier extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  location: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  responseTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Supplier schema
const SupplierSchema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Supplier email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Supplier phone is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Supplier address is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Supplier location is required'],
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be between 0 and 5'],
      max: [5, 'Rating must be between 0 and 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative'],
    },
    responseTime: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes
// Unique index on email (already enforced by unique: true, but explicit for clarity)
SupplierSchema.index({ email: 1 }, { unique: true });

// Index on name for searching suppliers
SupplierSchema.index({ name: 1 });

// Index on verified for filtering verified suppliers
SupplierSchema.index({ verified: 1 });

// Create and export the Supplier model
const Supplier = mongoose.model<ISupplier>('Supplier', SupplierSchema);

export default Supplier;
