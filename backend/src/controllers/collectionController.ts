import { Request, Response } from 'express';
import { collectionService } from '../services/CollectionService';
import { CollectionFilter } from '../models/Collection';
import PushDeliveryService from '../services/PushDeliveryService';
import User from '../models/User';

/**
 * Create a new collection
 * POST /api/collections
 */
export const createCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, filters, displayOrder } = req.body;
    const createdBy = req.userId;

    if (!createdBy) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
      return;
    }

    if (!name || !filters || !Array.isArray(filters)) {
      res.status(400).json({
        status: 'error',
        message: 'Name and filters are required'
      });
      return;
    }

    const result = await collectionService.createCollection(
      name,
      filters as CollectionFilter[],
      createdBy,
      description,
      displayOrder
    );

    res.status(result.status === 'success' ? 201 : 400).json(result);
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Get all active collections
 * GET /api/collections
 */
export const getCollections = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await collectionService.getActiveCollections();
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Get products for a specific collection
 * GET /api/collections/:id/products
 */
export const getCollectionProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 20));

    const result = await collectionService.getCollectionProducts(id, pageNum, limitNum);
    
    res.status(result.status === 'success' ? 200 : 404).json(result);
  } catch (error) {
    console.error('Error fetching collection products:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Update collection
 * PUT /api/collections/:id
 */
export const updateCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await collectionService.updateCollection(id, updates);
    
    res.status(result.status === 'success' ? 200 : 404).json(result);
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Delete collection
 * DELETE /api/collections/:id
 */
export const deleteCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await collectionService.deleteCollection(id);
    
    res.status(result.status === 'success' ? 200 : 404).json(result);
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

/**
 * Toggle collection status
 * PATCH /api/collections/:id/status
 */
export const toggleCollectionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await collectionService.toggleCollectionStatus(id);
    
    // If collection was toggled to active, send push notification to all users
    if (result.status === 'success' && result.data?.collection?.isActive) {
      // Fire-and-forget push notification - don't await, don't block response
      (async () => {
        try {
          const collection = result.data.collection;
          if (!collection) return;
          
          // Get all user IDs
          const users = await User.find({}, { _id: 1 }).lean();
          const userIds = users.map(u => u._id.toString());

          if (userIds.length > 0) {
            await PushDeliveryService.send({
              userIds,
              title: `New Collection: ${collection.name}`,
              body: collection.description || 'Check out our new collection!',
              data: {
                screen: 'collection',
                collectionId: collection._id.toString(),
              },
              settingKey: 'promotions',
            });
          }
        } catch (pushError) {
          console.error('[toggleCollectionStatus] Push notification failed:', pushError);
        }
      })();
    }
    
    res.status(result.status === 'success' ? 200 : 404).json(result);
  } catch (error) {
    console.error('Error toggling collection status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};