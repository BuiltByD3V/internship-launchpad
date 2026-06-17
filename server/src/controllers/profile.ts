import type { Request, Response } from 'express';
import { createUserClient } from '../config/supabase.js';
import { normalizeProfileInput } from '../utils/profilePersonalization.js';

function getUserDb(req: Request, res: Response) {
  const token = req.accessToken;
  if (!token) {
    res.status(401).json({ error: 'Unauthenticated' });
    return null;
  }
  return createUserClient(token);
}

// GET /api/profile - the caller's profile row, or null if not created yet.
export async function getProfile(req: Request, res: Response): Promise<void> {
  const db = getUserDb(req, res);
  if (!db) return;

  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('user_id', req.user?.id)
    .maybeSingle();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data ?? null);
}

// PUT /api/profile - upsert the caller's profile. Partial profiles are saved,
// but onboarded only flips true after target role, experience level, and skills.
export async function upsertProfile(req: Request, res: Response): Promise<void> {
  const db = getUserDb(req, res);
  if (!db) return;

  const profile = normalizeProfileInput(req.body);

  const { data, error } = await db
    .from('profiles')
    .upsert(
      {
        user_id: req.user?.id,
        ...profile,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select()
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.json(data);
}
