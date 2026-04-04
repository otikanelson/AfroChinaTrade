import { Request, Response } from 'express';
import Tag from '../models/Tag';
import Product from '../models/Product';

/**
 * Get all active tags
 * GET /api/tags
 */
export const getTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const tags = await Tag.find({ isActive: true })
      .sort({ usageCount: -1, name: 1 })
      .select('name description usageCount');

    res.status(200).json({
      status: 'success',
      data: { tags },
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * Get all tags (admin only - includes inactive)
 * GET /api/tags/all
 */
export const getAllTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const tags = await Tag.find()
      .sort({ usageCount: -1, name: 1 });

    res.status(200).json({
      status: 'success',
      data: { tags },
    });
  } catch (error) {
    console.error('Error fetching all tags:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * Create a new tag (admin only)
 * POST /api/tags
 */
export const createTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({
        status: 'error',
        message: 'Tag name is required',
      });
      return;
    }

    const tag = await Tag.create({ name, description });

    res.status(201).json({
      status: 'success',
      data: { tag },
      message: 'Tag created successfully',
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({
        status: 'error',
        message: 'Tag already exists',
      });
      return;
    }
    console.error('Error creating tag:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * Update tag usage counts based on products
 * POST /api/tags/sync-usage
 */
export const syncTagUsage = async (req: Request, res: Response): Promise<void> => {
  try {
    const tags = await Tag.find();
    
    for (const tag of tags) {
      const count = await Product.countDocuments({ tags: tag.name });
      tag.usageCount = count;
      await tag.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Tag usage counts synced successfully',
    });
  } catch (error) {
    console.error('Error syncing tag usage:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * Delete tag (admin only)
 * DELETE /api/tags/:id
 */
export const deleteTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const tag = await Tag.findByIdAndDelete(id);
    
    if (!tag) {
      res.status(404).json({
        status: 'error',
        message: 'Tag not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Tag deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
