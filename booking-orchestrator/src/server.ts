import { createApp } from "./app";
import { env } from "./config/dotenv";
import { logger } from "./config/logger";
import { kafkaPublisher } from "./config/kafka";

const PORT = env.PORT || 3011;

const startServer = async () => {
  try {
    // Attempt Kafka connection
    try {
      await kafkaPublisher.connect();
    } catch (kafkaError) {
      logger.warn(
        "⚠️ Kafka broker not ready yet. Will retry connection on event publish.",
        { error: kafkaError }
      );
    }

    const app = createApp();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Booking Orchestrator running on port ${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info("🛑 Shutting down Booking Orchestrator...");

      server.close(async () => {
        await kafkaPublisher.disconnect();
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    logger.error("❌ Failed to start Booking Orchestrator", { error });
    process.exit(1);
  }
};

startServer();
