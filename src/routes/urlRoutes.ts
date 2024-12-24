import express from 'express';
import { URLController } from '../controllers/urlController';
import { authMiddleware } from '../middleware/auth'; // Corrected import
import { RateLimiter } from '../middleware/rateLimiter';

const router = express.Router();
const urlController = new URLController();
const rateLimiter = new RateLimiter(60 * 1000, 10); // 10 requests per minute

// Protected routes (require authentication)
router.post('/shorten',
  authMiddleware,
  rateLimiter.middleware,
  urlController.createShortUrl.bind(urlController)
);

router.get('/analytics/:shortCode',
  authMiddleware,
  urlController.getUrlAnalytics.bind(urlController)
);

// Public routes
router.get('/:shortCode', urlController.redirectToLongUrl.bind(urlController));

export default router;