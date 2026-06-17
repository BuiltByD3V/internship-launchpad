import type { Request, Response, NextFunction } from 'express';
import { supabasePublic } from '../config/supabase.js';

// Express middleware: gate routes behind a valid Supabase session.
//
// Flow:
//   1. Require an "Authorization: Bearer <jwt>" header.
//   2. Ask Supabase to validate the JWT (checks signature + expiry server-side).
//   3. On success, stash the user + raw token on req for downstream handlers.
//   4. On any failure, short-circuit with 401 (never call next()).
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = header.slice('Bearer '.length);

  // getUser(jwt) calls Supabase's /auth/v1/user endpoint to verify the token.
  // error is set for invalid/expired tokens; data.user is null if unverified.
  const { data, error } = await supabasePublic.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  // Downstream handlers (Step 5) use req.accessToken with createUserClient()
  // so queries run as this user and RLS enforces ownership.
  req.user = data.user;
  req.accessToken = token;
  next();
}
