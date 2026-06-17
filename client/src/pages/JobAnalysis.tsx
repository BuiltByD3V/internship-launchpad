import { useState } from 'react';
import { ApiError, api } from '../lib/api';
import type { JobAnalysis as Analysis } from '../types';
import {
  BTN_PRIMARY,
  INPUT,
  Kicker,
  PANEL,
  SectionLabel,
  Skeleton,
} from '../components/ui';

const IMPORTANCE_STYLES: Record<string, string> = {
  high: 'text-red-400 ring-red-500/30',
  medium: 'text-amber-400 ring-amber-500/30',
  low: 'text-zinc-400 ring-zinc-700',
};

const MAX_JOB_DESCRIPTION_CHARS = Number(
  import.meta.env.VITE_AI_MAX_JOB_DESCRIPTION_CHARS ?? 8_000,
);

function formatRetry(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  return `${Math.ceil(seconds / 60)} minutes`;
}

export function JobAnalysis() {
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<Analysis | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charsUsed = jobDescription.length;
  const overLimit = charsUsed > MAX_JOB_DESCRIPTION_CHARS;

  const analyze = async () => {
    if (overLimit) {
      setError(
        `Job description is too long. Keep it under ${MAX_JOB_DESCRIPTION_CHARS.toLocaleString()} characters.`,
      );
      return;
    }

    setBusy(true);
    setError(null);
    setResult(null);
    try {
      setResult(
        await api<Analysis>('/api/ai/analyze', {
          method: 'POST',
          body: JSON.stringify({ jobDescription }),
        }),
      );
    } catch (e) {
      if (e instanceof ApiError && e.status === 429 && e.retryAfterSeconds) {
        setError(
          `${e.message} Try again in about ${formatRetry(e.retryAfterSeconds)}.`,
        );
      } else {
        setError(e instanceof Error ? e.message : 'Analysis failed');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-10">
      <header>
        <Kicker path="analyze" />
        <p className="mt-2 font-mono text-xs text-zinc-600">
          // paste a description - skill-gap readout + mock interview questions,
          tuned to your profile
        </p>
        <p className="mt-1 font-mono text-xs text-zinc-700">
          // quotas protect demo credits; repeated profile/job combinations can
          use cached results
        </p>
      </header>

      <div className="space-y-3">
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="paste the full job description here..."
          rows={8}
          className={INPUT}
        />
        <p
          className={`font-mono text-xs ${
            overLimit ? 'text-red-400' : 'text-zinc-600'
          }`}
        >
          {charsUsed.toLocaleString()} /{' '}
          {MAX_JOB_DESCRIPTION_CHARS.toLocaleString()} chars
        </p>
        <button
          onClick={() => void analyze()}
          disabled={busy || jobDescription.trim().length === 0 || overLimit}
          className={BTN_PRIMARY}
        >
          {busy ? 'analyzing...' : '[ analyze ]'}
        </button>
      </div>

      {error && (
        <p className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 font-mono text-xs text-red-400">
          {error}
        </p>
      )}

      {busy && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="space-y-3">
            <SectionLabel>skill gaps</SectionLabel>
            <div className={`${PANEL} divide-y divide-edge`}>
              {result.skillGaps.map((gap, index) => (
                <div
                  key={index}
                  className="px-5 py-4"
                  style={{
                    animation: 'rise 0.4s ease-out both',
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-100">
                      {gap.skill}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[11px] lowercase ring-1 ${IMPORTANCE_STYLES[gap.importance]}`}
                    >
                      {gap.importance}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                    {gap.howToLearn}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <SectionLabel>mock interview</SectionLabel>
            <div className={`${PANEL} divide-y divide-edge`}>
              {result.interviewQuestions.map((question, index) => (
                <div
                  key={index}
                  className="flex gap-3 px-5 py-4"
                  style={{
                    animation: 'rise 0.4s ease-out both',
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <span className="font-mono text-accent/60">{'>'}</span>
                  <div>
                    <p className="text-sm leading-relaxed text-zinc-200">
                      {question.question}
                    </p>
                    <span className="mt-1 inline-block font-mono text-[11px] text-zinc-600">
                      {question.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
