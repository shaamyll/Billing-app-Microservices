import "dotenv/config";

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  BOOKING_SERVICE_URL: string;
  PAYMENT_SERVICE_URL: string;
  KAFKA_BROKERS: string[];
  KAFKA_CLIENT_ID: string;
  KAFKA_TOPIC_BOOKING_EVENTS: string;
}

export const env: EnvConfig = {
  PORT: Number(process.env.PORT) || 3011,
  NODE_ENV: process.env.NODE_ENV || "development",
  BOOKING_SERVICE_URL: process.env.BOOKING_SERVICE_URL || "http://localhost:3009",
  PAYMENT_SERVICE_URL: process.env.PAYMENT_SERVICE_URL || "http://localhost:3010",
  KAFKA_BROKERS: (process.env.KAFKA_BROKERS || "localhost:9092")
    .split(",")
    .map((b) => b.trim()),
  KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID || "booking-orchestrator",
  KAFKA_TOPIC_BOOKING_EVENTS:
    process.env.KAFKA_TOPIC_BOOKING_EVENTS || "booking-events",
};
