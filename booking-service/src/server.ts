import { createApp } from "./app";
import { closePrisma, connectPrisma } from "./config/db";
import { closeRedis, connectRedis } from "./config/redis";
import { env } from "./config/dotenv";
import { logger } from "./config/logger";

const PORT = env.PORT || 3009;

const startServer = async () => {
  try {
    await connectPrisma();
    await connectRedis();

    const app = createApp();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Booking Service running on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info("🛑 Shutting down Booking Service...");

      server.close(async () => {
        await closePrisma();
        await closeRedis();
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    logger.error("❌ Failed to start Booking Service");
    process.exit(1);
  }
};

startServer();
