import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { isAllowedOrigin } from './utils/corsConfig.js';
import applicationsRouter from './routes/applications.js';
import aiRouter from './routes/ai.js';

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin, env.clientOrigins)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed by CORS'));
    },
  }),
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Applications CRUD (all routes require auth; queries run under the user's JWT).
app.use('/api/applications', applicationsRouter);

// AI features (skill-gap analysis + mock interview questions).
app.use('/api/ai', aiRouter);

export default app;
