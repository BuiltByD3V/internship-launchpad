import { createHash } from 'node:crypto';
import { normalizeJobDescription } from './aiCostControls.js';
import type { ExperienceLevel, Profile } from '../types/index.js';

export const EXPERIENCE_LEVELS = ['none', 'some', 'experienced'] as const;

export interface ProfileInput {
  school: string | null;
  major: string | null;
  grad_year: number | null;
  skills: string[];
  target_role: string | null;
  experience_level: ExperienceLevel | null;
  experience_summary: string | null;
  interests: string[];
  github_url: string | null;
  portfolio_url: string | null;
  location: string | null;
  work_auth: string | null;
  preferred_industries: string[];
  onboarded: boolean;
}

export function normalizeProfileInput(value: unknown): ProfileInput {
  const body = isRecord(value) ? value : {};
  const skills = cleanTags(body.skills);
  const targetRole = cleanText(body.target_role);
  const experienceLevel = cleanExperienceLevel(body.experience_level);

  return {
    school: cleanText(body.school),
    major: cleanText(body.major),
    grad_year: cleanGradYear(body.grad_year),
    skills,
    target_role: targetRole,
    experience_level: experienceLevel,
    experience_summary: cleanText(body.experience_summary),
    interests: cleanTags(body.interests),
    github_url: cleanText(body.github_url),
    portfolio_url: cleanText(body.portfolio_url),
    location: cleanText(body.location),
    work_auth: cleanText(body.work_auth),
    preferred_industries: cleanTags(body.preferred_industries),
    onboarded:
      skills.length > 0 && targetRole !== null && experienceLevel !== null,
  };
}

export function buildProfilePromptContext(profile: Profile | null): string {
  if (!profile) return '';

  const lines = [
    profile.target_role ? `- Target role: ${profile.target_role}` : null,
    profile.experience_level
      ? `- Experience level: ${profile.experience_level}`
      : null,
    profile.skills.length
      ? `- Known skills: ${formatList(profile.skills, 12)}`
      : null,
    profile.interests.length
      ? `- Interests: ${formatList(profile.interests, 8)}`
      : null,
    profile.preferred_industries.length
      ? `- Preferred industries: ${formatList(profile.preferred_industries, 8)}`
      : null,
    profile.school || profile.major || profile.grad_year
      ? `- Education: ${[
          profile.school,
          profile.major,
          profile.grad_year ? `Class of ${profile.grad_year}` : null,
        ]
          .filter(Boolean)
          .join(', ')}`
      : null,
    profile.experience_summary
      ? `- Background: ${truncate(profile.experience_summary, 500)}`
      : null,
  ].filter((line): line is string => line !== null);

  if (lines.length === 0) return '';

  return `\n\nStudent profile:\n${lines.join('\n')}`;
}

export function profileCacheFingerprint(profile: Profile | null): string {
  if (!profile) return 'profile:none';

  const parts = {
    school: normalizeNullable(profile.school),
    major: normalizeNullable(profile.major),
    grad_year: profile.grad_year,
    skills: normalizeList(profile.skills),
    target_role: normalizeNullable(profile.target_role),
    experience_level: profile.experience_level,
    experience_summary: normalizeNullable(profile.experience_summary),
    interests: normalizeList(profile.interests),
    preferred_industries: normalizeList(profile.preferred_industries),
  };

  return createHash('sha256').update(JSON.stringify(parts)).digest('hex');
}

export function hashPersonalizedAnalysisRequest(
  jobDescription: string,
  profile: Profile | null,
): string {
  return createHash('sha256')
    .update(normalizeJobDescription(jobDescription))
    .update('\nprofile:')
    .update(profileCacheFingerprint(profile))
    .digest('hex');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function cleanTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .slice(0, 25);
}

function cleanText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function cleanExperienceLevel(value: unknown): ExperienceLevel | null {
  if (
    typeof value === 'string' &&
    EXPERIENCE_LEVELS.includes(value as ExperienceLevel)
  ) {
    return value as ExperienceLevel;
  }
  return null;
}

function cleanGradYear(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) return null;
  if (value < 2000 || value > 2100) return null;
  return value;
}

function formatList(values: string[], maxItems: number): string {
  return values.slice(0, maxItems).join(', ');
}

function normalizeList(values: string[]): string[] {
  return values
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0)
    .sort();
}

function normalizeNullable(value: string | null): string | null {
  return value ? value.trim().replace(/\s+/g, ' ').toLowerCase() : null;
}

function truncate(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars - 3)}...`;
}
