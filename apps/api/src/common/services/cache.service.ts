import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redis: Redis | null = null;
  private memoryCache = new Map<string, { value: string; expiry: number }>();
  private useRedis = false;

  async onModuleInit() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);

    try {
      this.redis = new Redis({
        host,
        port,
        maxRetriesPerRequest: 1,
        connectTimeout: 1000,
        retryStrategy: () => null, // Don't keep retrying if Redis is not running locally
      });

      this.redis.on('connect', () => {
        this.useRedis = true;
        this.logger.log(`✓ Redis connected at ${host}:${port}`);
      });

      this.redis.on('error', () => {
        if (this.useRedis) {
          this.logger.warn('Redis connection lost. Falling back to resilient in-memory cache.');
        }
        this.useRedis = false;
      });
    } catch {
      this.useRedis = false;
      this.logger.log('Redis not detected. Using high-performance in-memory cache.');
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.useRedis && this.redis) {
      try {
        return await this.redis.get(key);
      } catch {
        // Fall back to memory
      }
    }

    const item = this.memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.memoryCache.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds: number = 300): Promise<void> {
    if (this.useRedis && this.redis) {
      try {
        await this.redis.set(key, value, 'EX', ttlSeconds);
        return;
      } catch {
        // Fall back to memory
      }
    }

    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    if (this.useRedis && this.redis) {
      try {
        await this.redis.del(key);
      } catch {
        // ignore
      }
    }
    this.memoryCache.delete(key);
  }

  async onModuleDestroy() {
    if (this.redis) {
      try {
        this.redis.disconnect();
      } catch {
        // ignore
      }
    }
  }
}
