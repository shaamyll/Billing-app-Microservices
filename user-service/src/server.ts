import { createApp } from "./app";
import { logger } from "@billing/utils";
import { closePrisma, connectPrisma } from "./config/db";
import { env } from "config/dotenv";

const PORT = env.PORT || 3002;

const startServer = async () => {
  try {
    await connectPrisma();

    const app = createApp();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 User Service running on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info("🛑 Shutting down server...");

      server.close(async () => {
        await closePrisma();
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

  } catch (error) {
    logger.error("❌ Failed to start server");
    process.exit(1);
  }
};

startServer();