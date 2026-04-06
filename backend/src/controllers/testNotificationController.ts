import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
// import NotificationService from '../services/NotificationService';

// Test endpoint to send sample notifications
const testNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({
      status: 'success',
      message: 'Test notification endpoint working'
    });
  } catch (error) {
    console.error('Error in test notifications:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process test notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get notification statistics
const getNotificationStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({
      status: 'success',
      data: {
        counts: {
          newProducts: 0,
          discountedProducts: 0,
          promotions: 0,
          newAds: 0,
          chatMessages: 0,
          helpAndSupport: 0,
          newsletter: 0,
          orderUpdates: 0,
        },
        totalOptedInUsers: 0
      }
    });
  } catch (error) {
    console.error('Error getting notification stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get notification statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export { testNotifications, getNotificationStats };