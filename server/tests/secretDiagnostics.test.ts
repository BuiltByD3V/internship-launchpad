import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { describeAnthropicApiKey } from '../src/utils/secretDiagnostics.js';

describe('secret diagnostics', () => {
  test('describes Anthropic keys without exposing the secret value', () => {
    const key = ' sk-ant-api03-random-secret-value \n';
    const diagnostic = describeAnthropicApiKey(key);
    const serialized = JSON.stringify(diagnostic);

    assert.equal(diagnostic.present, true);
    assert.equal(diagnostic.length, 'sk-ant-api03-random-secret-value'.length);
    assert.equal(diagnostic.keyType, 'sk-ant-api03');
    assert.equal(diagnostic.looksLikeAnthropicKey, true);
    assert.match(diagnostic.sha256Prefix ?? '', /^[a-f0-9]{12}$/);
    assert.equal(serialized.includes('random-secret-value'), false);
  });

  test('marks missing and unexpected Anthropic keys clearly', () => {
    assert.deepEqual(describeAnthropicApiKey('   '), {
      present: false,
      length: 0,
      keyType: 'missing',
      looksLikeAnthropicKey: false,
      sha256Prefix: null,
    });

    assert.deepEqual(describeAnthropicApiKey('not-an-anthropic-key'), {
      present: true,
      length: 'not-an-anthropic-key'.length,
      keyType: 'unexpected',
      looksLikeAnthropicKey: false,
      sha256Prefix: describeAnthropicApiKey('not-an-anthropic-key').sha256Prefix,
    });
  });
});
