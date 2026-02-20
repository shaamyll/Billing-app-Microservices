import express from "express";
import { scopePerRequest } from "awilix-express";
import { container } from "./container.js";

export const createApp = () => {
  const app = express();

  app.use(express.json());

  // Attach DI container per request
  app.use(scopePerRequest(container));

  const userController = container.resolve("userController");

//   app.get("/health", userController.health);

  return app;
};