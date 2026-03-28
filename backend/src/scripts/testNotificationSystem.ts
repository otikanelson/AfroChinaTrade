import mongoose from 'mongoose';
import User from '../models/User';
import { 
  createNotification, 
  notifyOrderUpdate, 
  notifyPromotion, 
  notifyPriceDrop, 
  notifyNewProduct 
} from '../controllers/notificationController';
import { connectDatabase } from '../config/database';

async function testNotificationSystem() {
  try {
    // Connect to database
    await connectDatabase();
    console.log('Connected to database');

    // Find a test user (or create one)
    let testUser = await User.findOne({ email: 'john@example.com' });
    if (!testUser) {
      console.log('Test user not found, creating one...');
      testUser = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'TestPassword123!',
        phone: '+1234567890',
      });
    }

    console.log(`Testing notifications for user: ${testUser.name} (${testUser.email})`);

    // Test 1: Create a general notification
    console.log('\n1. Creating general notification...');
    await createNotification(
      testUser._id.toString(),
      'general',
      'Welcome to AfroChinaTrade!',
      'Thank you for joining our platform. Explore thousands of products from trusted suppliers.',
      { welcomeBonus: 100 }
    );

    // Test 2: Create an order update notification
    console.log('2. Creating order update notification...');
    await notifyOrderUpdate(
      testUser._id.toString(),
      'order_123',
      'ORD-2024-001',
      'shipped',
      testUser.name
    );

    // Test 3: Create a system notification
    console.log('3. Creating system notification...');
    await createNotification(
      testUser._id.toString(),
      'system',
      'System Maintenance',
      'We will be performing scheduled maintenance on March 28, 2026 from 2:00 AM to 4:00 AM UTC.',
      { maintenanceStart: '2026-03-28T02:00:00Z', maintenanceEnd: '2026-03-28T04:00:00Z' }
    );

    // Test 4: Create promotion notification
    console.log('4. Creating promotion notification...');
    await notifyPromotion(
      [testUser._id.toString()],
      'Flash Sale: 50% Off Electronics!',
      'Limited time offer on all electronics. Use code FLASH50 at checkout.',
      { promoCode: 'FLASH50', discount: 50, category: 'electronics' }
    );

    // Test 5: Create price drop notification
    console.log('5. Creating price drop notification...');
    await notifyPriceDrop(
      [testUser._id.toString()],
      'iPhone 15 Pro Max',
      1200,
      999,
      'product_iphone15'
    );

    // Test 6: Create new product notification
    console.log('6. Creating new product notification...');
    await notifyNewProduct(
      [testUser._id.toString()],
      'Samsung Galaxy S24 Ultra',
      'product_galaxy_s24',
      'Smartphones',
      1100
    );

    // Test 7: Create multiple notifications for bulk testing
    console.log('7. Creating multiple notifications for testing pagination...');
    for (let i = 1; i <= 5; i++) {
      await createNotification(
        testUser._id.toString(),
        'general',
        `Test Notification ${i}`,
        `This is test notification number ${i} for testing the notification system.`,
        { testNumber: i }
      );
    }

    console.log('\n✅ All test notifications created successfully!');
    console.log('\nYou can now:');
    console.log('1. Open the mobile app and navigate to Account > Notifications');
    console.log('2. Test the notification list, pagination, and mark as read functionality');
    console.log('3. Test the notification settings');
    console.log('4. Check the unread count badge');

  } catch (error) {
    console.error('❌ Error testing notification system:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the test
testNotificationSystem();