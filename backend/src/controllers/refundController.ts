import { Request, Response } from 'express';
import Refund from '../models/Refund';
import Order from '../models/Order';

export const createRefund = async (req: Request, res: Response) => {
  try {
    const { orderId, type, amount, reason } = req.body;

    if (!orderId || !type || !amount || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (amount > order.totalAmount) {
      return res.status(400).json({ message: 'Refund amount cannot exceed order total' });
    }

    const refund = await Refund.create({
      orderId,
      type,
      amount,
      reason,
    });

    res.status(201).json({
      message: 'Refund created successfully',
      refund,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getRefunds = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const refunds = await Refund.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Refund.countDocuments(filter);

    res.json({
      refunds,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getRefundById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const refund = await Refund.findById(id);

    if (!refund) {
      return res.status(404).json({ message: 'Refund not found' });
    }

    res.json(refund);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRefundStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'processed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid refund status' });
    }

    const refund = await Refund.findByIdAndUpdate(
      id,
      {
        status,
        processedBy: req.userId,
        processedAt: new Date(),
      },
      { new: true }
    );

    if (!refund) {
      return res.status(404).json({ message: 'Refund not found' });
    }

    if (status === 'processed') {
      await Order.findByIdAndUpdate(refund.orderId, { paymentStatus: 'refunded' });
    }

    res.json({
      message: 'Refund status updated successfully',
      refund,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
