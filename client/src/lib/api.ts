import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL;

interface ApiErrorBody {
  error?: string;
  code?: string;
  retryAfterSeconds?: number;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  retryAfterSeconds?: number;

  constructor(
    message: string,
    options: { status: number; code?: string; retryAfterSeconds?: number },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

// Thin fetch wrapper for our Express API. Pulls the current user's JWT from the
// Supabase session and attaches it as a Bearer token, so protected routes pass
// requireAuth. Throws on non-2xx with the server's error message.
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as ApiErrorBody;
    throw new ApiError(body.error ?? `Request failed (${res.status})`, {
      status: res.status,
      code: body.code,
      retryAfterSeconds: body.retryAfterSeconds,
    });
  }

  // 204 No Content (e.g. DELETE) has no body to parse.
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
