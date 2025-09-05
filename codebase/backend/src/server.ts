import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { connectToDatabase } from './startup/mongoose';
import { registerRoutes } from './startup/routes';
import { startCron } from './startup/cron';

dotenv.config();

const logger = pino({ transport: { target: 'pino-pretty' } });

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors({ origin: 'http://localhost:3000', credentials: false }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// Serve static uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Healthcheck
app.get('/api/health', (_req, res) => {
  res.json({ data: { status: 'ok' } });
});

registerRoutes(app);

async function start() {
  await connectToDatabase(logger);
  app.listen(port, () => {
    logger.info(`Backend listening on http://localhost:${port}`);
  });
  startCron();
}

start().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});


