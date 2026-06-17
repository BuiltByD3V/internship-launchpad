import { createClient } from '@supabase/supabase-js';

// Browser Supabase client using the PUBLISHABLE key. Safe to ship to the client
// because RLS guards the data. Handles login/signup and persists the session
// (JWT) in localStorage so it survives refreshes.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
