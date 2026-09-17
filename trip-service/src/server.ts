import { createApp } from "./app";
import { closePrisma, connectPrisma } from "./config/db";
import { env } from "./config/dotenv";
import { logger } from "./config/logger";

const PORT = env.PORT || 3008;

const startServer = async () => {
  try {
    await connectPrisma();

    const app = createApp();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Trip Service running on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info("🛑 Shutting down Trip Service...");

      server.close(async () => {
        await closePrisma();
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    logger.error("❌ Failed to start Trip Service");
    process.exit(1);
  }
};

startServer();
