import "dotenv/config";

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  TRIP_DATABASE_URL: string;
}

export const env: EnvConfig = {
  PORT: Number(process.env.PORT) || 3008,
  NODE_ENV: process.env.NODE_ENV || "development",
  TRIP_DATABASE_URL: process.env.TRIP_DATABASE_URL || process.env.DATABASE_URL || "",
};
