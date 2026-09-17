import express, { Request, Response, NextFunction } from "express";
import { scopePerRequest } from "awilix-express";
import { container } from "./container";
import { busRoutes } from "./routes/busRoutes";
import { tripRoutes } from "./routes/tripRoutes";
import { AppResponse } from "@billing/utils";

export const createApp = () => {
  const app = express();

  app.use(express.json());

  // Attach DI container per request
  app.use(scopePerRequest(container));

  // Health check
  app.get("/health", (_req: Request, res: Response) => {
    return res.status(200).json({
      service: "trip-service",
      status: "OK",
    });
  });

  // Routes
  app.use("/buses", busRoutes);
  app.use("/trips", tripRoutes);

  // Global error handler
  app.use(
    (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      AppResponse.error(res, err);
    }
  );

  return app;
};
