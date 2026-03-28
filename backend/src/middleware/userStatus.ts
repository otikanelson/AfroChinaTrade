import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthRequest } from './auth';

// Middleware to check user status and handle suspended/blocked users
export const checkUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.userId) {
      // No user ID means not authenticated, continue
      next();
      return;
    }

    const user = await User.findById(authReq.userId);
    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND',
      });
      return;
    }

    // Check if user is blocked - blocks all actions
    if (user.status === 'blocked') {
      res.status(403).json({
        status: 'error',
        message: 'Your account has been blocked',
        errorCode: 'ACCOUNT_BLOCKED',
        data: {
          status: 'blocked',
          reason: user.blockReason || 'Account blocked by administrator',
        }
      });
      return;
    }

    // Check if user is suspended - allows guest features but not authenticated actions
    if (user.status === 'suspended') {
      res.status(403).json({
        status: 'error',
        message: 'Your account has been suspended',
        errorCode: 'ACCOUNT_SUSPENDED',
        data: {
          status: 'suspended',
          reason: user.suspensionReason || 'Account suspended by administrator',
          suspensionDuration: user.suspensionDuration,
        }
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error checking user status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  }
};

// Middleware for guest-allowed endpoints (suspended users can access these)
export const allowSuspendedUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.userId) {
      // No user ID means not authenticated, continue
      next();
      return;
    }

    const user = await User.findById(authReq.userId);
    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND',
      });
      return;
    }

    // Only block if user is blocked, allow suspended users
    if (user.status === 'blocked') {
      res.status(403).json({
        status: 'error',
        message: 'Your account has been blocked',
        errorCode: 'ACCOUNT_BLOCKED',
        data: {
          status: 'blocked',
          reason: user.blockReason || 'Account blocked by administrator',
        }
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error checking user status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  }
};