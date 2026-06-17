import { useState } from 'react';
import type { FormEvent } from 'react';
import type { ApplicationStatus } from '../types';
import type { ApplicationInput } from '../hooks/useApplications';

const STATUSES: ApplicationStatus[] = [
  'applied',
  'interviewing',
  'offer',
  'rejected',
  'accepted',
];

export function ApplicationForm({
  onSubmit,
}: {
  onSubmit: (input: ApplicationInput) => Promise<void>;
}) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('applied');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        company,
        role,
        status,
        deadline: deadline || null,
        notes: notes || null,
      });
      setCompany('');
      setRole('');
      setStatus('applied');
      setDeadline('');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setBusy(false);
    }
  };

  const field = 'rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          required
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className={field}
        />
        <input
          required
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={field}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
          className={field}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className={field}
        />
      </div>
      <textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className={`${field} w-full`}
        rows={2}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {busy ? 'Adding…' : 'Add application'}
      </button>
    </form>
  );
}
