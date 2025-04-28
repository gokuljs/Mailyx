import { Redis } from "@upstash/redis";

class RedisHandler {
  private redis: Redis;
  constructor() {
    this.redis = Redis.fromEnv();
  }
  async get<T = any>(key: string): Promise<T | null> {
    const result = await this.redis.get(key);
    return result as T | null;
  }

  async set(
    key: string,
    value: unknown,
    ttlSeconds: number = 3600,
  ): Promise<void> {
    await this.redis.set(key, value, {
      ex: ttlSeconds,
    });
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }
}

const redisHandler = new RedisHandler();
export default redisHandler;
