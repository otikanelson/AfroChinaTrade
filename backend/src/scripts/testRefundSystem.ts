import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import Order from '../models/Order';
import Refund from '../models/Refund';
import User from '../models/User';

async function testRefundSystem() {
  try {
    // Connect to database
    await connectDatabase();
    console.log('✓ Connected to database');

    // Find a delivered order
    const deliveredOrder = await Order.findOne({ 
      status: 'delivered',
      paymentStatus: { $ne: 'refunded' }
    }).populate('userId');

    if (!deliveredOrder) {
      console.log('❌ No delivered orders found for testing');
      return;
    }

    console.log(`✓ Found test order: ${deliveredOrder.orderId}`);

    // Check if refund already exists
    const existingRefund = await Refund.findOne({ orderId: deliveredOrder._id });
    if (existingRefund) {
      console.log(`✓ Refund already exists: ${existingRefund._id}`);
      console.log(`  Status: ${existingRefund.status}`);
      console.log(`  Amount: ₦${existingRefund.amount}`);
      console.log(`  Type: ${existingRefund.type}`);
      return;
    }

    // Create a test refund
    const testRefund = await Refund.create({
      orderId: deliveredOrder._id,
      type: 'partial',
      amount: Math.floor(deliveredOrder.totalAmount * 0.5), // 50% refund
      reason: 'Test refund - Product quality issue',
    });

    console.log('✓ Created test refund:');
    console.log(`  ID: ${testRefund._id}`);
    console.log(`  Order: ${deliveredOrder.orderId}`);
    console.log(`  Amount: ₦${testRefund.amount}`);
    console.log(`  Type: ${testRefund.type}`);
    console.log(`  Status: ${testRefund.status}`);

    // Test refund retrieval
    const retrievedRefund = await Refund.findById(testRefund._id)
      .populate('orderId', 'orderId totalAmount status');

    console.log('✓ Retrieved refund with populated order data');

    // Test refund statistics
    const stats = await Refund.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    console.log('✓ Refund statistics:');
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} refunds, ₦${stat.totalAmount} total`);
    });

    // Test status update
    const updatedRefund = await Refund.findByIdAndUpdate(
      testRefund._id,
      { 
        status: 'approved',
        processedAt: new Date(),
      },
      { new: true }
    );

    console.log(`✓ Updated refund status to: ${updatedRefund?.status}`);

    console.log('\n🎉 Refund system test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  }
}

// Run the test
if (require.main === module) {
  testRefundSystem();
}

export default testRefundSystem;