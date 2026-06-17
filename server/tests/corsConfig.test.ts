import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  isAllowedOrigin,
  parseAllowedOrigins,
} from '../src/utils/corsConfig.js';

describe('CORS config', () => {
  test('parses exact origins from comma-separated env strings', () => {
    assert.deepEqual(
      parseAllowedOrigins(' http://localhost:5173, https://app.example.com/ '),
      ['http://localhost:5173', 'https://app.example.com'],
    );
  });

  test('rejects wildcard and malformed origins', () => {
    assert.deepEqual(
      parseAllowedOrigins('*, https://safe.example.com, definitely-not-a-url'),
      ['https://safe.example.com'],
    );
  });

  test('allows requests with no origin and exact configured origins only', () => {
    const allowed = ['http://localhost:5173', 'https://app.example.com'];

    assert.equal(isAllowedOrigin(undefined, allowed), true);
    assert.equal(isAllowedOrigin('https://app.example.com', allowed), true);
    assert.equal(isAllowedOrigin('https://evil.example.com', allowed), false);
  });
});
