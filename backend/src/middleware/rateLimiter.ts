import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

const isDevelopment = process.env.NODE_ENV === 'development';

// Rate limiter for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: isDevelopment ? 5 * 60 * 1000 : 15 * 60 * 1000, // 5 minutes in dev, 15 minutes in prod
  max: isDevelopment ? 50 : 5, // 50 requests in dev, 5 in prod
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
    errorCode: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests
  skipSuccessfulRequests: true,
});

// Stricter rate limiter for failed login attempts
export const loginRateLimit = rateLimit({
  windowMs: isDevelopment ? 5 * 60 * 1000 : 15 * 60 * 1000, // 5 minutes in dev, 15 minutes in prod
  max: isDevelopment ? 20 : 3, // 20 attempts in dev, 3 in prod
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
    errorCode: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Only count failed requests
  skip: (req: Request, res: Response) => res.statusCode < 400,
});

// General API rate limiter
export const apiRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // Use env var or default 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || (isDevelopment ? '1000' : '100')), // Use env var or defaults
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
    errorCode: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});