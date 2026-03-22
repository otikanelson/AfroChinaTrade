import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDatabase, getDatabaseStatus } from '../src/config/database';
import { validateEnvironment } from '../src/config/validateEnv';
import { securityHeaders, corsMiddleware, requestSizeLimit, validateContentType, sanitizeInput } from '../src/middleware/security';
import { errorHandler, notFoundHandler } from '../src/middleware/errorHandler';

// Import routes
import authRoutes from '../src/routes/authRoutes';
import productRoutes from '../src/routes/productRoutes';
import orderRoutes from '../src/routes/orderRoutes';
import messageRoutes from '../src/routes/messageRoutes';
import reviewRoutes from '../src/routes/reviewRoutes';
import refundRoutes from '../src/routes/refundRoutes';
import reportRoutes from '../src/routes/reportRoutes';
import ticketRoutes from '../src/routes/ticketRoutes';
import categoryRoutes from '../src/routes/categoryRoutes';
import supplierRoutes from '../src/routes/supplierRoutes';
import userRoutes from '../src/routes/userRoutes';
import uploadRoutes from '../src/routes/uploadRoutes';
import analyticsRoutes from '../src/routes/analyticsRoutes';
import searchRoutes from '../src/routes/searchRoutes';
import wishlistRoutes from '../src/routes/wishlist';
import cartRoutes from '../src/routes/cart';
import viewTrackingRoutes from '../src/routes/viewTrackingRoutes';
import productCollectionRoutes from '../src/routes/productCollectionRoutes';
import recommendationRoutes from '../src/routes/recommendationRoutes';
import deliveryAddressRoutes from '../src/routes/deliveryAddressRoutes';
import locationRoutes from '../src/routes/locationRoutes';

// Load environment variables
dotenv.config();

// Validate environment variables
validateEnvironment();

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(requestSizeLimit);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Input sanitization middleware (after body parsing)
app.use(sanitizeInput);

// Validate content type
app.use(validateContentType);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    database: getDatabaseStatus()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api', viewTrackingRoutes);
app.use('/api', productCollectionRoutes);
app.use('/api', recommendationRoutes);
app.use('/api/addresses', deliveryAddressRoutes);
app.use('/api/locations', locationRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Ensure database is connected
let dbConnected = false;
const ensureDbConnection = async () => {
  if (!dbConnected) {
    try {
      await connectDatabase();
      dbConnected = true;
    } catch (error) {
      console.error('Database connection failed:', error);
      // Don't throw - allow API to work in demo mode
    }
  }
};

// Export for Vercel
export default async (req: VercelRequest, res: VercelResponse) => {
  await ensureDbConnection();
  return app(req, res);
};
