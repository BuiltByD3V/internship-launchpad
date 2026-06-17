import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  evaluateUsageLimit,
  hashJobDescription,
  normalizeJobDescription,
  validateJobDescription,
  type AiLimitConfig,
  type UsageWindowEvent,
} from '../src/utils/aiCostControls.js';

const baseConfig: AiLimitConfig = {
  dailyUserLimit: 5,
  hourlyUserLimit: 2,
  cooldownSeconds: 30,
  maxJobDescriptionChars: 8_000,
};

const now = new Date('2026-06-17T16:00:00.000Z');

function event(secondsAgo: number, cacheHit = false): UsageWindowEvent {
  return {
    createdAt: new Date(now.getTime() - secondsAgo * 1000),
    cacheHit,
    success: true,
  };
}

describe('AI cost controls', () => {
  test('normalizes equivalent job descriptions for cache keys', () => {
    assert.equal(
      normalizeJobDescription('  Backend   Intern\nReact APIs  '),
      'backend intern react apis',
    );
  });

  test('hashes whitespace-equivalent descriptions the same way', () => {
    assert.equal(
      hashJobDescription('Backend Intern\n\nReact APIs'),
      hashJobDescription('  backend   intern react apis  '),
    );
  });

  test('rejects empty and oversized job descriptions before paid AI work', () => {
    assert.deepEqual(validateJobDescription('   ', 10), {
      ok: false,
      status: 400,
      error: 'Paste a job description before running analysis.',
    });

    assert.deepEqual(validateJobDescription('12345678901', 10), {
      ok: false,
      status: 413,
      error: 'Job description is too long. Keep it under 10 characters.',
    });
  });

  test('blocks requests during the cooldown window', () => {
    const result = evaluateUsageLimit({
      events: [event(10)],
      now,
      config: { ...baseConfig, hourlyUserLimit: 10 },
    });

    assert.equal(result.allowed, false);
    assert.equal(result.status, 429);
    assert.equal(result.code, 'cooldown');
    assert.equal(result.retryAfterSeconds, 20);
  });

  test('blocks requests once the hourly uncached limit is reached', () => {
    const result = evaluateUsageLimit({
      events: [event(600), event(1_200)],
      now,
      config: baseConfig,
    });

    assert.equal(result.allowed, false);
    assert.equal(result.status, 429);
    assert.equal(result.code, 'hourly_limit');
  });

  test('does not count cache hits against hourly or daily paid-call limits', () => {
    const events: UsageWindowEvent[] = [
      event(600),
      event(1_200, true),
      event(90_000, true),
    ];

    const result = evaluateUsageLimit({
      events,
      now,
      config: { ...baseConfig, hourlyUserLimit: 2, dailyUserLimit: 2 },
    });

    assert.equal(result.allowed, true);
  });

  test('does not count failed AI calls against cooldown or quota', () => {
    const events: UsageWindowEvent[] = [
      { createdAt: new Date(now.getTime() - 10 * 1000), cacheHit: false, success: false },
      { createdAt: new Date(now.getTime() - 600 * 1000), cacheHit: false, success: false },
      { createdAt: new Date(now.getTime() - 1_200 * 1000), cacheHit: false, success: false },
    ];

    const result = evaluateUsageLimit({
      events,
      now,
      config: { ...baseConfig, hourlyUserLimit: 2, dailyUserLimit: 2 },
    });

    assert.equal(result.allowed, true);
  });
});
