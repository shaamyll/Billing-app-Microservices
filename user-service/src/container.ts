import { createContainer, asClass, asValue } from "awilix";
import { prisma } from "./config/prisma.js";
import { UserRepository } from "./repositories/user.repository.js";
import { UserService } from "./services/userService.js";

// import { UserService } from "./modules/user/user.service.js";
// import { UserController } from "./modules/user/user.controller.js";

export const container = createContainer();

container.register({
  prisma: asValue(prisma),

  UserRepository: asClass(UserRepository).scoped(),
  userService: asClass(UserService).scoped(),
//   userController: asClass(UserController).scoped(),
});