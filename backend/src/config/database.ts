import mongoose from 'mongoose';

interface ConnectionOptions {
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Connect to MongoDB database with retry logic
 * @param options - Connection options including retry configuration
 */
export const connectDatabase = async (
  options: ConnectionOptions = {}
): Promise<void> => {
  const { maxRetries = 5, retryDelay = 5000 } = options;
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(mongoUri);
      console.log('✓ MongoDB connected successfully');
      console.log(`✓ Database: ${mongoose.connection.name}`);
      console.log(`✓ Host: ${mongoose.connection.host}`);
      return;
    } catch (error) {
      retries++;
      console.error(`✗ MongoDB connection attempt ${retries} failed:`, error instanceof Error ? error.message : error);

      if (retries >= maxRetries) {
        console.error(`✗ Failed to connect to MongoDB after ${maxRetries} attempts`);
        throw new Error('Database connection failed');
      }

      console.log(`⟳ Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

/**
 * Disconnect from MongoDB database
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('✓ MongoDB disconnected successfully');
  } catch (error) {
    console.error('✗ Error disconnecting from MongoDB:', error);
    throw error;
  }
};

/**
 * Get database connection status
 */
export const getDatabaseStatus = (): string => {
  const states: { [key: number]: string } = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});
