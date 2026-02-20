import { createContainer, asClass, asValue } from "awilix";
import { prisma } from "./config/prisma.js";

// import { UserService } from "./modules/user/user.service.js";
// import { UserController } from "./modules/user/user.controller.js";

export const container = createContainer();

container.register({
  prisma: asValue(prisma),

//   userService: asClass(UserService).scoped(),
//   userController: asClass(UserController).scoped(),
});