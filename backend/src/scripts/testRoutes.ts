import express from 'express';
import { connectDatabase } from '../config/database';

// Import all routes to test if they load without errors
import authRoutes from '../routes/authRoutes';
import productRoutes from '../routes/productRoutes';
import orderRoutes from '../routes/orderRoutes';
import messageRoutes from '../routes/messageRoutes';
import reviewRoutes from '../routes/reviewRoutes';
import refundRoutes from '../routes/refundRoutes';
import reportRoutes from '../routes/reportRoutes';
import ticketRoutes from '../routes/ticketRoutes';
import categoryRoutes from '../routes/categoryRoutes';
import supplierRoutes from '../routes/supplierRoutes';
import userRoutes from '../routes/userRoutes';
import uploadRoutes from '../routes/uploadRoutes';
import analyticsRoutes from '../routes/analyticsRoutes';
import searchRoutes from '../routes/searchRoutes';
import wishlistRoutes from '../routes/wishlist';
import cartRoutes from '../routes/cart';
import viewTrackingRoutes from '../routes/viewTrackingRoutes';
import productCollectionRoutes from '../routes/productCollectionRoutes';
import collectionRoutes from '../routes/collectionRoutes';
import recommendationRoutes from '../routes/recommendationRoutes';
import deliveryAddressRoutes from '../routes/deliveryAddressRoutes';
import locationRoutes from '../routes/locationRoutes';
import paymentMethodRoutes from '../routes/paymentMethodRoutes';
import notificationRoutes from '../routes/notificationRoutes';

async function testRoutes() {
  console.log('🧪 Testing route imports...');
  
  try {
    // Create a test Express app
    const app = express();
    
    // Test each route by mounting it
    const routes = [
      { name: 'auth', router: authRoutes },
      { name: 'products', router: productRoutes },
      { name: 'orders', router: orderRoutes },
      { name: 'messages', router: messageRoutes },
      { name: 'reviews', router: reviewRoutes },
      { name: 'refunds', router: refundRoutes },
      { name: 'reports', router: reportRoutes },
      { name: 'tickets', router: ticketRoutes },
      { name: 'categories', router: categoryRoutes },
      { name: 'suppliers', router: supplierRoutes },
      { name: 'users', router: userRoutes },
      { name: 'upload', router: uploadRoutes },
      { name: 'analytics', router: analyticsRoutes },
      { name: 'search', router: searchRoutes },
      { name: 'wishlist', router: wishlistRoutes },
      { name: 'cart', router: cartRoutes },
      { name: 'viewTracking', router: viewTrackingRoutes },
      { name: 'productCollection', router: productCollectionRoutes },
      { name: 'collections', router: collectionRoutes },
      { name: 'recommendations', router: recommendationRoutes },
      { name: 'deliveryAddress', router: deliveryAddressRoutes },
      { name: 'locations', router: locationRoutes },
      { name: 'paymentMethods', router: paymentMethodRoutes },
      { name: 'notifications', router: notificationRoutes },
    ];
    
    for (const route of routes) {
      try {
        app.use(`/test/${route.name}`, route.router);
        console.log(`✅ ${route.name} routes loaded successfully`);
      } catch (error) {
        console.error(`❌ Error loading ${route.name} routes:`, error);
        throw error;
      }
    }
    
    console.log('\n🎉 All routes loaded successfully!');
    console.log(`📊 Total routes tested: ${routes.length}`);
    
  } catch (error) {
    console.error('\n💥 Route testing failed:', error);
    process.exit(1);
  }
}

// Run the test
testRoutes();