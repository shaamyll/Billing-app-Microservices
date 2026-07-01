import express, { Request, Response, NextFunction } from "express";
import { scopePerRequest } from "awilix-express";
import { container } from "./container";
import { userRoutes } from "./routes/userRoutes";
import { AppResponse } from "../../utils/src";

export const createApp = () => {
  const app = express();

  app.use(express.json());

  // Attach DI container per request
  app.use(scopePerRequest(container));

  // Routes
  app.use("/api/users", userRoutes);

  // Health check
  app.get("/health", (_req: Request, res: Response) => {
    return res.status(200).json({
      service: "user-service",
      status: "OK",
    });
  });

  // Global error handler
  app.use(
    (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      AppResponse.error(res, err);
    }
  );

  return app;
};