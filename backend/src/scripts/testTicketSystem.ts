import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import HelpTicket from '../models/HelpTicket';
import User from '../models/User';

async function testTicketSystem() {
  try {
    await connectDatabase();
    console.log('✓ Connected to database');

    // Find a test user
    const testUser = await User.findOne({ email: { $regex: /test|demo/i } });
    if (!testUser) {
      console.log('❌ No test user found. Please create a test user first.');
      return;
    }

    console.log(`✓ Found test user: ${testUser.name} (${testUser.email})`);

    // Create a test ticket
    const testTicket = new HelpTicket({
      userId: testUser._id,
      subject: 'Test Support Ticket',
      category: 'technical',
      priority: 'medium',
      description: 'This is a test ticket to verify the support system is working correctly.',
    });

    await testTicket.save();
    console.log(`✓ Created test ticket: ${testTicket.ticketNumber}`);

    // Fetch the ticket with populated fields
    const populatedTicket = await HelpTicket.findById(testTicket._id)
      .populate('userId', 'name email')
      .populate('adminId', 'name email');

    console.log('✓ Ticket details:');
    console.log(`  - ID: ${populatedTicket?._id}`);
    console.log(`  - Number: ${populatedTicket?.ticketNumber}`);
    console.log(`  - Subject: ${populatedTicket?.subject}`);
    console.log(`  - Category: ${populatedTicket?.category}`);
    console.log(`  - Priority: ${populatedTicket?.priority}`);
    console.log(`  - Status: ${populatedTicket?.status}`);
    console.log(`  - User: ${(populatedTicket?.userId as any)?.name}`);
    console.log(`  - Created: ${populatedTicket?.createdAt}`);

    // Test updating the ticket (simulate admin response)
    const updatedTicket = await HelpTicket.findByIdAndUpdate(
      testTicket._id,
      {
        status: 'in_progress',
        adminResponse: 'Thank you for your ticket. We are looking into this issue.',
        adminId: testUser._id, // Using test user as admin for demo
      },
      { new: true }
    ).populate('userId', 'name email').populate('adminId', 'name email');

    console.log('✓ Updated ticket with admin response:');
    console.log(`  - Status: ${updatedTicket?.status}`);
    console.log(`  - Admin Response: ${updatedTicket?.adminResponse}`);
    console.log(`  - Admin: ${(updatedTicket?.adminId as any)?.name}`);

    // Test fetching user's tickets
    const userTickets = await HelpTicket.find({ userId: testUser._id })
      .sort({ createdAt: -1 })
      .populate('adminId', 'name email');

    console.log(`✓ Found ${userTickets.length} tickets for user`);

    // Clean up test ticket
    await HelpTicket.findByIdAndDelete(testTicket._id);
    console.log('✓ Cleaned up test ticket');

    console.log('\n🎉 Ticket system test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  }
}

// Run the test
testTicketSystem();