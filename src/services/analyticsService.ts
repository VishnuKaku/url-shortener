import { Analytics } from '../models/Analytics';
import { Redis } from 'ioredis';
import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';

export class AnalyticsService {
  private redis: Redis;
  private CACHE_EXPIRY = 3600; // 1 hour in seconds

  constructor(redisClient: Redis) {
    this.redis = redisClient;
  }

  async trackVisit(urlId: string, visitorIp: string, userAgent: string) {
    const parser = new UAParser(userAgent);
    const os = parser.getOS();
    const device = parser.getDevice();
    const geo = geoip.lookup(visitorIp);

    const analytics = new Analytics({
      url_id: urlId,
      visitor_ip: visitorIp,
      user_agent: userAgent,
      os_type: os.name || 'Unknown',
      device_type: device.type || 'Unknown',
      country: geo?.country || 'Unknown',
      city: geo?.city || 'Unknown',
      timestamp: new Date(),
    });

    await analytics.save();

    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `analytics:${urlId}:${today}`;

    await Promise.all([
      this.redis.hincrby(cacheKey, 'visits', 1),
      this.redis.hincrby(`${cacheKey}:os`, os.name || 'Unknown', 1),
      this.redis.hincrby(`${cacheKey}:device`, device.type || 'Unknown', 1),
      this.redis.hincrby(`${cacheKey}:country`, geo?.country || 'Unknown', 1),
    ]);

    await this.redis.expire(cacheKey, this.CACHE_EXPIRY);
  }

  async getDetailedAnalytics(urlId: string, startDate?: Date, endDate?: Date) {
    const matchStage: any = { url_id: urlId };

    if (startDate || endDate) {
      matchStage.timestamp = {};
      if (startDate) matchStage.timestamp.$gte = startDate;
      if (endDate) matchStage.timestamp.$lte = endDate;
    }

    const [
      totalVisits,
      osDist,
      deviceDist,
      countryDist,
      hourlyDist,
      dailyDist,
    ] = await Promise.all([
      Analytics.countDocuments(matchStage),
      Analytics.aggregate([
        { $match: matchStage },
        { $group: { _id: '$os_type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Analytics.aggregate([
        { $match: matchStage },
        { $group: { _id: '$device_type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Analytics.aggregate([
        { $match: matchStage },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Analytics.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $hour: '$timestamp' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id': 1 } },
      ]),
      Analytics.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id': 1 } },
      ]),
    ]);

    return {
      totalVisits,
      osDist,
      deviceDist,
      countryDist,
      hourlyDist,
      dailyDist,
    };
  }

  async getRealTimeAnalytics(urlId: string) {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `analytics:${urlId}:${today}`;

    const [visits, osStats, deviceStats, countryStats] = await Promise.all([
      this.redis.hgetall(cacheKey),
      this.redis.hgetall(`${cacheKey}:os`),
      this.redis.hgetall(`${cacheKey}:device`),
      this.redis.hgetall(`${cacheKey}:country`),
    ]);

    return {
      today: {
        visits: parseInt(visits?.visits || '0'),
        os: osStats,
        device: deviceStats,
        country: countryStats,
      },
    };
  }

    async getTopicAnalytics(topic: string): Promise<any> {
        try {
            // Logic to fetch analytics by topic. This will depend on how you store topic data.
            // Example: If you store a topic with each URL's analytics in Redis
            const keys = await this.redis.keys(`analytics:topic:${topic}:*`);
            let totalClicks = 0;
            for (const key of keys) {
                const clicks = await this.redis.get(key);
                if (clicks) {
                    totalClicks += parseInt(clicks.toString(), 10);
                }
            }
            return { totalClicks };
        } catch (error) {
            console.error("Error fetching topic analytics:", error);
            throw error; // Re-throw the error to be handled by the controller
        }
    }

    async getOverallAnalytics(): Promise<any> {
        try {
            // Logic to fetch overall analytics. This depends on your data structure.
            // Example: If you store overall analytics in a separate Redis key
            const totalUrls = await this.redis.get('analytics:overall:totalUrls') || 0;
            const totalClicks = await this.redis.get('analytics:overall:totalClicks') || 0;
            return {
                totalUrls: parseInt(totalUrls.toString()) || 0,
                totalClicks: parseInt(totalClicks.toString()) || 0
            };
        } catch (error) {
            console.error("Error fetching overall analytics:", error);
            throw error;
        }
    }
}