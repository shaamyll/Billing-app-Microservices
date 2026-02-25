import { createContainer, asClass, asValue } from "awilix";
import { UserRepository } from "./repositories/user.repository";
import { UserService } from "./services/userService";
import { UserController } from "./controllers/userController";
import { prisma } from "./config/db";

export const container = createContainer();

container.register({
  prisma: asValue(prisma),

  UserRepository: asClass(UserRepository).scoped(),
  userService: asClass(UserService).scoped(),
  userController: asClass(UserController).scoped(),
});