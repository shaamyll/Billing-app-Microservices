import { createContainer, asClass, asValue } from "awilix";
import { UserRepository } from "./repositories/user.repository";
import { UserService } from "./services/userService";
import { prisma } from "./config/db";

export const container = createContainer();

container.register({
  prisma: asValue(prisma),

  userRepository: asClass(UserRepository).scoped(),
  userService: asClass(UserService).scoped(),
});