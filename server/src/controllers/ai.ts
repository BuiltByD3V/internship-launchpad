import type { Request, Response } from 'express';
import { anthropic, AI_MODEL } from '../config/anthropic.js';

// JSON schema the model must fill. Structured outputs guarantee the response
// parses, so we don't have to defensively scrape free-form text.
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

// POST /api/ai/analyze — body: { jobDescription }
// One model call returns both the skill-gap analysis and mock interview
// questions for the pasted job description.
export async function analyzeJob(req: Request, res: Response): Promise<void> {
  const { jobDescription } = req.body ?? {};
  if (typeof jobDescription !== 'string' || jobDescription.trim().length === 0) {
    res.status(400).json({ error: 'jobDescription (string) is required' });
    return;
  }

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 2000,
    system:
      'You are a career coach helping a student prepare for an internship. ' +
      'Given a job description, identify the key skill gaps a typical student ' +
      'would have and generate realistic mock interview questions for the role. ' +
      'Base everything strictly on the job description provided.',
    messages: [
      {
        role: 'user',
        content: `Analyze this internship job description:\n\n${jobDescription}`,
      },
    ],
    output_config: {
      format: { type: 'json_schema', schema: ANALYSIS_SCHEMA },
    },
  });

  // With output_config.format, the first text block is guaranteed valid JSON.
  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    res.status(502).json({ error: 'AI returned no analysis' });
    return;
  }

  res.json(JSON.parse(textBlock.text));
}
