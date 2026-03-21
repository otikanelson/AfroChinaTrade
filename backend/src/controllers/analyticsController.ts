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
