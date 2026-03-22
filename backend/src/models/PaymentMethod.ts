import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentMethod extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'card' | 'mobile_money' | 'bank_transfer' | 'paypal';
  isDefault: boolean;
  
  // Card details (encrypted/tokenized in production)
  cardDetails?: {
    last4: string;
    brand: string; // visa, mastercard, etc.
    expiryMonth: number;
    expiryYear: number;
    holderName: string;
  };
  
  // Mobile money details
  mobileMoneyDetails?: {
    provider: string; // MTN, Vodafone, AirtelTigo, etc.
    phoneNumber: string;
    accountName: string;
  };
  
  // Bank transfer details
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    routingNumber?: string;
  };
  
  // PayPal details
  paypalDetails?: {
    email: string;
  };
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const paymentMethodSchema = new Schema<IPaymentMethod>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['card', 'mobile_money', 'bank_transfer', 'paypal'],
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  cardDetails: {
    last4: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number,
    holderName: String
  },
  mobileMoneyDetails: {
    provider: String,
    phoneNumber: String,
    accountName: String
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountName: String,
    routingNumber: String
  },
  paypalDetails: {
    email: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one default payment method per user
paymentMethodSchema.pre('save', async function() {
  if (this.isDefault && this.isModified('isDefault')) {
    await mongoose.model('PaymentMethod').updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
});

export default mongoose.model<IPaymentMethod>('PaymentMethod', paymentMethodSchema);