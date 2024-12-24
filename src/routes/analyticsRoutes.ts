import express from 'express';
import {
  trackUrlVisit,
  getUrlAnalytics,
  getRealTimeAnalytics,
  getTopicAnalytics,
  getOverallAnalytics
} from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/auth';
import { RateLimiter } from '../middleware/rateLimiter';

const router = express.Router();
const rateLimiter = new RateLimiter(); // Create instance

// Existing routes
router.post('/track/:urlId', trackUrlVisit);
router.get('/url/:urlId', authMiddleware, getUrlAnalytics);
router.get('/realtime/:urlId', authMiddleware, getRealTimeAnalytics);

// New Day 7 routes
router.get('/topic/:topic', authMiddleware, rateLimiter.middleware, getTopicAnalytics);
router.get('/overall', authMiddleware, rateLimiter.middleware, getOverallAnalytics);

export default router;