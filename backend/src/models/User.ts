import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Address subdocument interface
export interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  landmark?: string;
  locationSummary?: string;
}

// Notification settings interface
export interface INotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  newProducts: boolean;
  priceDrops: boolean;
  newsletter: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

// User document interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'customer' | 'admin' | 'super_admin';
  status: 'active' | 'suspended' | 'blocked';
  suspensionReason?: string;
  suspensionDuration?: Date;
  blockReason?: string;
  supportTickets?: mongoose.Types.ObjectId[];
  addresses: IAddress[];
  avatar?: string;
  notificationSettings: INotificationSettings;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Address subdocument schema
const AddressSchema = new Schema<IAddress>({
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  landmark: {
    type: String,
  },
  locationSummary: {
    type: String,
  },
}, { _id: false });

// Notification settings schema
const NotificationSettingsSchema = new Schema<INotificationSettings>({
  orderUpdates: {
    type: Boolean,
    default: true,
  },
  promotions: {
    type: Boolean,
    default: true,
  },
  newProducts: {
    type: Boolean,
    default: false,
  },
  priceDrops: {
    type: Boolean,
    default: true,
  },
  newsletter: {
    type: Boolean,
    default: false,
  },
  pushNotifications: {
    type: Boolean,
    default: true,
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  smsNotifications: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

// User schema
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      validate: {
        validator: function(password: string) {
          // Password must contain at least one uppercase, one lowercase, one number, and one special character
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
        },
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      },
      select: false, // Don't include password in queries by default
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: ['customer', 'admin', 'super_admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'customer',
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'suspended', 'blocked'],
        message: '{VALUE} is not a valid status',
      },
      default: 'active',
    },
    suspensionReason: {
      type: String,
      trim: true,
    },
    suspensionDuration: {
      type: Date,
    },
    blockReason: {
      type: String,
      trim: true,
    },
    supportTickets: [{
      type: Schema.Types.ObjectId,
      ref: 'HelpTicket'
    }],
    addresses: {
      type: [AddressSchema],
      default: [],
    },
    avatar: {
      type: String,
    },
    notificationSettings: {
      type: NotificationSettingsSchema,
      default: () => ({}), // Will use schema defaults
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes
// Compound index on role and status for efficient queries
UserSchema.index({ role: 1, status: 1 });

// Pre-save hook to hash password
UserSchema.pre<IUser>('save', async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }

  // Generate salt and hash password with higher cost factor for better security
  const salt = await bcrypt.genSalt(12); // Increased from 10 to 12
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password for authentication
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Create and export the User model
const User = mongoose.model<IUser>('User', UserSchema);

export default User;
