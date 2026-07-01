import createApp from './app';
import { logger } from '@billing/utils';
import { env } from './config/dotenv';

const PORT = env.PORT || 3000;

const startServer = async () => {
  try {
    const app = createApp();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 API Gateway running on ${PORT}`);
    });

    const shutdown = async () => {
      logger.info('🛑 Shutting down API Gateway...');

      server.close(() => {
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    logger.error('❌ Failed to start API Gateway', error);
    process.exit(1);
  }
};

startServer();