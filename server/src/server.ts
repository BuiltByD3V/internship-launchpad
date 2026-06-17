import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { supabasePublic } from './config/supabase.js';
import { requireAuth } from './middleware/auth.js';

const app = express();

app.use(cors({ origin: env.clientOrigin }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// TEMP (Step 4 verification) — proves requireAuth: 401 without a token,
// returns the user when a valid JWT is sent. Remove later.
app.get('/api/me', requireAuth, (req, res) => {
  res.json(req.user);
});

// TEMP (Step 2/3 verification) — proves the anon key + DB connection work.
// Succeeds once the applications table + RLS exist (Step 3). Remove later.
app.get('/health/db', async (_req, res) => {
  const { error } = await supabasePublic
    .from('applications')
    .select('id', { head: true, count: 'exact' });
  if (error) {
    res.status(500).json({ status: 'error', message: error.message });
    return;
  }
  res.json({ status: 'ok' });
});

app.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});
