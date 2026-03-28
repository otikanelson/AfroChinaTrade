import { Request, Response } from 'express';
import Order from '../models/Order';
import Refund from '../models/Refund';
import Product from '../models/Product';

export const getRevenue = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const filter: any = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    let groupFormat = '%Y-%m-%d';
    if (groupBy === 'week') groupFormat = '%Y-W%V';
    if (groupBy === 'month') groupFormat = '%Y-%m';

    const revenue = await Order.aggregate([
      { $match: { ...filter, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const refunds = await Refund.aggregate([
      { $match: { ...filter, status: 'processed' } },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const refundMap = new Map(refunds.map((r) => [r._id, r.total]));

    const netRevenue = revenue.map((r) => ({
      date: r._id,
      gross: r.total,
      refunded: refundMap.get(r._id) || 0,
      net: r.total - (refundMap.get(r._id) || 0),
      orders: r.count,
    }));

    res.json(netRevenue);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const filter: any = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const stats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalOrders = await Order.countDocuments(filter);
    const totalRevenue = await Order.aggregate([
      { $match: { ...filter, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      byStatus: stats,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductStats = async (req: Request, res: Response) => {
  try {
    const topProducts = await Product.find({ isActive: true })
      .sort({ reviewCount: -1, rating: -1 })
      .limit(10);

    const lowStockProducts = await Product.find({ stock: { $lt: 10 }, isActive: true }).limit(10);

    const stats = {
      totalProducts: await Product.countDocuments({ isActive: true }),
      topProducts,
      lowStockProducts,
    };

    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMostSoldProducts = async (req: Request, res: Response) => {
  try {
    const { limit = 20, timeframe = '30d' } = req.query;
    
    // Calculate date filter based on timeframe
    let dateFilter: any = {};
    const now = new Date();
    
    switch (timeframe) {
      case '7d':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
      case 'all':
      default:
        dateFilter = {}; // No date filter for 'all'
        break;
    }

    // Aggregate orders to find most sold products
    const mostSoldProducts = await Order.aggregate([
      {
        $match: {
          status: { $in: ['delivered', 'shipped', 'processing'] },
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalQuantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: parseInt(limit as string) },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $match: {
          'product.isActive': true
        }
      },
      {
        $project: {
          _id: 0,
          id: '$product._id',
          name: '$product.name',
          description: '$product.description',
          price: '$product.price',
          currency: '$product.currency',
          images: '$product.images',
          category: '$product.category',
          subcategory: '$product.subcategory',
          rating: '$product.rating',
          reviewCount: '$product.reviewCount',
          stock: '$product.stock',
          tags: '$product.tags',
          specifications: '$product.specifications',
          discount: '$product.discount',
          isNew: '$product.isNewProduct',
          isFeatured: '$product.isFeatured',
          isActive: '$product.isActive',
          viewCount: '$product.viewCount',
          isSellerFavorite: '$product.isSellerFavorite',
          trendingScore: '$product.trendingScore',
          lastViewedAt: '$product.lastViewedAt',
          // Sales metrics
          totalQuantitySold: 1,
          totalRevenue: 1,
          orderCount: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: mostSoldProducts,
      metadata: {
        timeframe,
        limit: parseInt(limit as string),
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Error getting most sold products:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
