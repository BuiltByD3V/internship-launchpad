import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';

const app = express();

app.use(cors({ origin: env.clientOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});
