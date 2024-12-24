import { createClient } from 'redis';
import { URL } from '../models/URL';
import crypto from 'crypto';

export class URLService {
  private redis;

  constructor() {
    this.redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.redis.connect();
  }

  async generateShortCode(length: number = 6): Promise<string> {
    const bytes = crypto.randomBytes(length);
    return bytes.toString('base64').replace(/[+/=]/g, '').substring(0, length);
  }

  async createShortUrl(userId: string, longUrl: string, customAlias?: string, topic?: string): Promise<any> {
    const shortCode = customAlias || await this.generateShortCode();
    
    // Check if custom alias is available
    if (customAlias) {
      const existing = await URL.findOne({ short_code: customAlias });
      if (existing) {
        throw new Error('Custom alias already in use');
      }
    }

    const url = await URL.create({
      user_id: userId,
      long_url: longUrl,
      short_code: shortCode,
      topic,
      created_at: new Date()
    });

    // Cache the URL
    await this.redis.set(`url:${shortCode}`, longUrl, {
      EX: 3600 // Cache for 1 hour
    });

    return url;
  }

  async getLongUrl(shortCode: string): Promise<string | null> {
    // Try cache first
    const cachedUrl = await this.redis.get(`url:${shortCode}`);
    if (cachedUrl) return cachedUrl;

    // If not in cache, check database
    const url = await URL.findOne({ short_code: shortCode });
    if (!url) return null;

    // Cache the result
    await this.redis.set(`url:${shortCode}`, url.long_url, {
      EX: 3600 // Cache for 1 hour
    });

    return url.long_url;
  }
}