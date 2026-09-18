import { createLogger } from "@billing/utils";
import { env } from "./dotenv";

export const logger = createLogger({
  isProduction: env.NODE_ENV === "production",
});
