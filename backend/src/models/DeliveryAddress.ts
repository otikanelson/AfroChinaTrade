import mongoose, { Document, Schema } from 'mongoose';

export interface IDeliveryAddress extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
  
  // Address details
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  
  // Additional details
  landmark?: string;
  deliveryInstructions?: string;
  
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
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
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
    default: 'Ghana'
  },
  postalCode: {
    type: String,
    trim: true
  },
  landmark: {
    type: String,
    trim: true
  },
  deliveryInstructions: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one default address per user
deliveryAddressSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await mongoose.model('DeliveryAddress').updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

export default mongoose.model<IDeliveryAddress>('DeliveryAddress', deliveryAddressSchema);