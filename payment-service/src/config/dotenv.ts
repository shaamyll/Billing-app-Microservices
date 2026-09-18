import "dotenv/config";

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  PAYMENT_DATABASE_URL: string;
  PAYMENT_SUCCESS_RATE: number;
}

export const env: EnvConfig = {
  PORT: Number(process.env.PORT) || 3010,
  NODE_ENV: process.env.NODE_ENV || "development",
  PAYMENT_DATABASE_URL: process.env.PAYMENT_DATABASE_URL || "",
  PAYMENT_SUCCESS_RATE: process.env.PAYMENT_SUCCESS_RATE !== undefined
    ? Number(process.env.PAYMENT_SUCCESS_RATE)
    : 0.9,
};
