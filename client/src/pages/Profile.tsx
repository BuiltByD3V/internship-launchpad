import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useProfile } from '../hooks/useProfile';
import { TagInput } from '../components/TagInput';
import { PANEL, INPUT, BTN_PRIMARY, Skeleton, Kicker, SectionLabel } from '../components/ui';
import type { ExperienceLevel, ProfileInput } from '../types';

const EMPTY: ProfileInput = {
  school: null,
  major: null,
  grad_year: null,
  skills: [],
  target_role: null,
  experience_level: null,
  experience_summary: null,
  interests: [],
  github_url: null,
  portfolio_url: null,
  location: null,
  work_auth: null,
  preferred_industries: [],
};

const EXPERIENCE: { value: ExperienceLevel; label: string }[] = [
  { value: 'none', label: 'No experience yet' },
  { value: 'some', label: 'Some experience' },
  { value: 'experienced', label: 'Experienced' },
];

const label = 'font-mono text-xs uppercase tracking-widest text-zinc-500';

export function Profile({ onSaved }: { onSaved?: () => void }) {
  const { profile, loading, save } = useProfile();
  const [form, setForm] = useState<ProfileInput>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Hydrate the form when the profile loads.
  useEffect(() => {
    if (!profile) return;
    setForm({
      school: profile.school,
      major: profile.major,
      grad_year: profile.grad_year,
      skills: profile.skills,
      target_role: profile.target_role,
      experience_level: profile.experience_level,
      experience_summary: profile.experience_summary,
      interests: profile.interests,
      github_url: profile.github_url,
      portfolio_url: profile.portfolio_url,
      location: profile.location,
      work_auth: profile.work_auth,
      preferred_industries: profile.preferred_industries,
    });
  }, [profile]);

  const set = <K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const text = (v: string) => (v.trim().length > 0 ? v : null);

  const valid =
    form.skills.length > 0 && !!form.target_role && !!form.experience_level;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const result = await save(form);
      setSaved(true);
      if (result.onboarded) onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Skeleton className="h-96 w-full" />;

  const req = <span className="text-accent">*</span>;

  return (
    <div className="space-y-10">
      <header>
        <Kicker path="profile" />
        <p className="mt-2 max-w-[70ch] font-mono text-xs leading-relaxed text-zinc-600">
          // the analyzer reads this to tailor skill gaps + questions to you. fields marked{' '}
          <span className="text-accent">*</span> are required; the rest sharpen its output.
        </p>
      </header>

      <form onSubmit={handleSubmit} className={`${PANEL} space-y-8 p-6`}>
        {/* Required */}
        <div className="space-y-4">
          <SectionLabel>required</SectionLabel>

          <div className="flex flex-col gap-2">
            <label className={label} htmlFor="target_role">target role {req}</label>
            <input
              id="target_role"
              placeholder="Backend Engineering Intern"
              value={form.target_role ?? ''}
              onChange={(e) => set('target_role', text(e.target.value))}
              className={INPUT}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className={label} htmlFor="experience_level">experience level {req}</label>
            <select
              id="experience_level"
              value={form.experience_level ?? ''}
              onChange={(e) =>
                set('experience_level', (e.target.value || null) as ExperienceLevel | null)
              }
              className={INPUT}
            >
              <option value="" className="bg-panel">Select...</option>
              {EXPERIENCE.map((o) => (
                <option key={o.value} value={o.value} className="bg-panel">
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className={label} htmlFor="skills">skills {req}</label>
            <TagInput
              id="skills"
              value={form.skills}
              onChange={(next) => set('skills', next)}
              placeholder="Python, React, SQL..."
            />
          </div>
        </div>

        {/* Optional */}
        <div className="space-y-4 border-t border-edge pt-8">
          <SectionLabel>optional - improves AI output</SectionLabel>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className={label} htmlFor="school">school</label>
              <input id="school" value={form.school ?? ''}
                onChange={(e) => set('school', text(e.target.value))} className={INPUT} />
            </div>
            <div className="flex flex-col gap-2">
              <label className={label} htmlFor="major">major</label>
              <input id="major" value={form.major ?? ''}
                onChange={(e) => set('major', text(e.target.value))} className={INPUT} />
            </div>
            <div className="flex flex-col gap-2">
              <label className={label} htmlFor="grad_year">graduation year</label>
              <input id="grad_year" type="number" inputMode="numeric"
                value={form.grad_year ?? ''}
                onChange={(e) =>
                  set('grad_year', e.target.value ? Number(e.target.value) : null)}
                className={INPUT} />
            </div>
            <div className="flex flex-col gap-2">
              <label className={label} htmlFor="location">location</label>
              <input id="location" value={form.location ?? ''}
                onChange={(e) => set('location', text(e.target.value))} className={INPUT} />
            </div>
            <div className="flex flex-col gap-2">
              <label className={label} htmlFor="work_auth">work authorization</label>
              <input id="work_auth" placeholder="e.g. US citizen, F-1 OPT"
                value={form.work_auth ?? ''}
                onChange={(e) => set('work_auth', text(e.target.value))} className={INPUT} />
            </div>
            <div className="flex flex-col gap-2">
              <label className={label} htmlFor="github_url">github</label>
              <input id="github_url" value={form.github_url ?? ''}
                onChange={(e) => set('github_url', text(e.target.value))} className={INPUT} />
            </div>
            <div className="flex flex-col gap-2">
              <label className={label} htmlFor="portfolio_url">portfolio</label>
              <input id="portfolio_url" value={form.portfolio_url ?? ''}
                onChange={(e) => set('portfolio_url', text(e.target.value))} className={INPUT} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className={label} htmlFor="experience_summary">experience summary</label>
            <textarea id="experience_summary" rows={3}
              placeholder="Past projects, internships, coursework..."
              value={form.experience_summary ?? ''}
              onChange={(e) => set('experience_summary', text(e.target.value))} className={INPUT} />
          </div>

          <div className="flex flex-col gap-2">
            <label className={label}>interests</label>
            <TagInput value={form.interests} onChange={(next) => set('interests', next)}
              placeholder="Distributed systems, fintech..." />
          </div>

          <div className="flex flex-col gap-2">
            <label className={label}>preferred industries</label>
            <TagInput value={form.preferred_industries}
              onChange={(next) => set('preferred_industries', next)}
              placeholder="Healthcare, gaming..." />
          </div>
        </div>

        {error && <p className="font-mono text-xs text-red-400">{error}</p>}
        {saved && <p className="font-mono text-xs text-accent">saved ok</p>}

        <button type="submit" disabled={busy || !valid} className={BTN_PRIMARY}>
          {busy ? 'saving...' : '[ save profile ]'}
        </button>
      </form>
    </div>
  );
}
