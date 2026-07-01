import dotenv from 'dotenv';
import { LoggerService } from '../shared/logger/LoggerService';
import createApp from './app';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize logger
const logger = LoggerService.getInstance({
  serviceName: 'api-gateway',
  isProduction: NODE_ENV === 'production',
});

const app = createApp();

app.listen(PORT, HOST, () => {
  logger.info('API Gateway started successfully', { port: PORT, host: HOST });
});