import winston from 'winston';

export interface LoggerConfig {
  /**
   * Explicit winston level (e.g. 'debug', 'info', 'warn', 'error').
   * Takes precedence over `isProduction` if both are supplied.
   */
  level?: string;
  /**
   * Convenience flag so callers can pass along their own NODE_ENV
   * check without the utils package ever reading process.env itself.
   * level defaults to 'info' when true, 'debug' when false.
   */
  isProduction?: boolean;
}

const logFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
});

function resolveLevel(config: LoggerConfig): string {
  if (config.level) {
    return config.level;
  }
  return config.isProduction ? 'info' : 'debug';
}

/**
 * Factory for a winston logger. The caller (each microservice) decides
 * the level/environment; this module never reads process.env directly.
 */
export function createLogger(config: LoggerConfig = {}): winston.Logger {
  return winston.createLogger({
    level: resolveLevel(config),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      logFormat
    ),
    transports: [new winston.transports.Console()],
  });
}

export default createLogger;