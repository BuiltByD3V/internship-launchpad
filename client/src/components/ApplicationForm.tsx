import { useState } from 'react';
import type { FormEvent } from 'react';
import type { ApplicationStatus } from '../types';
import type { ApplicationInput } from '../hooks/useApplications';
import { PANEL, INPUT, BTN_PRIMARY } from './ui';

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
      await onSubmit({ company, role, status, deadline: deadline || null, notes: notes || null });
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

  const label = 'font-mono text-xs uppercase tracking-widest text-zinc-500';

  return (
    <form onSubmit={handleSubmit} className={`${PANEL} space-y-4 p-6`}>
      <p className="font-mono text-xs text-zinc-600">
        <span className="text-accent">{'>'}</span> new application
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className={label} htmlFor="company">company</label>
          <input id="company" required placeholder="Stripe" value={company}
            onChange={(e) => setCompany(e.target.value)} className={INPUT} />
        </div>
        <div className="flex flex-col gap-2">
          <label className={label} htmlFor="role">role</label>
          <input id="role" required placeholder="Backend Engineering Intern" value={role}
            onChange={(e) => setRole(e.target.value)} className={INPUT} />
        </div>
        <div className="flex flex-col gap-2">
          <label className={label} htmlFor="status">status</label>
          <select id="status" value={status}
            onChange={(e) => setStatus(e.target.value as ApplicationStatus)} className={INPUT}>
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-panel">{s}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className={label} htmlFor="deadline">deadline</label>
          <input id="deadline" type="date" value={deadline}
            onChange={(e) => setDeadline(e.target.value)} className={`${INPUT} [color-scheme:dark]`} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className={label} htmlFor="notes">notes</label>
        <textarea id="notes" rows={2} placeholder="Referral from a friend, follow up next week..."
          value={notes} onChange={(e) => setNotes(e.target.value)} className={INPUT} />
      </div>

      {error && <p className="font-mono text-xs text-red-400">{error}</p>}

      <button type="submit" disabled={busy} className={BTN_PRIMARY}>
        {busy ? 'adding...' : '[ add application ]'}
      </button>
    </form>
  );
}
