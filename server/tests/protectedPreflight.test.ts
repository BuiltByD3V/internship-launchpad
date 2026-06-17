import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { after, describe, test } from 'node:test';
import express from 'express';

process.env.CLIENT_ORIGINS = 'https://app.example.com';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_fake';
process.env.ANTHROPIC_API_KEY = 'fake-key';

const { default: profileRouter } = await import('../src/routes/profile.js');

const app = express();
app.use('/api/profile', profileRouter);

const server = app.listen(0);
after(() => {
  server.close();
});

function serverUrl(path: string): string {
  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}${path}`;
}

describe('protected route preflight', () => {
  test('answers profile OPTIONS before auth middleware', async () => {
    const response = await fetch(serverUrl('/api/profile'), {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://app.example.com',
        'Access-Control-Request-Method': 'PUT',
        'Access-Control-Request-Headers': 'authorization,content-type',
      },
    });

    assert.equal(response.status, 204);
    assert.equal(
      response.headers.get('access-control-allow-origin'),
      'https://app.example.com',
    );
  });
});
