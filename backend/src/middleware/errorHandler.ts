import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'express-validator';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

// Custom error classes for different types of errors
export class ValidationApiError extends Error {
  statusCode: number;
  code: string;
  details: any;

  constructor(message: string, details: any) {
    super(message);
    this.statusCode = 400;
    this.code = 'VALIDATION_ERROR';
    this.details = details;
    this.name = 'ValidationApiError';
  }
}

export class AuthenticationError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string = 'Authentication failed') {
    super(message);
    this.statusCode = 401;
    this.code = 'AUTHENTICATION_ERROR';
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.statusCode = 403;
    this.code = 'AUTHORIZATION_ERROR';
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string = 'Resource not found') {
    super(message);
    this.statusCode = 404;
    this.code = 'NOT_FOUND_ERROR';
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string = 'Database operation failed') {
    super(message);
    this.statusCode = 500;
    this.code = 'DATABASE_ERROR';
    this.name = 'DatabaseError';
  }
}

// Global error handling middleware
export const errorHandler = (err: ApiError, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let details = err.details || null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = Object.values((err as any).errors || {}).map((error: any) => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));
  } else if (err.name === 'CastError') {
    // Mongoose cast error (invalid ObjectId, etc.)
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'Invalid ID format';
  } else if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    // MongoDB errors
    statusCode = 500;
    code = 'DATABASE_ERROR';
    message = 'Database operation failed';
    
    // Handle duplicate key error
    if ((err as any).code === 11000) {
      statusCode = 409;
      code = 'DUPLICATE_ERROR';
      message = 'Resource already exists';
      const field = Object.keys((err as any).keyValue || {})[0];
      details = field ? `${field} already exists` : 'Duplicate entry';
    }
  } else if (err.name === 'JsonWebTokenError') {
    // JWT errors
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    // JWT expired
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Token expired';
  } else if (err.name === 'MulterError') {
    // File upload errors
    statusCode = 400;
    code = 'FILE_UPLOAD_ERROR';
    if (err.message.includes('File too large')) {
      statusCode = 413;
      code = 'FILE_TOO_LARGE';
      message = 'File size exceeds limit';
    }
  }

  // Log all errors with stack traces for debugging
  console.error(`[${new Date().toISOString()}] ${code} - ${message}:`, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    error: err.stack || err.message,
    details
  });

  // Standardized error response format
  const errorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  };

  res.status(statusCode).json(errorResponse);
};

// 404 handler for routes not found
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    }
  });
};

// Async handler wrapper to catch async errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
