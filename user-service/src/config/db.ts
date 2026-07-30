import { createLogger } from "@billing/utils";
import { PrismaClient } from "../generated/prisma/client";
import { env } from "./dotenv";
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: env.USER_DATABASE_URL, ssl: false });

const logger = createLogger({
  isProduction: env.NODE_ENV === 'production',
});

// prisma client instance
export const prisma = new PrismaClient({
  adapter,
  log: ["query", "info", "warn", "error"],
  errorFormat: "pretty",
}).$extends({
  query: {
    async $allOperations({
      operation,
      model,
      args,
      query,
    }: {
      operation: string;
      model?: string;
      args: unknown;
      query: (args: unknown) => Promise<unknown>;
    }) {
      const start = Date.now();
      const result = await query(args);
      const duration = Date.now() - start;
      logger.info(`Prisma ${model ?? "RAW"}.${operation} took ${duration}ms`);
      return result;
    },
  },
});

// connect prisma
export const connectPrisma = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    logger.info("✅ Prisma connected");
    return true;
  } catch (err: unknown) {
    if (err instanceof Error) logger.error(err.message);
    else logger.error(`Unknown error connecting to Prisma [ERROR] ${JSON.stringify(err)}`);
    process.exit(1);
  }
};

// Gracefully disconnect Prisma on app shutdown
export const closePrisma = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info("🛑 Prisma disconnected");
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
    } else {
      logger.error(`Unknown error disconnecting Prisma [ERROR] ${JSON.stringify(err)}`);
    }
    process.exit(1);
  }
};
