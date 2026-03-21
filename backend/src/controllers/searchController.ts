import { Request, Response } from 'express';
import Product from '../models/Product';
import Order from '../models/Order';
import User from '../models/User';

export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q, categories, minPrice, maxPrice, minRating, inStock, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { isActive: true };

    // Full-text search on name and description
    if (q) {
      filter.$text = { $search: q as string };
    }

    // Multiple category filtering
    if (categories) {
      const categoryArray = Array.isArray(categories) ? categories : [categories];
      filter.category = { $in: categoryArray };
    }

    // Price range filtering
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice as string);
    }

    // Minimum rating filtering
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating as string) };
    }

    // Stock availability filtering
    if (inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    let query = Product.find(filter).skip(skip).limit(limitNum);

    // Search result ranking based on relevance score
    if (q) {
      query = query.sort({ score: { $meta: 'textScore' } });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const products = await query;
    const total = await Product.countDocuments(filter);

    // Return empty array when no results match
    res.json({
      success: true,
      data: {
        products: products || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: {
        code: 'SEARCH_ERROR',
        message: error.message 
      }
    });
  }
};

export const searchOrders = async (req: Request, res: Response) => {
  try {
    const { q, startDate, endDate, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    let filter: any = {};

    // Search by order number, customer name, or customer email
    if (q) {
      // First, try to find users by name or email to get their IDs
      const users = await User.find({
        $or: [
          { name: { $regex: q as string, $options: 'i' } },
          { email: { $regex: q as string, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(user => user._id);

      filter.$or = [
        { orderId: { $regex: q as string, $options: 'i' } },
        { 'deliveryAddress.fullName': { $regex: q as string, $options: 'i' } },
        ...(userIds.length > 0 ? [{ userId: { $in: userIds } }] : [])
      ];
    }

    // Date range filtering
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    // Return results with pagination including total count and page info
    res.json({
      success: true,
      data: {
        orders: orders || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: {
        code: 'ORDER_SEARCH_ERROR',
        message: error.message 
      }
    });
  }
};
