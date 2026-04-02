import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase, getDatabaseStatus } from './config/database';
import { validateEnvironment } from './config/validateEnv';
import { securityHeaders, corsMiddleware, rateLimiter, requestSizeLimit, validateContentType, sanitizeInput } from './middleware/security';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import messageRoutes from './routes/messageRoutes';
import reviewRoutes from './routes/reviewRoutes';
import adminRoutes from './routes/adminRoutes';
import refundRoutes from './routes/refundRoutes';
import reportRoutes from './routes/reportRoutes';
import ticketRoutes from './routes/ticketRoutes';
import categoryRoutes from './routes/categoryRoutes';
import supplierRoutes from './routes/supplierRoutes';
import userRoutes from './routes/userRoutes';
import uploadRoutes from './routes/uploadRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import searchRoutes from './routes/searchRoutes';
import wishlistRoutes from './routes/wishlist';
import cartRoutes from './routes/cart';
import viewTrackingRoutes from './routes/viewTrackingRoutes';
import productCollectionRoutes from './routes/productCollectionRoutes';
import collectionRoutes from './routes/collectionRoutes';
import recommendationRoutes from './routes/recommendationRoutes';
import deliveryAddressRoutes from './routes/deliveryAddressRoutes';
import locationRoutes from './routes/locationRoutes';
import paymentMethodRoutes from './routes/paymentMethodRoutes';
import notificationRoutes from './routes/notificationRoutes';
import adRoutes from './routes/adRoutes';
import pageLayoutRoutes from './routes/pageLayoutRoutes';

// Load environment variables
dotenv.config();

// Validate environment variables
validateEnvironment();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Security middleware
app.use(securityHeaders);
app.use(corsMiddleware);
// app.use(rateLimiter); // Temporarily disabled for development
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
app.use('/api/product-collections', productCollectionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
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
app.use('/api/collections', collectionRoutes);
app.use('/api', recommendationRoutes);
app.use('/api/addresses', deliveryAddressRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/page-layouts', pageLayoutRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Start server with database connection
const startServer = async () => {
  try {
    // Connect to database first
    await connectDatabase();
    
    // Only start the server if database connection is successful
    const dbStatus = getDatabaseStatus();
    if (dbStatus !== 'connected') {
      console.warn('⚠️  Database not connected, but starting server anyway for demo mode');
    }
    
    // Start Express server - listen on all interfaces for development
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API Base URL: http://localhost:${PORT}/api`);
      console.log(`✓ Accessible from: http://0.0.0.0:${PORT}/api`);
      console.log(`✓ Database status: ${dbStatus}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
