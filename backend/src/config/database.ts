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
    console.warn('⚠️  MONGODB_URI environment variable is not defined');
    console.warn('⚠️  Database connection skipped - running in demo mode');
    return;
  }

  // Log the connection string (first 50 chars only for security)
  console.log(`📝 Attempting to connect to MongoDB: ${mongoUri.substring(0, 50)}...`);

  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        retryWrites: true,
        w: 'majority',
      });
      console.log('✓ MongoDB connected successfully');
      console.log(`✓ Database: ${mongoose.connection.name}`);
      console.log(`✓ Host: ${mongoose.connection.host}`);
      return;
    } catch (error) {
      retries++;
      console.error(`✗ MongoDB connection attempt ${retries} failed:`, error instanceof Error ? error.message : error);

      if (retries >= maxRetries) {
        console.warn(`⚠️  Failed to connect to MongoDB after ${maxRetries} attempts`);
        console.warn('⚠️  Running in demo mode without database');
        return;
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
