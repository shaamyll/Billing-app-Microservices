import Redis from "ioredis";
import { env } from "./dotenv";
import { logger } from "./logger";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});

redis.on("error", (err) => {
  logger.error(`Redis connection error: ${err.message}`);
});

export const connectRedis = async (): Promise<boolean> => {
  try {
    if (redis.status !== "ready" && redis.status !== "connecting") {
      await redis.connect();
    }
    logger.info("✅ Redis connected (booking-service)");
    return true;
  } catch (err: unknown) {
    if (err instanceof Error) logger.error(`Redis connect failed: ${err.message}`);
    else logger.error(`Unknown error connecting to Redis: ${JSON.stringify(err)}`);
    return false;
  }
};

export const closeRedis = async (): Promise<void> => {
  try {
    if (redis.status === "ready" || redis.status === "connecting") {
      await redis.quit();
    }
    logger.info("🛑 Redis disconnected (booking-service)");
  } catch (err: unknown) {
    if (err instanceof Error) logger.error(`Redis close error: ${err.message}`);
  }
};
