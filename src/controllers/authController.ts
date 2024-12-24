import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { redisClient } from '../config/redis';

const analyticsService = new AnalyticsService(redisClient);

export const trackUrlVisit = async (req: Request, res: Response) => {
  try {
    const { urlId } = req.params;
    const ip = req.ip || req.socket.remoteAddress || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await analyticsService.trackVisit(urlId, ip, userAgent);
    res.status(200).json({ message: 'Visit tracked successfully' });
  } catch (error) {
    console.error("Error tracking visit:", error);
    res.status(500).json({ error: 'Failed to track visit' });
  }
};

export const getUrlAnalytics = async (req: Request, res: Response) => {
  try {
    const { urlId } = req.params;
    const { startDate, endDate } = req.query;

    const analytics = await analyticsService.getDetailedAnalytics(
      urlId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    res.json(analytics);
  } catch (error) {
    console.error("Error getting detailed analytics:", error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

export const getRealTimeAnalytics = async (req: Request, res: Response) => {
  try {
    const { urlId } = req.params;
    const realTimeStats = await analyticsService.getRealTimeAnalytics(urlId);
    res.json(realTimeStats);
  } catch (error) {
    console.error("Error getting real-time analytics:", error);
    res.status(500).json({ error: 'Failed to fetch real-time analytics' });
  }
};

export const getTopicAnalytics = async (req: Request, res: Response) => {
  try {
    const { topic } = req.params;
    const analytics = await analyticsService.getTopicAnalytics(topic);
    res.json(analytics);
  } catch (error) {
    console.error("Error getting topic analytics:", error);
    res.status(500).json({ error: 'Failed to fetch topic analytics' });
  }
};

export const getOverallAnalytics = async (req: Request, res: Response) => {
  try {
    const analytics = await analyticsService.getOverallAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error("Error getting overall analytics:", error);
    res.status(500).json({ error: 'Failed to fetch overall analytics' });
  }
};