import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import BlacklistedToken from '../models/BlacklistedToken';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

// AuthRequest interface for controllers
export interface AuthRequest extends Request {
  userId: string;
  userRole: string;
}

// JWT token verification middleware
export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'No token provided',
        errorCode: 'NO_TOKEN',
      });
      return;
    }

    // Check if token is blacklisted
    const blacklistedToken = await BlacklistedToken.findOne({ token });
    if (blacklistedToken) {
      res.status(401).json({
        status: 'error',
        message: 'Token has been revoked',
        errorCode: 'TOKEN_REVOKED',
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({
        status: 'error',
        message: 'Server configuration error',
        errorCode: 'SERVER_CONFIG_ERROR',
      });
      return;
    }
    
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
      role: string;
    };

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      res.status(401).json({
        status: 'error',
        message: 'User account is not active',
        errorCode: 'ACCOUNT_INACTIVE',
      });
      return;
    }

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        status: 'error',
        message: 'Token expired',
        errorCode: 'TOKEN_EXPIRED',
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token',
        errorCode: 'INVALID_TOKEN',
      });
    } else {
      res.status(401).json({
        status: 'error',
        message: 'Authentication failed',
        errorCode: 'AUTH_FAILED',
      });
    }
  }
};

// Role-based authorization middleware
export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions',
        errorCode: 'INSUFFICIENT_PERMISSIONS',
      });
      return;
    }
    next();
  };
};

// Optional JWT token verification middleware (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      // No token provided, continue without authentication
      next();
      return;
    }

    // Check if token is blacklisted
    const blacklistedToken = await BlacklistedToken.findOne({ token });
    if (blacklistedToken) {
      // Token is blacklisted, continue without authentication
      next();
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      // Server config error, continue without authentication
      next();
      return;
    }
    
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
      role: string;
    };

    // Verify user still exists and is active
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      // User not found or inactive, continue without authentication
      next();
      return;
    }

    // Set user info if authentication successful
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    // Any JWT error, continue without authentication
    next();
  }
};
