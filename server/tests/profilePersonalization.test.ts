import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  buildProfilePromptContext,
  profileCacheFingerprint,
} from '../src/utils/profilePersonalization.js';
import type { Profile } from '../src/types/index.js';

const baseProfile: Profile = {
  user_id: 'user-1',
  school: 'State University',
  major: 'Computer Science',
  grad_year: 2027,
  skills: ['React', 'Node.js', 'SQL'],
  target_role: 'Frontend Engineering Intern',
  experience_level: 'some',
  experience_summary: 'Built two class projects and a small portfolio site.',
  interests: ['developer tools', 'education'],
  github_url: 'https://github.com/example',
  portfolio_url: 'https://example.dev',
  location: 'Atlanta, GA',
  work_auth: 'US citizen',
  preferred_industries: ['SaaS', 'edtech'],
  onboarded: true,
  created_at: '2026-06-17T00:00:00.000Z',
  updated_at: '2026-06-17T00:00:00.000Z',
};

describe('profile personalization', () => {
  test('builds compact profile context for AI analysis', () => {
    const context = buildProfilePromptContext(baseProfile);

    assert.match(context, /Student profile:/);
    assert.match(context, /Target role: Frontend Engineering Intern/);
    assert.match(context, /Known skills: React, Node\.js, SQL/);
    assert.match(context, /Preferred industries: SaaS, edtech/);
    assert.doesNotMatch(context, /https:\/\/github\.com\/example/);
    assert.doesNotMatch(context, /https:\/\/example\.dev/);
  });

  test('returns no context for empty or missing profiles', () => {
    assert.equal(buildProfilePromptContext(null), '');
    assert.equal(
      buildProfilePromptContext({
        ...baseProfile,
        school: null,
        major: null,
        grad_year: null,
        skills: [],
        target_role: null,
        experience_level: null,
        experience_summary: null,
        interests: [],
        preferred_industries: [],
      }),
      '',
    );
  });

  test('fingerprint changes when personalization inputs change', () => {
    const changedProfile: Profile = {
      ...baseProfile,
      target_role: 'Backend Engineering Intern',
    };

    assert.notEqual(
      profileCacheFingerprint(baseProfile),
      profileCacheFingerprint(changedProfile),
    );
  });
});
