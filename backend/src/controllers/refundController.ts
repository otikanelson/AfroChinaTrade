import { Request, Response } from 'express';
import Refund from '../models/Refund';
import Order from '../models/Order';
import User from '../models/User';
import { notifyAdminsOfRefundRequest, createNotification, notifyAdmins } from './notificationController';
import PushDeliveryService from '../services/PushDeliveryService';

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

    // Check if order is eligible for refund
    if (order.status !== 'delivered') {
      return res.status(400).json({ 
        message: 'Only delivered orders are eligible for refunds' 
      });
    }

    // Enforce 24-hour refund window
    const deliveredAt = order.deliveredAt || order.updatedAt;
    const hoursSinceDelivery = (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceDelivery > 24) {
      return res.status(400).json({
        message: 'Refund window has expired. Refunds must be requested within 24 hours of delivery.',
        errorCode: 'REFUND_WINDOW_EXPIRED',
      });
    }

    // Check if order is already refunded
    if (order.paymentStatus === 'refunded') {
      return res.status(400).json({ 
        message: 'This order has already been refunded' 
      });
    }

    // Check if there's already a pending refund for this order
    const existingRefund = await Refund.findOne({ 
      orderId, 
      status: { $in: ['pending', 'approved'] } 
    });
    
    if (existingRefund) {
      return res.status(400).json({ 
        message: 'A refund request already exists for this order' 
      });
    }

    if (amount > order.totalAmount) {
      return res.status(400).json({ 
        message: 'Refund amount cannot exceed order total' 
      });
    }

    // Check if partial refund amount is valid
    if (type === 'partial' && amount <= 0) {
      return res.status(400).json({ 
        message: 'Partial refund amount must be greater than 0' 
      });
    }

    const refund = await Refund.create({
      orderId,
      type,
      amount: type === 'full' ? order.totalAmount : amount,
      reason,
    });

    // Get user details for notification
    const user = await User.findById(order.userId).select('name');
    const customerName = user?.name || 'Unknown Customer';
    const refundAmount = type === 'full' ? order.totalAmount : amount;

    // Populate the refund with order details for response
    const populatedRefund = await Refund.findById(refund._id)
      .populate('orderId', 'orderId totalAmount status');

    // Notify admins about new refund request
    await notifyAdmins(
      'new_refund_request',
      'New Refund Request',
      `${customerName} requested a ${type} refund for order #${order.orderId} - ₦${refundAmount.toFixed(2)}`,
      {
        refundId: refund._id,
        orderId: order._id,
        amount: refund.amount,
        type: refund.type,
      }
    );

    // Send admin alert push notification (fire-and-forget)
    (async () => {
      try {
        const adminUsers = await User.find({ role: { $in: ['admin', 'super_admin'] } }, { _id: 1 });
        const adminUserIds = adminUsers.map(u => u._id.toString());
        
        if (adminUserIds.length > 0) {
          await PushDeliveryService.send({
            userIds: adminUserIds,
            title: 'New Refund Request',
            body: `${customerName} requested a ${type} refund - ₦${refundAmount.toFixed(2)}`,
            data: { screen: 'admin-refund', refundId: refund._id.toString() },
          });
        }
      } catch (error) {
        console.error('[refundController] Error sending admin refund alert push:', error);
      }
    })();

    res.status(201).json({
      message: 'Refund request created successfully',
      refund: populatedRefund,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getRefunds = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, orderId } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    if (orderId) {
      filter.orderId = orderId;
    }

    const refunds = await Refund.find(filter)
      .populate('orderId', 'orderId totalAmount status userId')
      .populate('processedBy', 'name email')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Refund.countDocuments(filter);

    res.json({
      success: true,
      data: refunds,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const getRefundById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const refund = await Refund.findById(id)
      .populate('orderId', 'orderId totalAmount status userId items')
      .populate('processedBy', 'name email');

    if (!refund) {
      return res.status(404).json({ 
        success: false,
        message: 'Refund not found' 
      });
    }

    res.json({
      success: true,
      data: refund
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export const updateRefundStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'processed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid refund status' 
      });
    }

    const refund = await Refund.findById(id);
    if (!refund) {
      return res.status(404).json({ 
        success: false,
        message: 'Refund not found' 
      });
    }

    // Prevent status changes on already processed refunds
    if (refund.status === 'processed' && status !== 'processed') {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot change status of already processed refund' 
      });
    }

    const updateData: any = {
      status,
      processedBy: req.userId,
      processedAt: new Date(),
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    const updatedRefund = await Refund.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('orderId', 'orderId totalAmount status')
     .populate('processedBy', 'name email');

    // Update order payment status if refund is processed
    if (status === 'processed') {
      await Order.findByIdAndUpdate(refund.orderId, { 
        paymentStatus: 'refunded' 
      });
    }

    // Notify customer about status update
    const order = await Order.findById(refund.orderId).populate('userId', '_id');
    if (order && order.userId) {
      const statusMessages = {
        approved: 'Your refund request has been approved and is being processed.',
        rejected: 'Your refund request has been rejected. Please contact support for more information.',
        processed: 'Your refund has been processed successfully. The amount will be credited to your account.',
      };

      if (status !== 'pending' && statusMessages[status as keyof typeof statusMessages]) {
        await createNotification(
          (order.userId as any)._id.toString(),
          'refund_request',
          `Refund ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          statusMessages[status as keyof typeof statusMessages],
          {
            refundId: refund._id,
            orderId: order._id,
            amount: refund.amount,
            status: status,
          }
        );

        // Send customer push notification (fire-and-forget)
        (async () => {
          try {
            await PushDeliveryService.send({
              userIds: [(order.userId as any)._id.toString()],
              title: `Refund ${status.charAt(0).toUpperCase() + status.slice(1)}`,
              body: statusMessages[status as keyof typeof statusMessages],
              data: { screen: 'my-refunds', refundId: refund._id.toString() },
              settingKey: 'orderUpdates',
            });
          } catch (error) {
            console.error('[refundController] Error sending refund status push:', error);
          }
        })();
      }
    }

    res.json({
      success: true,
      message: 'Refund status updated successfully',
      data: updatedRefund,
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get refunds for a specific user (customer endpoint)
export const getUserRefunds = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, status } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // First get user's orders
    const userOrders = await Order.find({ userId }).select('_id');
    const orderIds = userOrders.map(order => order._id);

    const filter: any = { orderId: { $in: orderIds } };
    if (status) {
      filter.status = status;
    }

    const refunds = await Refund.find(filter)
      .populate('orderId', 'orderId totalAmount status')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Refund.countDocuments(filter);

    res.json({
      success: true,
      data: refunds,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Create refund request by customer
export const createRefundRequest = async (req: Request, res: Response) => {
  try {
    const { orderId, type, amount, reason } = req.body;
    const userId = req.userId;

    if (!orderId || !type || !reason) {
      return res.status(400).json({ 
        success: false,
        message: 'Order ID, type, and reason are required' 
      });
    }

    // Verify the order belongs to the user
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found or does not belong to you' 
      });
    }

    // Check if order is eligible for refund
    if (order.status !== 'delivered') {
      return res.status(400).json({ 
        success: false,
        message: 'Only delivered orders are eligible for refunds' 
      });
    }

    // Enforce 24-hour refund window from delivery confirmation
    const deliveredAt = order.deliveredAt || order.updatedAt;
    const hoursSinceDelivery = (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceDelivery > 24) {
      return res.status(400).json({
        success: false,
        message: 'Refund window has expired. Refunds must be requested within 24 hours of delivery confirmation.',
        errorCode: 'REFUND_WINDOW_EXPIRED',
      });
    }

    // Check if order is already refunded
    if (order.paymentStatus === 'refunded') {
      return res.status(400).json({ 
        success: false,
        message: 'This order has already been refunded' 
      });
    }

    // Check if there's already a pending refund for this order
    const existingRefund = await Refund.findOne({ 
      orderId, 
      status: { $in: ['pending', 'approved'] } 
    });
    
    if (existingRefund) {
      return res.status(400).json({ 
        success: false,
        message: 'A refund request already exists for this order' 
      });
    }

    // Validate refund amount
    const refundAmount = type === 'full' ? order.totalAmount : parseFloat(amount);
    
    if (type === 'partial') {
      if (!amount || isNaN(refundAmount) || refundAmount <= 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Valid amount is required for partial refunds' 
        });
      }
      
      if (refundAmount > order.totalAmount) {
        return res.status(400).json({ 
          success: false,
          message: 'Refund amount cannot exceed order total' 
        });
      }
    }

    const refund = await Refund.create({
      orderId,
      type,
      amount: refundAmount,
      reason,
    });

    // Get user details for notification
    const user = await User.findById(userId).select('name');
    const customerName = user?.name || 'Unknown Customer';

    // Notify admins about the new refund request
    await notifyAdminsOfRefundRequest(
      orderId,
      order.orderId,
      refundAmount,
      customerName
    );

    // Populate the refund with order details for response
    const populatedRefund = await Refund.findById(refund._id)
      .populate('orderId', 'orderId totalAmount status');

    // Notify admins about new refund request
    await notifyAdmins(
      'new_refund_request',
      'New Refund Request',
      `${customerName} requested a ${type} refund for order #${order.orderId} - ₦${refundAmount.toFixed(2)}`,
      {
        refundId: refund._id,
        orderId: order._id,
        amount: refund.amount,
        type: refund.type,
      }
    );

    // Send admin alert push notification (fire-and-forget)
    (async () => {
      try {
        const adminUsers = await User.find({ role: { $in: ['admin', 'super_admin'] } }, { _id: 1 });
        const adminUserIds = adminUsers.map(u => u._id.toString());
        
        if (adminUserIds.length > 0) {
          await PushDeliveryService.send({
            userIds: adminUserIds,
            title: 'New Refund Request',
            body: `${customerName} requested a ${type} refund - ₦${refundAmount.toFixed(2)}`,
            data: { screen: 'admin-refund', refundId: refund._id.toString() },
          });
        }
      } catch (error) {
        console.error('[refundController] Error sending admin refund alert push:', error);
      }
    })();

    res.status(201).json({
      success: true,
      message: 'Refund request submitted successfully',
      data: populatedRefund,
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get refund statistics for admin dashboard
export const getRefundStats = async (req: Request, res: Response) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'today':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          }
        };
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { $gte: weekAgo } };
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { $gte: monthAgo } };
        break;
      default:
        // All time - no date filter
        break;
    }

    const [totalStats, statusStats] = await Promise.all([
      Refund.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalRefunds: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            avgAmount: { $avg: '$amount' }
          }
        }
      ]),
      Refund.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ])
    ]);

    const stats = {
      total: totalStats[0] || { totalRefunds: 0, totalAmount: 0, avgAmount: 0 },
      byStatus: statusStats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          totalAmount: stat.totalAmount
        };
        return acc;
      }, {} as Record<string, { count: number; totalAmount: number }>)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
