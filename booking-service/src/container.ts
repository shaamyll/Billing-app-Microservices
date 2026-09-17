import { createContainer, asClass, asValue } from "awilix";
import { BookingRepository } from "./repositories/booking.repository";
import { BookingService } from "./services/booking.service";
import { RedisLockService } from "./services/lock.service";
import { prisma } from "./config/db";
import { redis } from "./config/redis";

export const container = createContainer();

container.register({
  prisma: asValue(prisma),
  redisClient: asValue(redis),
  bookingRepository: asClass(BookingRepository).scoped(),
  lockService: asClass(RedisLockService).scoped(),
  bookingService: asClass(BookingService).scoped(),
});
