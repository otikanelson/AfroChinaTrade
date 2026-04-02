import { Request, Response } from 'express';
import Ad from '../models/Ad';

// GET /api/ads — public, returns active ads ordered by displayOrder
// Optional query: ?placement=home|buy-now|product-detail&adType=carousel|tile
export const getAds = async (req: Request, res: Response): Promise<void> => {
  try {
    const { placement, adType } = req.query;
    const filter: any = { isActive: true };
    
    if (placement && placement !== 'all') {
      // Match ads that have the requested placement key
      const placementKey = `placement.${placement}`;
      filter[placementKey] = { $exists: true };
      
      // If adType is specified, also filter by the type for that placement
      if (adType) {
        filter[placementKey] = adType;
      }
    }
    
    const ads = await Ad.find(filter).sort({ displayOrder: 1, createdAt: -1 });
    res.json({ success: true, data: ads });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to fetch ads' } });
  }
};

// POST /api/ads — admin only
export const createAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, imageUrl, linkPath, linkParams, displayOrder, isActive, placement } = req.body;
    if (!title || !imageUrl) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'title and imageUrl are required' } });
      return;
    }
    const ad = await Ad.create({ 
      title, 
      description, 
      imageUrl, 
      linkPath, 
      linkParams, 
      displayOrder: displayOrder ?? 0,
      isActive: isActive ?? true,
      placement: placement || {}
    });
    res.status(201).json({ success: true, data: ad });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to create ad' } });
  }
};

// PUT /api/ads/:id — admin only
export const updateAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ad) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ad not found' } });
      return;
    }
    res.json({ success: true, data: ad });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to update ad' } });
  }
};

// DELETE /api/ads/:id — admin only
export const deleteAd = async (req: Request, res: Response): Promise<void> => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    if (!ad) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ad not found' } });
      return;
    }
    res.json({ success: true, message: 'Ad deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Failed to delete ad' } });
  }
};
