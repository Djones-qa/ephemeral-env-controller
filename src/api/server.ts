import express from 'express';
import cors from 'cors';
import { loadAppConfig } from '../config/loader';
import { logger } from '../config/logger';

const app = express();
const config = loadAppConfig();
app.use(cors());
app.use(express.json());
app.get('/api/health', (_req, res) => { res.json({ status: 'healthy', timestamp: new Date().toISOString(), version: '1.0.0' }); });

export function startServer(): void {
  app.listen(config.port, () => {
    logger.info(`Ephemeral Env Controller running on port ${config.port}`);
    logger.info(`Health check: http://localhost:${config.port}/api/health`);
  });
}
export { app };
