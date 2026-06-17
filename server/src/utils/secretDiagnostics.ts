import { createHash } from 'node:crypto';

type AnthropicKeyType = 'missing' | 'sk-ant-api03' | 'unexpected';

export type AnthropicKeyDiagnostic = {
  present: boolean;
  length: number;
  keyType: AnthropicKeyType;
  looksLikeAnthropicKey: boolean;
  sha256Prefix: string | null;
};

export function describeAnthropicApiKey(
  apiKey: string | undefined,
): AnthropicKeyDiagnostic {
  const value = apiKey?.trim() ?? '';

  if (!value) {
    return {
      present: false,
      length: 0,
      keyType: 'missing',
      looksLikeAnthropicKey: false,
      sha256Prefix: null,
    };
  }

  const looksLikeAnthropicKey = value.startsWith('sk-ant-api03-');

  return {
    present: true,
    length: value.length,
    keyType: looksLikeAnthropicKey ? 'sk-ant-api03' : 'unexpected',
    looksLikeAnthropicKey,
    sha256Prefix: createHash('sha256').update(value).digest('hex').slice(0, 12),
  };
}
