import type { Request, Response } from 'express';
import type {
  ContentBlock,
  Message as AnthropicMessage,
  TextBlock,
} from '@anthropic-ai/sdk/resources/messages';
import { anthropic, AI_MODEL } from '../config/anthropic.js';
import { env } from '../config/env.js';
import { createUserClient } from '../config/supabase.js';
import {
  estimateTokenCount,
  evaluateUsageLimit,
  validateJobDescription,
} from '../utils/aiCostControls.js';
import {
  getCachedAnalysis,
  getRecentUsageEvents,
  isJobAnalysisResult,
  recordUsageEvent,
  saveCachedAnalysis,
} from '../services/aiUsage.js';
import {
  buildProfilePromptContext,
  hashPersonalizedAnalysisRequest,
} from '../utils/profilePersonalization.js';
import { describeAnthropicApiKey } from '../utils/secretDiagnostics.js';
import type { Profile } from '../types/index.js';

const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    skillGaps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          skill: { type: 'string' },
          importance: { type: 'string', enum: ['high', 'medium', 'low'] },
          howToLearn: { type: 'string' },
        },
        required: ['skill', 'importance', 'howToLearn'],
        additionalProperties: false,
      },
    },
    interviewQuestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          category: {
            type: 'string',
            enum: ['technical', 'behavioral', 'role-specific'],
          },
        },
        required: ['question', 'category'],
        additionalProperties: false,
      },
    },
  },
  required: ['skillGaps', 'interviewQuestions'],
  additionalProperties: false,
} as const;

function isTextBlock(block: ContentBlock): block is TextBlock {
  return block.type === 'text';
}

function getProviderStatus(error: unknown): number | null {
  if (!error || typeof error !== 'object') return null;

  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' ? status : null;
}

function getProviderRequestId(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;

  const requestID = (error as { requestID?: unknown }).requestID;
  return typeof requestID === 'string' ? requestID : null;
}

async function getProfileForAnalysis(
  db: ReturnType<typeof createUserClient>,
  userId: string,
): Promise<{ profile: Profile | null; error: string | null }> {
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return { profile: null, error: error.message };
  }

  return { profile: (data as Profile | null) ?? null, error: null };
}

