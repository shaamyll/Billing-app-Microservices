import { createContainer, asClass, asValue } from "awilix";
import { RouteRepository } from "./repositories/route.repository";
import { RouteService } from "./services/routeService";
import { prisma } from "./config/db";

export const container = createContainer();

container.register({
  prisma: asValue(prisma),

  routeRepository: asClass(RouteRepository).scoped(),
  routeService: asClass(RouteService).scoped(),
});
