import type { User } from '@supabase/supabase-js';

// Augment Express's Request type so handlers can read req.user / req.accessToken
// with full typing after requireAuth runs. Both optional: they only exist on
// requests that passed the middleware.
declare global {
  namespace Express {
    interface Request {
      user?: User;
      accessToken?: string;
    }
  }
}

export {};
