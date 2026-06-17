import { createHash } from 'node:crypto';

export interface AiLimitConfig {
  dailyUserLimit: number;
  hourlyUserLimit: number;
  cooldownSeconds: number;
  maxJobDescriptionChars: number;
}

export interface UsageWindowEvent {
  createdAt: Date;
  cacheHit: boolean;
  success: boolean;
}

export type ValidationResult =
  | { ok: true; value: string }
  | { ok: false; status: 400 | 413; error: string };

export type UsageLimitResult =
  | { allowed: true }
  | {
      allowed: false;
      status: 429;
      code: 'cooldown' | 'hourly_limit' | 'daily_limit';
      error: string;
      retryAfterSeconds: number;
    };

export function validateJobDescription(
  value: unknown,
  maxChars: number,
): ValidationResult {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return {
      ok: false,
      status: 400,
      error: 'Paste a job description before running analysis.',
    };
  }

  const trimmed = value.trim();
  if (trimmed.length > maxChars) {
    return {
      ok: false,
      status: 413,
      error: `Job description is too long. Keep it under ${maxChars.toLocaleString()} characters.`,
    };
  }

  return { ok: true, value: trimmed };
}

export function normalizeJobDescription(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function hashJobDescription(value: string): string {
  return createHash('sha256')
    .update(normalizeJobDescription(value))
    .digest('hex');
}

export function estimateTokenCount(value: string): number {
  return Math.max(1, Math.ceil(value.length / 4));
}

export function evaluateUsageLimit({
  events,
  now,
  config,
}: {
  events: UsageWindowEvent[];
  now: Date;
  config: AiLimitConfig;
}): UsageLimitResult {
  const paidEvents = events
    .filter((event) => event.success && !event.cacheHit)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const latest = paidEvents[0];
  if (latest) {
    const secondsSinceLatest = Math.floor(
      (now.getTime() - latest.createdAt.getTime()) / 1000,
    );
    const retryAfter = config.cooldownSeconds - secondsSinceLatest;
    if (retryAfter > 0) {
      return {
        allowed: false,
        status: 429,
        code: 'cooldown',
        error: `Please wait ${retryAfter} seconds before running another AI analysis.`,
        retryAfterSeconds: retryAfter,
      };
    }
  }

  const oneHourAgo = now.getTime() - 60 * 60 * 1000;
  const hourlyCount = paidEvents.filter(
    (event) => event.createdAt.getTime() >= oneHourAgo,
  ).length;
  if (hourlyCount >= config.hourlyUserLimit) {
    return {
      allowed: false,
      status: 429,
      code: 'hourly_limit',
      error: `Hourly AI limit reached. Try again later.`,
      retryAfterSeconds: secondsUntilOldestEventLeavesWindow(paidEvents, now, 60 * 60),
    };
  }

  const oneDayAgo = now.getTime() - 24 * 60 * 60 * 1000;
  const dailyCount = paidEvents.filter(
    (event) => event.createdAt.getTime() >= oneDayAgo,
  ).length;
  if (dailyCount >= config.dailyUserLimit) {
    return {
      allowed: false,
      status: 429,
      code: 'daily_limit',
      error: `Daily AI limit reached. Try again tomorrow.`,
      retryAfterSeconds: secondsUntilOldestEventLeavesWindow(
        paidEvents,
        now,
        24 * 60 * 60,
      ),
    };
  }

  return { allowed: true };
}

function secondsUntilOldestEventLeavesWindow(
  events: UsageWindowEvent[],
  now: Date,
  windowSeconds: number,
): number {
  const oldest = events
    .filter((event) => now.getTime() - event.createdAt.getTime() <= windowSeconds * 1000)
    .at(-1);

  if (!oldest) return windowSeconds;

  const ageSeconds = Math.floor(
    (now.getTime() - oldest.createdAt.getTime()) / 1000,
  );
  return Math.max(1, windowSeconds - ageSeconds);
}
