import mongoose, { Schema, Document } from 'mongoose';

// Order item subdocument interface
export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
}

// Delivery address subdocument interface
export interface IDeliveryAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

// Order document interface
export interface IOrder extends Document {
  orderId: string;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  deliveryAddress: IDeliveryAddress;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  trackingNumber?: string;
  notes?: string;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Order item subdocument schema
const OrderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productImage: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be a positive number'],
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal must be a positive number'],
  },
}, { _id: false });

// Delivery address subdocument schema
const DeliveryAddressSchema = new Schema<IDeliveryAddress>({
  street: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true,
  },
}, { _id: false });

// Order schema
const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      unique: true,
      required: false, // Will be auto-generated in pre-save hook
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    items: {
      type: [OrderItemSchema],
      required: [true, 'Order items are required'],
      validate: {
        validator: function (items: IOrderItem[]) {
          return items.length > 0;
        },
        message: 'Order must contain at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount must be a positive number'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        message: '{VALUE} is not a valid order status',
      },
      default: 'pending',
    },
    deliveryAddress: {
      type: DeliveryAddressSchema,
      required: [true, 'Delivery address is required'],
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'completed', 'failed', 'refunded'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'pending',
    },
    trackingNumber: {
      type: String,
      trim: true,
      minlength: [8, 'Tracking number must be at least 8 characters'],
      maxlength: [40, 'Tracking number cannot exceed 40 characters'],
    },
    notes: {
      type: String,
      trim: true,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Pre-save hook to generate orderId
OrderSchema.pre<IOrder>('save', function () {
  // Only generate orderId if it's a new document and orderId is not set
  if (this.isNew && !this.orderId) {
    // Generate a random 6-digit number
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    this.orderId = `ORD-${randomNum}`;
  }
});

// Indexes
// Unique index on orderId
OrderSchema.index({ orderId: 1 }, { unique: true });

// Compound index on userId and createdAt for user order history queries
OrderSchema.index({ userId: 1, createdAt: -1 });

// Compound index on status and createdAt for filtering orders by status
OrderSchema.index({ status: 1, createdAt: -1 });

// Create and export the Order model
const Order = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
