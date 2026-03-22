import mongoose from 'mongoose';
import Cart from '../models/Cart';
import { validateEnv } from '../config/validateEnv';

async function clearAllCarts() {
  try {
    // Validate environment variables
    validateEnv();

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Clear all cart items
    const result = await Cart.updateMany(
      {},
      { 
        $set: { 
          items: [],
          totalItems: 0,
          totalAmount: 0,
          lastUpdated: new Date()
        }
      }
    );

    console.log(`Cleared ${result.modifiedCount} carts`);
    console.log('All carts have been cleared successfully');

  } catch (error) {
    console.error('Error clearing carts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
clearAllCarts();