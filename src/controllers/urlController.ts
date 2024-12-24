import { Request, Response } from 'express';
import { URLService } from '../services/urlService';
import { URLValidator } from '../utils/urlValidator';

// Define interface for authenticated request
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  }
}

export class URLController {
  private urlService: URLService;

  constructor() {
    this.urlService = new URLService();
  }

  async createShortUrl(req: Request, res: Response): Promise<void> {
    try {
      const { longUrl, customAlias, topic } = req.body;
      
      // Type guard to check if req is authenticated
      if (!('user' in req) || !req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const userId = req.user.id;

      // Validate URL
      if (!URLValidator.isValidUrl(longUrl)) {
        res.status(400).json({ error: 'Invalid URL format' });
        return;
      }

      // Validate custom alias if provided
      if (customAlias && !URLValidator.isValidCustomAlias(customAlias)) {
        res.status(400).json({ error: 'Invalid custom alias format' });
        return;
      }

      const url = await this.urlService.createShortUrl(
        userId,
        longUrl,
        customAlias,
        topic
      );

      res.json({
        shortUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/${url.short_code}`,
        shortCode: url.short_code,
        longUrl: url.long_url,
        topic: url.topic
      });
    } catch (error: any) {
      if (error.message === 'Custom alias already in use') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create short URL' });
      }
    }
  }

  async redirectToLongUrl(req: Request, res: Response): Promise<void> {
    try {
      const { shortCode } = req.params;
      const longUrl = await this.urlService.getLongUrl(shortCode);

      if (!longUrl) {
        res.status(404).json({ error: 'Short URL not found' });
        return;
      }

      res.redirect(longUrl);
    } catch (error) {
      res.status(500).json({ error: 'Redirect failed' });
    }
  }

  async getUrlAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { shortCode } = req.params;
      
      // Type guard to check if req is authenticated
      if (!('user' in req) || !req.user?.id) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const userId = req.user.id;

      // Implement analytics retrieval logic here
      // This will be implemented in the analytics phase

      res.json({
        shortCode,
        // Add analytics data here
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve analytics' });
    }
  }
}