import express from 'express';

const createApp = () => {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/api/health', (req, res) => {
    return res.status(200).json({
      status: 'OK',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
    });
  });

  // TODO: Attach routers here later

  // Global error handler (basic)
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
};

export default createApp;