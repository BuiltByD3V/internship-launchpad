import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Application } from '../types';

// Fields a user supplies when creating/editing (server fills id/user_id/created_at).
export type ApplicationInput = Partial<
  Pick<Application, 'company' | 'role' | 'status' | 'deadline' | 'notes' | 'job_description'>
>;

// Loads the user's applications and exposes CRUD actions that re-sync the list.
export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setApplications(await api<Application[]>('/api/applications'));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = async (input: ApplicationInput) => {
    await api('/api/applications', { method: 'POST', body: JSON.stringify(input) });
    await refresh();
  };

  const update = async (id: string, patch: ApplicationInput) => {
    await api(`/api/applications/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
    await refresh();
  };

  const remove = async (id: string) => {
    await api(`/api/applications/${id}`, { method: 'DELETE' });
    await refresh();
  };

  return { applications, loading, error, refresh, create, update, remove };
}
