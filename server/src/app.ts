import express from 'express';
import { allowConfiguredCors } from './middleware/cors.js';
import applicationsRouter from './routes/applications.js';
import aiRouter from './routes/ai.js';
import profileRouter from './routes/profile.js';

const app = express();

app.use(allowConfiguredCors);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Applications CRUD (all routes require auth; queries run under the user's JWT).
app.use('/api/applications', applicationsRouter);

// Student profile used to personalize AI guidance.
app.use('/api/profile', profileRouter);

// AI features (skill-gap analysis + mock interview questions).
app.use('/api/ai', aiRouter);

export default app;
