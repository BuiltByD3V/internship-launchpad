import type { Application, ApplicationStatus } from '../types';

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  applied: 'text-zinc-400 ring-zinc-700',
  interviewing: 'text-accent ring-accent/40',
  offer: 'text-emerald-400 ring-emerald-500/30',
  rejected: 'text-red-400 ring-red-500/30',
  accepted: 'text-emerald-300 ring-emerald-400/40',
};

const STATUSES: ApplicationStatus[] = [
  'applied',
  'interviewing',
  'offer',
  'rejected',
  'accepted',
];

export function ApplicationCard({
  application,
  onStatusChange,
  onDelete,
}: {
  application: Application;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="group flex items-start gap-3 px-5 py-4 transition-colors hover:bg-white/[0.015]">
      <span className="mt-0.5 font-mono text-accent/60 transition-colors group-hover:text-accent">
        {'>'}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="truncate font-medium text-zinc-100">{application.company}</h3>
          <span
            className={`rounded px-1.5 py-0.5 font-mono text-[11px] lowercase ring-1 ${STATUS_STYLES[application.status]}`}
          >
            {application.status}
          </span>
        </div>
        <p className="mt-0.5 font-mono text-xs text-zinc-500">{application.role}</p>
        {application.deadline && (
          <p className="mt-2 font-mono text-xs text-zinc-600">
            <span className="text-zinc-700">due</span> {application.deadline}
          </p>
        )}
        {application.notes && (
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-500">
            {application.notes}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <select
          value={application.status}
          onChange={(e) => onStatusChange(application.id, e.target.value as ApplicationStatus)}
          className="rounded-md border border-edge bg-black/40 px-2 py-1 font-mono text-xs text-zinc-300 transition-colors focus:border-accent focus:outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s} className="bg-panel">{s}</option>
          ))}
        </select>
        <button
          onClick={() => onDelete(application.id)}
          className="font-mono text-xs text-zinc-600 transition-colors hover:text-red-400"
        >
          rm
        </button>
      </div>
    </div>
  );
}
