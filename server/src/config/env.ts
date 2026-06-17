import 'dotenv/config';
import { parseAllowedOrigins } from '../utils/corsConfig.js';

// Throws on boot if a required secret is absent — fail fast, never undefined.
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function optionalNumber(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid numeric env var: ${name}`);
  }
  return parsed;
}

function optionalBoolean(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (!value) return fallback;

  if (value === 'true') return true;
  if (value === 'false') return false;

  throw new Error(`Invalid boolean env var: ${name}`);
}

function optionalCsv(name: string): string[] {
  const value = process.env[name];
  if (!value) return [];

  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length > 0);
}

// Centralized, typed env access. The rest of the app never touches
// process.env directly.
//
// Note: we use the PUBLISHABLE key (sb_publishable_...), not the secret key.
// The server runs queries as the authenticated user via their JWT, so RLS
// enforces ownership.
export const env = {
  port: Number(process.env.PORT) || 3001,
  clientOrigins: parseAllowedOrigins(
    process.env.CLIENT_ORIGINS ??
      process.env.CLIENT_ORIGIN ??
      'http://localhost:5173',
  ),
  supabaseUrl: required('SUPABASE_URL'),
  supabasePublishableKey: required('SUPABASE_PUBLISHABLE_KEY'),
  anthropicApiKey: required('ANTHROPIC_API_KEY'),
  ai: {
    enabled: optionalBoolean('AI_ENABLED', true),
    allowedEmails: optionalCsv('AI_ALLOWED_EMAILS'),
    dailyUserLimit: optionalNumber('AI_DAILY_USER_LIMIT', 5),
    hourlyUserLimit: optionalNumber('AI_HOURLY_USER_LIMIT', 2),
    cooldownSeconds: optionalNumber('AI_COOLDOWN_SECONDS', 30),
    maxJobDescriptionChars: optionalNumber('AI_MAX_JOB_DESCRIPTION_CHARS', 8_000),
    maxOutputTokens: optionalNumber('AI_MAX_OUTPUT_TOKENS', 900),
    cacheTtlHours: optionalNumber('AI_CACHE_TTL_HOURS', 168),
  },
} as const;
