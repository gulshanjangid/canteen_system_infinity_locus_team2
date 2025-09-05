import mongoose from 'mongoose';
import type { Logger } from 'pino';

export async function connectToDatabase(logger: Logger): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/canteen';
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      autoCreate: true,
      autoIndex: true,
    } as any);
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error({ err }, 'MongoDB connection error');
    throw err;
  }
}


