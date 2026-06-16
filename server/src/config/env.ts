import 'dotenv/config';

// Throws on boot if a required secret is absent — fail fast, never undefined.
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

// Centralized, typed env access. The rest of the app never touches
// process.env directly.
//
// Note: we use the PUBLISHABLE key (sb_publishable_...), not the secret key.
// The server runs queries as the authenticated user via their JWT, so RLS
// enforces ownership.
export const env = {
  port: Number(process.env.PORT) || 3001,
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  supabaseUrl: required('SUPABASE_URL'),
  supabasePublishableKey: required('SUPABASE_PUBLISHABLE_KEY'),
} as const;
