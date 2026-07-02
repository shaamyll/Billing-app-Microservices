import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  USER_DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  USER_SERVICE_URL: string;
  PRODUCT_SERVICE_URL: string;
  CUSTOMER_SERVICE_URL: string;
  INVOICE_SERVICE_URL: string;
  STORE_SERVICE_URL: string;
  NOTIFICATION_SERVICE_URL: string;
}

function validateEnv(): EnvConfig {
  const requiredEnvVars = [
    'USER_DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'USER_SERVICE_URL',
    'PRODUCT_SERVICE_URL',
    'CUSTOMER_SERVICE_URL',
    'INVOICE_SERVICE_URL',
    'STORE_SERVICE_URL',
    'NOTIFICATION_SERVICE_URL',
  ] as const;

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  return {
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    USER_DATABASE_URL: process.env.USER_DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    USER_SERVICE_URL: process.env.USER_SERVICE_URL!,
    PRODUCT_SERVICE_URL: process.env.PRODUCT_SERVICE_URL!,
    CUSTOMER_SERVICE_URL: process.env.CUSTOMER_SERVICE_URL!,
    INVOICE_SERVICE_URL: process.env.INVOICE_SERVICE_URL!,
    STORE_SERVICE_URL: process.env.STORE_SERVICE_URL!,
    NOTIFICATION_SERVICE_URL: process.env.NOTIFICATION_SERVICE_URL!,
  };
}

export const env = validateEnv();