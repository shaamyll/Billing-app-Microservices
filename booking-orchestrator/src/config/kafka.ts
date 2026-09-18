import { Kafka, Producer, logLevel } from "kafkajs";
import { env } from "./dotenv";
import { logger } from "./logger";

export interface IEventPublisher {
  publish(topic: string, eventName: string, payload: Record<string, unknown>): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

export class KafkaEventPublisher implements IEventPublisher {
  private kafka: Kafka;
  private producer: Producer;
  private isConnected = false;

  constructor(kafkaInstance?: Kafka) {
    this.kafka =
      kafkaInstance ||
      new Kafka({
        clientId: env.KAFKA_CLIENT_ID,
        brokers: env.KAFKA_BROKERS,
        logLevel: logLevel.WARN,
        retry: {
          initialRetryTime: 300,
          retries: 5,
        },
      });

    this.producer = this.kafka.producer();
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;
    try {
      await this.producer.connect();
      this.isConnected = true;
      logger.info("Kafka Producer connected successfully", {
        brokers: env.KAFKA_BROKERS,
      });
    } catch (error) {
      logger.error("Failed to connect Kafka producer", { error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.producer.disconnect();
      this.isConnected = false;
      logger.info("Kafka Producer disconnected");
    } catch (error) {
      logger.error("Error disconnecting Kafka producer", { error });
    }
  }

  async publish(
    topic: string,
    eventName: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    const message = {
      event: eventName,
      data: payload,
      timestamp: new Date().toISOString(),
    };

    await this.producer.send({
      topic,
      messages: [
        {
          key: (payload.bookingId as string) || (payload.id as string) || eventName,
          value: JSON.stringify(message),
          headers: {
            eventType: eventName,
            source: env.KAFKA_CLIENT_ID,
          },
        },
      ],
    });

    logger.info("Published event to Kafka", { topic, event: eventName });
  }
}

export const kafkaPublisher = new KafkaEventPublisher();
