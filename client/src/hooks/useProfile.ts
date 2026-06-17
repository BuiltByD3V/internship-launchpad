import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Profile, ProfileInput } from '../types';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setProfile(await api<Profile | null>('/api/profile'));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = async (input: ProfileInput) => {
    const saved = await api<Profile>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(input),
    });
    setProfile(saved);
    return saved;
  };

  return { profile, loading, error, refresh, save };
}
