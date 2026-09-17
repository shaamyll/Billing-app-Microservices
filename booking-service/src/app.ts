import express, { Request, Response, NextFunction } from "express";
import { scopePerRequest } from "awilix-express";
import { container } from "./container";
import { bookingRoutes } from "./routes/booking.routes";
import { AppResponse } from "@billing/utils";

export const createApp = () => {
  const app = express();

  app.use(express.json());

  // Attach DI container per request
  app.use(scopePerRequest(container));

  // Health check
  app.get("/health", (_req: Request, res: Response) => {
    return res.status(200).json({
      service: "booking-service",
      status: "OK",
    });
  });

  // Routes
  app.use("/bookings", bookingRoutes);
  app.use("/", bookingRoutes);

  // Global error handler
  app.use(
    (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      AppResponse.error(res, err);
    }
  );

  return app;
};
