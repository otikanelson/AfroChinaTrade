import mongoose, { Document, Schema } from 'mongoose';

export interface IDeliveryAddress extends Document {
  userId: mongoose.Types.ObjectId;
  name?: string; // Custom name for the address (e.g., "Mom's House", "Office", "Apartment")
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  
  // Address details
  addressLine1: string;
  addressLine2?: string;
  city: string; // LGA (Local Government Area)
  state: string;
  country: string;
  postalCode?: string;
  
  // Device location (GPS coordinates)
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  
  // Additional details
  landmark?: string;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const deliveryAddressSchema = new Schema<IDeliveryAddress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    trim: true,
    maxlength: 50
  },
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  addressLine1: {
    type: String,
    required: true,
    trim: true
  },
  addressLine2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'Nigeria'
  },
  postalCode: {
    type: String,
    trim: true
  },
  location: {
    latitude: {
      type: Number,
      required: false
    },
    longitude: {
      type: Number,
      required: false
    },
    accuracy: {
      type: Number,
      required: false
    }
  },
  landmark: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one default address per user
deliveryAddressSchema.pre('save', async function() {
  if (this.isDefault && this.isModified('isDefault')) {
    await mongoose.model('DeliveryAddress').updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
});

export default mongoose.model<IDeliveryAddress>('DeliveryAddress', deliveryAddressSchema);