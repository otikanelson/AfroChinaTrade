import { Request, Response } from 'express';
import Report from '../models/Report';
import User from '../models/User';

export const createReport = async (req: Request, res: Response) => {
  try {
    const { type, reportedContent, reportedEntityType, reportedEntityId, description } = req.body;

    if (!type || !reportedContent || !reportedEntityType || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findById(req.userId);

    const report = await Report.create({
      type,
      reportedContent,
      reportedEntityType,
      reportedEntityId,
      reporterId: req.userId,
      reporterName: user?.name || 'Anonymous',
      description,
    });

    res.status(201).json({
      message: 'Report created successfully',
      report,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status, type, startDate, endDate } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    // Date filtering
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate as string);
      }
    }

    const reports = await Report.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments(filter);

    res.json({
      reports,
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

export const updateReportStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'investigating', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid report status' });
    }

    const report = await Report.findByIdAndUpdate(
      id,
      {
        status,
        resolvedBy: req.userId,
        resolvedAt: new Date(),
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json({
      message: 'Report status updated successfully',
      report,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
