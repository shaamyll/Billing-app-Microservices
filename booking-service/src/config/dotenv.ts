import "dotenv/config";

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  BOOKING_DATABASE_URL: string;
  HOLD_DURATION_MINUTES: number;
  REDIS_URL: string;
  LOCK_TTL_MS: number;
}

export const env: EnvConfig = {
  PORT: Number(process.env.PORT) || 3009,
  NODE_ENV: process.env.NODE_ENV || "development",
  BOOKING_DATABASE_URL: process.env.BOOKING_DATABASE_URL || "",
  HOLD_DURATION_MINUTES: Number(process.env.HOLD_DURATION_MINUTES) || 5,
  REDIS_URL: process.env.REDIS_URL || "redis://:shamilpk708@localhost:6379",
  LOCK_TTL_MS: Number(process.env.LOCK_TTL_MS) || 5000,
};
