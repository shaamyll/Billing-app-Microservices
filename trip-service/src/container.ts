import { createContainer, asClass, asValue } from "awilix";
import { BusRepository } from "./repositories/bus.repository";
import { SeatRepository } from "./repositories/seat.repository";
import { TripRepository } from "./repositories/trip.repository";
import { BusService } from "./services/busService";
import { TripService } from "./services/tripService";
import { prisma } from "./config/db";

export const container = createContainer();

container.register({
  prisma: asValue(prisma),

  busRepository: asClass(BusRepository).scoped(),
  seatRepository: asClass(SeatRepository).scoped(),
  tripRepository: asClass(TripRepository).scoped(),

  busService: asClass(BusService).scoped(),
  tripService: asClass(TripService).scoped(),
});
