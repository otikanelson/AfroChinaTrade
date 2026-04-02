import mongoose, { Schema, Document } from 'mongoose';

export type BlockType =
  | 'featured_products'
  | 'trending_products'
  | 'seller_favorites'
  | 'discounted_products'
  | 'new_arrivals'
  | 'recommendations'
  | 'collection'
  | 'ad_carousel'
  | 'promo_tiles';

export interface ILayoutBlock {
  id: string;           // unique within the layout
  type: BlockType;
  label: string;        // display name shown in admin
  enabled: boolean;
  order: number;
  config?: {
    collectionId?: string;   // for 'collection' blocks
    collectionName?: string; // display label
  };
}

export interface IPageLayout extends Document {
  page: 'home' | 'buy-now';
  blocks: ILayoutBlock[];
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LayoutBlockSchema = new Schema<ILayoutBlock>({
  id: { type: String, required: true },
  type: { type: String, required: true },
  label: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  order: { type: Number, required: true },
  config: {
    collectionId: String,
    collectionName: String,
  },
}, { _id: false });

const PageLayoutSchema = new Schema<IPageLayout>(
  {
    page: { type: String, enum: ['home', 'buy-now'], required: true, unique: true },
    blocks: [LayoutBlockSchema],
    updatedBy: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IPageLayout>('PageLayout', PageLayoutSchema);
