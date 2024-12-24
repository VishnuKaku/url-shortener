import { createClient } from 'redis';
import { Request, Response, NextFunction } from 'express';

export class RateLimiter {
  private redis;
  private windowMs: number;
  private max: number;

  constructor(windowMs = 15 * 60 * 1000, max = 100) {
    this.redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.redis.connect();
    this.windowMs = windowMs;
    this.max = max;
  }

  middleware = async (req: Request, res: Response, next: NextFunction) => {
    const key = `ratelimit:${req.ip}`;
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, this.windowMs / 1000);
    }

    if (current > this.max) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }

    next();
  };
}