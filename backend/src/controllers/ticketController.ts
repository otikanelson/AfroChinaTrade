import { Request, Response } from 'express';
import Ticket from '../models/Ticket';
import User from '../models/User';

export const createTicket = async (req: Request, res: Response) => {
  try {
    const { subject, description, priority } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ message: 'Subject and description are required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const ticket = await Ticket.create({
      subject,
      description,
      userId: req.userId,
      userName: user.name,
      userEmail: user.email,
      priority: priority || 'medium',
    });

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTickets = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, priority } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};

    if (req.userRole === 'customer') {
      filter.userId = req.userId;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tickets = await Ticket.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Ticket.countDocuments(filter);

    res.json({
      tickets,
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

export const getTicketById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (req.userRole === 'customer' && ticket.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(ticket);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTicketStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['open', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid ticket status' });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({
      message: 'Ticket status updated successfully',
      ticket,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTicketPriority = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority' });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { priority },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({
      message: 'Ticket priority updated successfully',
      ticket,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
