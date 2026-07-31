import express, {
  NextFunction,
  Request,
  Response,
} from 'express';
import { AppResponse } from "@billing/utils";
import authRoutes from './routes/auth.routes';

const createApp = () => {
  const app = express();

  // Register API routes
  app.use("/api", authRoutes);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health Check
  app.get('/health', (_req: Request, res: Response) => {
    return res.status(200).json({
      service: 'api-gateway',
      status: 'OK',
    });
  });

  // Global Error Handler
  app.use(
    (
      err: unknown,
      _req: Request,
      res: Response,
      _next: NextFunction,
    ) => {
      AppResponse.error(res, err);
    },
  );

  return app;
};

export default createApp;