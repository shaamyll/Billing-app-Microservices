import { createContainer, asClass, asValue } from "awilix";
import { PaymentRepository } from "./repositories/payment.repository";
import { PaymentService } from "./services/payment.service";
import { prisma } from "./config/db";
import { env } from "./config/dotenv";

export const container = createContainer();

container.register({
  prisma: asValue(prisma),
  paymentRepository: asClass(PaymentRepository).scoped(),
  paymentService: asClass(PaymentService).scoped(),
  successRate: asValue(env.PAYMENT_SUCCESS_RATE),
  simulator: asValue(undefined),
});

