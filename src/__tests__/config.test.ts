import dotenv from 'dotenv';
import { connect } from 'mongoose';
import { createClient } from 'redis';

describe('Configuration Test', () => {
  beforeAll(() => {
    dotenv.config();
  });

  test('Environment variables are set', () => {
    expect(process.env.GOOGLE_CLIENT_ID).toBeDefined();
    expect(process.env.GOOGLE_CLIENT_SECRET).toBeDefined();
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.REDIS_URL).toBeDefined();
    expect(process.env.MONGODB_URI).toBeDefined();
  });

  test('Can connect to MongoDB', async () => {
    try {
      await connect(process.env.MONGODB_URI!);
      expect(true).toBeTruthy();
    } catch (error) {
      fail('MongoDB connection failed');
    }
  });

  test('Can connect to Redis', async () => {
    try {
      const client = createClient({
        url: process.env.REDIS_URL
      });
      await client.connect();
      expect(true).toBeTruthy();
      await client.disconnect();
    } catch (error) {
      fail('Redis connection failed');
    }
  });
});