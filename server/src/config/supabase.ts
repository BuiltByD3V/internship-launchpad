import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

const authOptions = { autoRefreshToken: false, persistSession: false } as const;

// Base client with the PUBLISHABLE key — no elevated privileges.
// Used to verify a user's JWT in the auth middleware: supabasePublic.auth.getUser(token).
export const supabasePublic = createClient(env.supabaseUrl, env.supabasePublishableKey, {
  auth: authOptions,
});

// Per-request client scoped to ONE user. Forwards their JWT, so every query
// runs as that user and RLS enforces row ownership at the database — even if
// app code forgets to filter by user_id. Use this for ALL user-scoped data.
export function createUserClient(accessToken: string) {
  return createClient(env.supabaseUrl, env.supabasePublishableKey, {
    auth: authOptions,
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
