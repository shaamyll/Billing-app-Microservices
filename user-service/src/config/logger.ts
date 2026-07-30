import { createLogger } from "@billing/utils";
import { env } from "./dotenv";

const logger = createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
});

export { logger };