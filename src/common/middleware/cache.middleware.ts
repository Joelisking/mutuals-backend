import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../utils/cache.util';

/**
 * Cache middleware for GET requests
 * Caches the response for the specified TTL
 */
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key from request URL and query params
    const cacheKey = `cache:${req.originalUrl || req.url}`;

    try {
      // Try to get cached response
      const cachedResponse = await CacheService.get(cacheKey);

      if (cachedResponse) {
        // Return cached response
        return res.json(cachedResponse);
      }

      // Store original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = function (body: any) {
        // Cache the response
        CacheService.set(cacheKey, body, ttl).catch((err) => {
          console.error('Error caching response:', err);
        });

        // Call original json function
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Clear cache middleware for write operations
 * Clears cache patterns after successful write operations
 */
export const clearCacheMiddleware = (patterns: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original res.json function
    const originalJson = res.json.bind(res);

    // Override res.json to clear cache after successful response
    res.json = function (body: any) {
      // Only clear cache if response was successful (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Clear cache patterns
        patterns.forEach((pattern) => {
          CacheService.deletePattern(pattern).catch((err) => {
            console.error(`Error clearing cache pattern ${pattern}:`, err);
          });
        });
      }

      // Call original json function
      return originalJson(body);
    };

    next();
  };
};
