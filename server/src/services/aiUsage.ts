import type { SupabaseClient } from '@supabase/supabase-js';
import type { UsageWindowEvent } from '../utils/aiCostControls.js';
import type { JobAnalysisResult } from '../types/index.js';

export interface UsageQueryResult {
  events: UsageWindowEvent[];
  error: string | null;
}

export interface CacheQueryResult {
  result: JobAnalysisResult | null;
  error: string | null;
}

export interface RecordUsageInput {
  userId: string;
  endpoint: string;
  requestHash: string;
  inputChars: number;
  estimatedInputTokens: number;
  inputTokens: number | null;
  outputTokens: number | null;
  cacheHit: boolean;
  success: boolean;
  errorCode: string | null;
}

export async function getRecentUsageEvents(
  db: SupabaseClient,
  userId: string,
  since: Date,
): Promise<UsageQueryResult> {
  const { data, error } = await db
    .from('ai_usage_events')
    .select('created_at, cache_hit, success')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false });

  if (error) return { events: [], error: error.message };

  const rows = (data ?? []) as Array<{
    created_at: string;
    cache_hit: boolean;
    success: boolean;
  }>;
  return {
    events: rows.map((row) => ({
      createdAt: new Date(row.created_at),
      cacheHit: row.cache_hit,
      success: row.success,
    })),
    error: null,
  };
}

export async function getCachedAnalysis(
  db: SupabaseClient,
  userId: string,
  requestHash: string,
  now: Date,
): Promise<CacheQueryResult> {
  const { data, error } = await db
    .from('ai_analysis_cache')
    .select('result')
    .eq('user_id', userId)
    .eq('request_hash', requestHash)
    .gt('expires_at', now.toISOString())
    .maybeSingle();

  if (error) return { result: null, error: error.message };

  const row = data as { result?: unknown } | null;
  if (!row?.result || !isJobAnalysisResult(row.result)) {
    return { result: null, error: null };
  }

  return { result: row.result, error: null };
}

export async function saveCachedAnalysis({
  db,
  userId,
  requestHash,
  result,
  inputChars,
  expiresAt,
}: {
  db: SupabaseClient;
  userId: string;
  requestHash: string;
  result: JobAnalysisResult;
  inputChars: number;
  expiresAt: Date;
}): Promise<string | null> {
  const { error } = await db.from('ai_analysis_cache').upsert(
    {
      user_id: userId,
      request_hash: requestHash,
      result,
      input_chars: inputChars,
      expires_at: expiresAt.toISOString(),
    },
    { onConflict: 'user_id,request_hash' },
  );

  return error?.message ?? null;
}

export async function recordUsageEvent(
  db: SupabaseClient,
  input: RecordUsageInput,
): Promise<string | null> {
  const { error } = await db.from('ai_usage_events').insert({
    user_id: input.userId,
    endpoint: input.endpoint,
    request_hash: input.requestHash,
    input_chars: input.inputChars,
    estimated_input_tokens: input.estimatedInputTokens,
    input_tokens: input.inputTokens,
    output_tokens: input.outputTokens,
    cache_hit: input.cacheHit,
    success: input.success,
    error_code: input.errorCode,
  });

  return error?.message ?? null;
}

export function isJobAnalysisResult(value: unknown): value is JobAnalysisResult {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as {
    skillGaps?: unknown;
    interviewQuestions?: unknown;
  };

  return (
    Array.isArray(candidate.skillGaps) &&
    candidate.skillGaps.every(isSkillGap) &&
    Array.isArray(candidate.interviewQuestions) &&
    candidate.interviewQuestions.every(isInterviewQuestion)
  );
}

function isSkillGap(value: unknown): value is JobAnalysisResult['skillGaps'][number] {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as {
    skill?: unknown;
    importance?: unknown;
    howToLearn?: unknown;
  };

  return (
    typeof candidate.skill === 'string' &&
    ['high', 'medium', 'low'].includes(String(candidate.importance)) &&
    typeof candidate.howToLearn === 'string'
  );
}

function isInterviewQuestion(
  value: unknown,
): value is JobAnalysisResult['interviewQuestions'][number] {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as {
    question?: unknown;
    category?: unknown;
  };

  return (
    typeof candidate.question === 'string' &&
    ['technical', 'behavioral', 'role-specific'].includes(String(candidate.category))
  );
}
