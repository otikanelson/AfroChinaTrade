import { Request, Response } from 'express';
import mongoose from 'mongoose';
import HelpTicket from '../models/HelpTicket';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Create a new help ticket
export const createTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { subject, category, description, priority = 'medium', isSuspensionAppeal = false, appealReason } = req.body;

    if (!subject || !category || !description) {
      return res.status(400).json({
        status: 'error',
        message: 'Subject, category, and description are required',
        errorCode: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const validCategories = ['order', 'payment', 'product', 'account', 'technical', 'suspension_appeal', 'other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid category',
        errorCode: 'INVALID_CATEGORY'
      });
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid priority',
        errorCode: 'INVALID_PRIORITY'
      });
    }

    // If it's a suspension appeal, validate additional fields
    if (isSuspensionAppeal || category === 'suspension_appeal') {
      if (!appealReason) {
        return res.status(400).json({
          status: 'error',
          message: 'Appeal reason is required for suspension appeals',
          errorCode: 'APPEAL_REASON_REQUIRED'
        });
      }

      // Verify user is actually suspended
      const user = await User.findById(req.userId);
      if (!user || user.status !== 'suspended') {
        return res.status(400).json({
          status: 'error',
          message: 'Only suspended users can create suspension appeals',
          errorCode: 'NOT_SUSPENDED'
        });
      }
    }

    const ticket = new HelpTicket({
      userId: req.userId,
      subject,
      category: isSuspensionAppeal ? 'suspension_appeal' : category,
      description,
      priority,
      isSuspensionAppeal: isSuspensionAppeal || category === 'suspension_appeal',
      appealReason: isSuspensionAppeal || category === 'suspension_appeal' ? appealReason : undefined
    });

    await ticket.save();

    // Add ticket reference to user
    await User.findByIdAndUpdate(req.userId, {
      $push: { supportTickets: ticket._id }
    });

    res.status(201).json({
      status: 'success',
      message: 'Ticket created successfully',
      data: ticket
    });
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      errorCode: 'TICKET_CREATION_ERROR'
    });
  }
};

// Get user's tickets
export const getUserTickets = async (req: AuthRequest, res: Response) => {
  try {
    const tickets = await HelpTicket.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .populate('adminId', 'name email');

    res.json({
      status: 'success',
      data: tickets
    });
  } catch (error: any) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      errorCode: 'TICKETS_FETCH_ERROR'
    });
  }
};

// Get ticket by ID
export const getTicketById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ticket ID',
        errorCode: 'INVALID_TICKET_ID'
      });
    }

    const ticket = await HelpTicket.findById(id)
      .populate('userId', 'name email')
      .populate('adminId', 'name email');

    if (!ticket) {
      return res.status(404).json({
        status: 'error',
        message: 'Ticket not found',
        errorCode: 'TICKET_NOT_FOUND'
      });
    }

    // Check if user owns the ticket or is admin
    if (ticket.userId.toString() !== req.userId && req.userRole !== 'admin' && req.userRole !== 'super_admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied',
        errorCode: 'ACCESS_DENIED'
      });
    }

    res.json({
      status: 'success',
      data: ticket
    });
  } catch (error: any) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      errorCode: 'TICKET_FETCH_ERROR'
    });
  }
};

// Admin: Get all tickets
export const getAllTickets = async (req: AuthRequest, res: Response) => {
  try {
    const { status, category, priority, page = 1, limit = 20 } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const skip = (Number(page) - 1) * Number(limit);

    const tickets = await HelpTicket.find(filter)
      .populate('userId', 'name email status')
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await HelpTicket.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        tickets,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching all tickets:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      errorCode: 'TICKETS_FETCH_ERROR'
    });
  }
};

// Admin: Update ticket status and respond
export const updateTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminResponse, unsuspendUser = false } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid ticket ID',
        errorCode: 'INVALID_TICKET_ID'
      });
    }

    const ticket = await HelpTicket.findById(id).populate('userId');
    if (!ticket) {
      return res.status(404).json({
        status: 'error',
        message: 'Ticket not found',
        errorCode: 'TICKET_NOT_FOUND'
      });
    }

    const updateData: any = {};
    if (status) {
      const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid status',
          errorCode: 'INVALID_STATUS'
        });
      }
      updateData.status = status;
    }

    if (adminResponse) {
      updateData.adminResponse = adminResponse;
      updateData.adminId = req.userId;
    }

    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    const updatedTicket = await HelpTicket.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('userId', 'name email').populate('adminId', 'name email');

    // If this is a suspension appeal and admin chose to unsuspend
    if (ticket.isSuspensionAppeal && unsuspendUser && (ticket.userId as any).status === 'suspended') {
      await User.findByIdAndUpdate(ticket.userId, {
        status: 'active',
        suspensionReason: undefined,
        suspensionDuration: undefined
      });
    }

    res.json({
      status: 'success',
      message: 'Ticket updated successfully',
      data: updatedTicket
    });
  } catch (error: any) {
    console.error('Error updating ticket:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      errorCode: 'TICKET_UPDATE_ERROR'
    });
  }
};

// Get user's suspension appeal tickets (for admin user detail view)
export const getUserSuspensionAppeals = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user ID',
        errorCode: 'INVALID_USER_ID'
      });
    }

    const appeals = await HelpTicket.find({
      userId,
      isSuspensionAppeal: true
    }).sort({ createdAt: -1 }).populate('adminId', 'name email');

    res.json({
      status: 'success',
      data: appeals
    });
  } catch (error: any) {
    console.error('Error fetching suspension appeals:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      errorCode: 'APPEALS_FETCH_ERROR'
    });
  }
};