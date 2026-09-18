import { createContainer, asClass, asValue, asFunction } from "awilix";
import { BookingServiceClient } from "./clients/bookingServiceClient";
import { PaymentServiceClient } from "./clients/paymentServiceClient";
import { kafkaPublisher } from "./config/kafka";
import { BookingOrchestratorService } from "./services/bookingOrchestrator.service";

import { env } from "./config/dotenv";

export const container = createContainer();

container.register({
  bookingClient: asFunction(() => new BookingServiceClient()).singleton(),
  paymentClient: asFunction(() => new PaymentServiceClient()).singleton(),
  eventPublisher: asValue(kafkaPublisher),
  topic: asValue(env.KAFKA_TOPIC_BOOKING_EVENTS),
  orchestratorService: asClass(BookingOrchestratorService).scoped(),
});