export async function analyzeJob(req: Request, res: Response): Promise<void> {
  const { jobDescription } = req.body ?? {};
  const validation = validateJobDescription(
    jobDescription,
    env.ai.maxJobDescriptionChars,
  );

  if (!validation.ok) {
    res.status(validation.status).json({ error: validation.error });
    return;
  }

  if (!env.ai.enabled) {
    res.status(503).json({ error: 'AI analysis is temporarily disabled.' });
    return;
  }

  const userId = req.user?.id;
  const token = req.accessToken;
  if (!userId || !token) {
    res.status(401).json({ error: 'Unauthenticated' });
    return;
  }

  const email = req.user?.email?.toLowerCase() ?? '';
  if (
    env.ai.allowedEmails.length > 0 &&
    !env.ai.allowedEmails.includes(email)
  ) {
    res.status(403).json({ error: 'AI analysis is restricted for this demo.' });
    return;
  }

  const input = validation.value;
  const db = createUserClient(token);
  const now = new Date();
  const endpoint = '/api/ai/analyze';
  const { profile, error: profileError } = await getProfileForAnalysis(
    db,
    userId,
  );

  if (profileError) {
    res.status(503).json({
      error: 'Unable to load your profile for AI analysis. Try again later.',
    });
    return;
  }

  const profileContext = buildProfilePromptContext(profile);
  const requestHash = hashPersonalizedAnalysisRequest(input, profile);
  const inputChars = input.length + profileContext.length;
  const estimatedInputTokens = estimateTokenCount(
    `Analyze this internship job description:\n\n${input}${profileContext}`,
  );

  const cached = await getCachedAnalysis(db, userId, requestHash, now);
  if (cached.result) {
    await recordUsageEvent(db, {
      userId,
      endpoint,
      requestHash,
      inputChars,
      estimatedInputTokens,
      inputTokens: null,
      outputTokens: null,
      cacheHit: true,
      success: true,
      errorCode: null,
    });
    res.json(cached.result);
    return;
  }

  if (cached.error) {
    console.warn(`AI cache read failed: ${cached.error}`);
  }

  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const usage = await getRecentUsageEvents(db, userId, since);
  if (usage.error) {
    res.status(503).json({
      error: 'Unable to verify AI usage limits right now. Try again later.',
    });
    return;
  }

  const limit = evaluateUsageLimit({
    events: usage.events,
    now,
    config: env.ai,
  });

  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfterSeconds));
    res.status(limit.status).json({
      error: limit.error,
      code: limit.code,
      retryAfterSeconds: limit.retryAfterSeconds,
    });
    return;
  }

  let response: AnthropicMessage;
  try {
    response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: env.ai.maxOutputTokens,
      system:
        'You are a career coach helping a student prepare for an internship. ' +
        'Given a job description and, when available, a compact student profile, ' +
        'identify gaps between this student and the role and generate realistic ' +
        'mock interview questions. Skip skills the student already lists. Tune ' +
        'question difficulty to their experience level. Return at most 5 skill ' +
        'gaps and 6 interview questions. Base everything strictly on the job ' +
        'description and profile provided. If the text is not a real job ' +
        'description, return empty arrays for both fields rather than guessing.',
      messages: [
        {
          role: 'user',
          content: `Analyze this internship job description:\n\n${input}${profileContext}`,
        },
      ],
      output_config: {
        format: { type: 'json_schema', schema: ANALYSIS_SCHEMA },
      },
    });
  } catch (error) {
    const providerStatus = getProviderStatus(error);
    const providerRequestId = getProviderRequestId(error);
    const providerAuthFailed = providerStatus === 401;
    const errorCode = providerAuthFailed
      ? 'anthropic_auth_error'
      : 'anthropic_error';

    await recordUsageEvent(db, {
      userId,
      endpoint,
      requestHash,
      inputChars,
      estimatedInputTokens,
      inputTokens: null,
      outputTokens: null,
      cacheHit: false,
      success: false,
      errorCode,
    });

    console.error('AI provider request failed', {
      errorCode,
      providerStatus,
      providerRequestId,
      anthropicApiKey: describeAnthropicApiKey(env.anthropicApiKey),
      message: error instanceof Error ? error.message : String(error),
    });

    res.status(502).json({
      error: providerAuthFailed
        ? 'AI provider authentication failed. Check the server ANTHROPIC_API_KEY environment variable.'
        : 'AI analysis failed. Try again later.',
    });
    return;
  }

  const textBlock = response.content.find(isTextBlock);
  if (!textBlock) {
    await recordUsageEvent(db, {
      userId,
      endpoint,
      requestHash,
      inputChars,
      estimatedInputTokens,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cacheHit: false,
      success: false,
      errorCode: 'empty_ai_response',
    });
    res.status(502).json({ error: 'AI returned no analysis' });
    return;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(textBlock.text) as unknown;
  } catch {
    await recordUsageEvent(db, {
      userId,
      endpoint,
      requestHash,
      inputChars,
      estimatedInputTokens,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cacheHit: false,
      success: false,
      errorCode: 'invalid_ai_json',
    });
    res.status(502).json({ error: 'AI returned malformed analysis JSON' });
    return;
  }

  if (!isJobAnalysisResult(parsed)) {
    await recordUsageEvent(db, {
      userId,
      endpoint,
      requestHash,
      inputChars,
      estimatedInputTokens,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cacheHit: false,
      success: false,
      errorCode: 'invalid_ai_response',
    });
    res.status(502).json({ error: 'AI returned an invalid analysis' });
    return;
  }

  const cacheError = await saveCachedAnalysis({
    db,
    userId,
    requestHash,
    result: parsed,
    inputChars,
    expiresAt: new Date(now.getTime() + env.ai.cacheTtlHours * 60 * 60 * 1000),
  });
  if (cacheError) {
    console.warn(`AI cache write failed: ${cacheError}`);
  }

  const usageError = await recordUsageEvent(db, {
    userId,
    endpoint,
    requestHash,
    inputChars,
    estimatedInputTokens,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    cacheHit: false,
    success: true,
    errorCode: null,
  });
  if (usageError) {
    console.warn(`AI usage write failed: ${usageError}`);
  }

  res.json(parsed);
}
