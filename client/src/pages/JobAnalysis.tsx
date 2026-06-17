import { useState } from 'react';
import { ApiError, api } from '../lib/api';
import type { JobAnalysis as Analysis } from '../types';

const IMPORTANCE_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Job Analysis</h1>
      <p className="text-sm text-gray-500">
        Paste a job description to get an AI skill-gap analysis and mock interview questions.
      </p>
      <p className="text-xs text-gray-500">
        AI analysis has a small quota to protect demo credits. Repeated identical descriptions may use a cached result.
      </p>

      <textarea
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        placeholder="Paste the job description here..."
        rows={8}
        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <p className={`text-xs ${overLimit ? 'text-red-600' : 'text-gray-500'}`}>
        {charsUsed.toLocaleString()} / {MAX_JOB_DESCRIPTION_CHARS.toLocaleString()} characters
      </p>
      <button
        onClick={() => void analyze()}
        disabled={busy || jobDescription.trim().length === 0 || overLimit}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {busy ? 'Analyzing...' : 'Analyze'}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {result && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="rounded-xl bg-white p-4 shadow">
            <h2 className="mb-3 font-semibold text-gray-900">Skill gaps</h2>
            <ul className="space-y-3">
              {result.skillGaps.map((g, i) => (
                <li key={i}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{g.skill}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${IMPORTANCE_COLORS[g.importance]}`}
                    >
                      {g.importance}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{g.howToLearn}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl bg-white p-4 shadow">
            <h2 className="mb-3 font-semibold text-gray-900">
              Mock interview questions
            </h2>
            <ul className="space-y-3">
              {result.interviewQuestions.map((q, i) => (
                <li key={i}>
                  <p className="text-sm text-gray-800">{q.question}</p>
                  <span className="text-xs text-indigo-600">{q.category}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
