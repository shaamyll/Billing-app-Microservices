import express, { Request, Response, NextFunction } from "express";
import { scopePerRequest } from "awilix-express";
import { container } from "./container";
import { paymentRoutes } from "./routes/payment.routes";
import { AppResponse } from "@billing/utils";

export const createApp = () => {
  const app = express();

  app.use(express.json());

  // Attach DI container per request
  app.use(scopePerRequest(container));

  // Health check
  app.get("/health", (_req: Request, res: Response) => {
    return res.status(200).json({
      service: "payment-service",
      status: "OK",
    });
  });

  // Routes
  app.use("/payments", paymentRoutes);
  app.use("/", paymentRoutes);

  // Global error handler
  app.use(
    (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      AppResponse.error(res, err);
    }
  );

  return app;
};
