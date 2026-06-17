import type { Request, Response } from 'express';
import { createUserClient } from '../config/supabase.js';

// All handlers assume requireAuth ran first, so req.user + req.accessToken exist.
// We build a Supabase client bound to the user's JWT, so every query runs under
// their identity and RLS enforces row ownership at the DB. We never rely on
// app-side filtering alone for security.
function getUserDb(req: Request, res: Response) {
  const token = req.accessToken;
  if (!token) {
    res.status(401).json({ error: 'Unauthenticated' });
    return null;
  }
  return createUserClient(token);
}

// GET /api/applications — list the current user's applications, newest first.
export async function listApplications(req: Request, res: Response): Promise<void> {
  const db = getUserDb(req, res);
  if (!db) return;

  const { data, error } = await db
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json(data);
}

// POST /api/applications — create one for the current user.
export async function createApplication(req: Request, res: Response): Promise<void> {
  const db = getUserDb(req, res);
  if (!db) return;

  const { company, role, status, deadline, notes, job_description } = req.body ?? {};
  if (!company || !role) {
    res.status(400).json({ error: 'company and role are required' });
    return;
  }

  const { data, error } = await db
    .from('applications')
    .insert({
      // user_id must equal auth.uid() or the RLS insert policy rejects it.
      user_id: req.user?.id,
      company,
      role,
      ...(status ? { status } : {}),
      deadline: deadline ?? null,
      notes: notes ?? null,
      job_description: job_description ?? null,
    })
    .select()
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.status(201).json(data);
}

// GET /api/applications/:id — fetch one (RLS returns nothing if not owned).
export async function getApplication(req: Request, res: Response): Promise<void> {
  const db = getUserDb(req, res);
  if (!db) return;

  const { data, error } = await db
    .from('applications')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error || !data) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  res.json(data);
}

// PATCH /api/applications/:id — partial update of provided fields only.
export async function updateApplication(req: Request, res: Response): Promise<void> {
  const db = getUserDb(req, res);
  if (!db) return;

  const { company, role, status, deadline, notes, job_description } = req.body ?? {};
  const updates = {
    ...(company !== undefined ? { company } : {}),
    ...(role !== undefined ? { role } : {}),
    ...(status !== undefined ? { status } : {}),
    ...(deadline !== undefined ? { deadline } : {}),
    ...(notes !== undefined ? { notes } : {}),
    ...(job_description !== undefined ? { job_description } : {}),
  };

  const { data, error } = await db
    .from('applications')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) {
    res.status(404).json({ error: 'Application not found or update failed' });
    return;
  }
  res.json(data);
}

// DELETE /api/applications/:id
export async function deleteApplication(req: Request, res: Response): Promise<void> {
  const db = getUserDb(req, res);
  if (!db) return;

  const { error } = await db
    .from('applications')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.status(204).send();
}
