import mongoose, { Document, Schema } from 'mongoose';

export interface IAppReview extends Document {
  userId: mongoose.Types.ObjectId;
  rating: number; // 1-5 stars
  title?: string;
  comment?: string;
  category: 'general' | 'feature_request' | 'bug_report' | 'ui_feedback';
  
  // App version info
  appVersion?: string;
  platform?: 'ios' | 'android';
  deviceInfo?: string;
  
  // Admin response
  adminResponse?: string;
  adminId?: mongoose.Types.ObjectId;
  
  isPublic: boolean; // Whether to show in public reviews
  isHelpful: boolean; // Admin flag for helpful reviews
  
  createdAt: Date;
  updatedAt: Date;
}

const appReviewSchema = new Schema<IAppReview>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    enum: ['general', 'feature_request', 'bug_report', 'ui_feedback'],
    default: 'general'
  },
  appVersion: {
    type: String,
    trim: true
  },
  platform: {
    type: String,
    enum: ['ios', 'android']
  },
  deviceInfo: {
    type: String,
    trim: true
  },
  adminResponse: {
    type: String,
    maxlength: 500
  },
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isHelpful: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
appReviewSchema.index({ rating: -1, createdAt: -1 });
appReviewSchema.index({ isPublic: 1, isHelpful: -1 });

export default mongoose.model<IAppReview>('AppReview', appReviewSchema);