import Redis from "ioredis";
import crypto from "crypto";
import { ILockService } from "../interface/bookingInterface";
import { logger } from "../config/logger";

const RELEASE_LOCK_LUA = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

export class RedisLockService implements ILockService {
  private redis: Redis;

  constructor({ redisClient }: { redisClient: Redis }) {
    this.redis = redisClient;
  }

  async acquireLock(key: string, ttlMs: number): Promise<string | null> {
    const lockValue = crypto.randomUUID();
    const result = await this.redis.set(key, lockValue, "PX", ttlMs, "NX");
    if (result === "OK") {
      return lockValue;
    }
    return null;
  }

  async releaseLock(key: string, lockValue: string): Promise<boolean> {
    try {
      const result = await this.redis.eval(
        RELEASE_LOCK_LUA,
        1,
        key,
        lockValue
      );
      return result === 1;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Failed to release lock for ${key}: ${error.message}`);
      }
      return false;
    }
  }
}
