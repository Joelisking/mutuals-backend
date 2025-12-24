import { getRedisClient } from '../config/redis.config';
import { env } from '../config/env.config';

export class CacheService {
  /**
   * Get cached data
   */
  static async get<T>(key: string): Promise<T | null> {
    const redis = getRedisClient();
    if (!redis) return null;

    try {
      const data = await redis.get(key);
      if (!data) return null;

      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set cached data
   */
  static async set(key: string, value: any, ttl: number = env.REDIS_TTL): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete cached data
   */
  static async delete(key: string): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    try {
      await redis.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  }

  /**
   * Delete multiple cached data by pattern
   */
  static async deletePattern(pattern: string): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error(`Cache delete pattern error for pattern ${pattern}:`, error);
    }
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    const redis = getRedisClient();
    if (!redis) return false;

    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get or set cached data (cache-aside pattern)
   */
  static async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl: number = env.REDIS_TTL
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, fetch data
    const data = await fetchFunction();

    // Store in cache
    await this.set(key, data, ttl);

    return data;
  }

  /**
   * Increment a counter
   */
  static async increment(key: string, amount: number = 1): Promise<number> {
    const redis = getRedisClient();
    if (!redis) return 0;

    try {
      return await redis.incrby(key, amount);
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  static async clear(): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    try {
      await redis.flushdb();
      console.log('✅ Cache cleared successfully');
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

/**
 * Cache key generators
 */
export const CacheKeys = {
  article: (id: string) => `article:${id}`,
  articleSlug: (slug: string) => `article:slug:${slug}`,
  articles: (page: number, limit: number) => `articles:${page}:${limit}`,
  featuredArticles: () => 'articles:featured',

  playlist: (id: string) => `playlist:${id}`,
  playlists: (page: number, limit: number) => `playlists:${page}:${limit}`,
  featuredPlaylists: () => 'playlists:featured',

  dj: (id: string) => `dj:${id}`,
  djSlug: (slug: string) => `dj:slug:${slug}`,
  djs: (page: number, limit: number) => `djs:${page}:${limit}`,
  featuredDJs: () => 'djs:featured',

  event: (id: string) => `event:${id}`,
  events: (page: number, limit: number) => `events:${page}:${limit}`,
  upcomingEvents: () => 'events:upcoming',
  featuredEvents: () => 'events:featured',

  product: (id: string) => `product:${id}`,
  productSlug: (slug: string) => `product:slug:${slug}`,
  products: (page: number, limit: number) => `products:${page}:${limit}`,
  featuredProducts: () => 'products:featured',

  heroSlides: () => 'homepage:hero-slides:active',
};
