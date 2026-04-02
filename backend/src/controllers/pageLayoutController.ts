import { Request, Response } from 'express';
import PageLayout, { ILayoutBlock, BlockType } from '../models/PageLayout';

// Default blocks for each page
const DEFAULT_HOME_BLOCKS: ILayoutBlock[] = [
  { id: 'featured', type: 'featured_products', label: 'Featured Products', enabled: true, order: 0 },
  { id: 'ad_carousel', type: 'ad_carousel', label: 'Ad Carousel', enabled: true, order: 1 },
  { id: 'promo_tiles', type: 'promo_tiles', label: 'Promo Tiles', enabled: true, order: 2 },
  { id: 'trending', type: 'trending_products', label: 'Trending Products', enabled: true, order: 3 },
  { id: 'new_arrivals', type: 'new_arrivals', label: 'New Arrivals', enabled: true, order: 4 },
  { id: 'recommendations', type: 'recommendations', label: 'Recommended for You', enabled: true, order: 5 },
];

const DEFAULT_BUY_NOW_BLOCKS: ILayoutBlock[] = [
  { id: 'featured', type: 'featured_products', label: 'Featured Products', enabled: true, order: 0 },
  { id: 'seller_favorites', type: 'seller_favorites', label: 'Seller Favorites', enabled: true, order: 1 },
  { id: 'discounted', type: 'discounted_products', label: 'Special Discounts', enabled: true, order: 2 },
  { id: 'recommendations', type: 'recommendations', label: 'Recommended for You', enabled: true, order: 3 },
  { id: 'trending', type: 'trending_products', label: 'Trending Products', enabled: true, order: 4 },
  { id: 'ad_carousel', type: 'ad_carousel', label: 'Ad Carousel', enabled: true, order: 5 },
  { id: 'promo_tiles', type: 'promo_tiles', label: 'Promo Tiles', enabled: true, order: 6 },
  { id: 'all_products', type: 'new_arrivals', label: 'Browse All Products', enabled: true, order: 7 },
];

export const getPageLayout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page } = req.params as { page: 'home' | 'buy-now' };
    let layout = await PageLayout.findOne({ page });

    if (!layout) {
      // Auto-create default layout
      const defaults = page === 'home' ? DEFAULT_HOME_BLOCKS : DEFAULT_BUY_NOW_BLOCKS;
      layout = await PageLayout.create({ page, blocks: defaults });
    }

    res.json({ success: true, data: layout });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Failed to fetch layout' } });
  }
};

export const updatePageLayout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page } = req.params as { page: 'home' | 'buy-now' };
    const { blocks } = req.body as { blocks: ILayoutBlock[] };

    if (!Array.isArray(blocks)) {
      res.status(400).json({ success: false, error: { message: 'blocks must be an array' } });
      return;
    }

    const layout = await PageLayout.findOneAndUpdate(
      { page },
      { blocks, updatedBy: req.userId },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: layout });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Failed to update layout' } });
  }
};

export const resetPageLayout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page } = req.params as { page: 'home' | 'buy-now' };
    const defaults = page === 'home' ? DEFAULT_HOME_BLOCKS : DEFAULT_BUY_NOW_BLOCKS;
    const layout = await PageLayout.findOneAndUpdate(
      { page },
      { blocks: defaults, updatedBy: req.userId },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: layout });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: 'Failed to reset layout' } });
  }
};
