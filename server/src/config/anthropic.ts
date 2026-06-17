import { Anthropic } from '@anthropic-ai/sdk';
import { env } from './env.js';

// Anthropic client for the AI features (Step 7).
export const anthropic = new Anthropic({ apiKey: env.anthropicApiKey });

// Model used for job-description analysis. Haiku 4.5 is the most cost-efficient
// model ($1/$5 per MTok) and is strong enough for this task. Bump to
// 'claude-sonnet-4-6' if output quality needs to improve.
export const AI_MODEL = 'claude-haiku-4-5';
