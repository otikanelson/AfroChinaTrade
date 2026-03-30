import Collection, { ICollection, CollectionFilter } from '../models/Collection';
import Product from '../models/Product';
import mongoose from 'mongoose';

interface CollectionWithProducts extends ICollection {
  products: any[];
  productCount: number;
}

interface CollectionResponse {
  status: 'success' | 'error';
  data: {
    collections?: ICollection[];
    collection?: CollectionWithProducts;
    products?: any[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message?: string;
}

export class CollectionService {
  /**
   * Create a new collection
   */
  async createCollection(
    name: string,
    filters: CollectionFilter[],
    createdBy: string,
    description?: string,
    displayOrder?: number
  ): Promise<CollectionResponse> {
    try {
      const collection = new Collection({
        name,
        description,
        filters,
        createdBy,
        displayOrder: displayOrder || 0
      });

      await collection.save();

      return {
        status: 'success',
        data: { collection: collection as any },
        message: 'Collection created successfully'
      };
    } catch (error: any) {
      if (error.code === 11000) {
        return {
          status: 'error',
          data: {},
          message: 'Collection name already exists'
        };
      }
      throw error;
    }
  }

  /**
   * Get all active collections
   */
  async getActiveCollections(): Promise<CollectionResponse> {
    try {
      const collections = await Collection.find({ isActive: true })
        .sort({ displayOrder: 1, createdAt: -1 })
        .populate('createdBy', 'name email');

      return {
        status: 'success',
        data: { collections }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get products for a specific collection
   */
  async getCollectionProducts(
    collectionId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<CollectionResponse> {
    try {
      const collection = await Collection.findById(collectionId);
      if (!collection) {
        return {
          status: 'error',
          data: {},
          message: 'Collection not found'
        };
      }

      const skip = (page - 1) * limit;
      const query = this.buildProductQuery(collection.filters);

      const [products, total] = await Promise.all([
        Product.find(query)
          .sort({ createdAt: -1, viewCount: -1 })
          .skip(skip)
          .limit(limit)
          .populate('supplierId', 'name logo'),
        Product.countDocuments(query)
      ]);

      const pagination = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      };

      return {
        status: 'success',
        data: {
          collection: { ...collection.toObject(), products, productCount: total } as any,
          products,
          pagination
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Build MongoDB query from collection filters
   */
  private buildProductQuery(filters: CollectionFilter[]): any {
    const query: any = { isActive: true };

    filters.forEach(filter => {
      switch (filter.type) {
        case 'category':
          query.category = filter.value;
          break;
        
        case 'name_contains':
          query.name = { $regex: filter.value, $options: 'i' };
          break;
        
        case 'tag':
          if (Array.isArray(filter.value)) {
            query.tags = { $in: filter.value };
          } else {
            query.tags = { $in: [filter.value] };
          }
          break;
        
        case 'price_range':
          if (typeof filter.value === 'object' && filter.value !== null) {
            const range = filter.value as { min?: number; max?: number };
            if (range.min !== undefined) query.price = { ...query.price, $gte: range.min };
            if (range.max !== undefined) query.price = { ...query.price, $lte: range.max };
          }
          break;
        
        case 'rating_min':
          query.rating = { $gte: filter.value };
          break;
        
        case 'discount_min':
          query.discount = { $gte: filter.value };
          break;
        
        case 'supplier':
          query.supplierId = filter.value;
          break;
      }
    });

    return query;
  }

  /**
   * Update collection
   */
  async updateCollection(
    collectionId: string,
    updates: Partial<ICollection>
  ): Promise<CollectionResponse> {
    try {
      const collection = await Collection.findByIdAndUpdate(
        collectionId,
        updates,
        { new: true, runValidators: true }
      );

      if (!collection) {
        return {
          status: 'error',
          data: {},
          message: 'Collection not found'
        };
      }

      return {
        status: 'success',
        data: { collection: collection as any },
        message: 'Collection updated successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete collection
   */
  async deleteCollection(collectionId: string): Promise<CollectionResponse> {
    try {
      const collection = await Collection.findByIdAndDelete(collectionId);
      
      if (!collection) {
        return {
          status: 'error',
          data: {},
          message: 'Collection not found'
        };
      }

      return {
        status: 'success',
        data: {},
        message: 'Collection deleted successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle collection status
   */
  async toggleCollectionStatus(collectionId: string): Promise<CollectionResponse> {
    try {
      const collection = await Collection.findById(collectionId);
      
      if (!collection) {
        return {
          status: 'error',
          data: {},
          message: 'Collection not found'
        };
      }

      collection.isActive = !collection.isActive;
      await collection.save();

      return {
        status: 'success',
        data: { collection: collection as any },
        message: `Collection ${collection.isActive ? 'activated' : 'deactivated'} successfully`
      };
    } catch (error) {
      throw error;
    }
  }
}

export const collectionService = new CollectionService();