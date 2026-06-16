import 'dotenv/config';

// Centralized, typed env access. Add new vars here as later steps need them
// (Supabase in Step 2, Anthropic in Step 6) so the rest of the app never
// touches process.env directly.
export const env = {
  port: Number(process.env.PORT) || 3001,
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
} as const;
