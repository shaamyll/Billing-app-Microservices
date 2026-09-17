import "dotenv/config";

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  ROUTE_DATABASE_URL: string;
}

export const env: EnvConfig = {
  PORT: Number(process.env.PORT) || 3007,
  NODE_ENV: process.env.NODE_ENV || "development",
  ROUTE_DATABASE_URL: process.env.ROUTE_DATABASE_URL || "",
};
