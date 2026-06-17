import assert from 'node:assert/strict';
import { afterEach, describe, test } from 'node:test';

const envKeys = [
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'ANTHROPIC_API_KEY',
  'AI_ENABLED',
  'AI_DAILY_USER_LIMIT',
];

const originalEnv = new Map(
  envKeys.map((key) => [key, process.env[key]] as const),
);

function restoreEnv() {
  for (const key of envKeys) {
    const original = originalEnv.get(key);
    if (original === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = original;
    }
  }
}

describe('env config', () => {
  afterEach(() => {
    restoreEnv();
  });

  test('trims values loaded from deployment environment variables', async () => {
    process.env.SUPABASE_URL = ' https://example.supabase.co \n';
    process.env.SUPABASE_PUBLISHABLE_KEY = ' sb_publishable_test \n';
    process.env.ANTHROPIC_API_KEY = ' sk-ant-api03-test \n';
    process.env.AI_ENABLED = ' false ';
    process.env.AI_DAILY_USER_LIMIT = ' 7 ';

    const { env } = await import(
      `../src/config/env.js?env-config-test=${Date.now()}`
    );

    assert.equal(env.supabaseUrl, 'https://example.supabase.co');
    assert.equal(env.supabasePublishableKey, 'sb_publishable_test');
    assert.equal(env.anthropicApiKey, 'sk-ant-api03-test');
    assert.equal(env.ai.enabled, false);
    assert.equal(env.ai.dailyUserLimit, 7);
  });
});
