import type { Application, ApplicationStatus } from '../types';

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied: 'bg-gray-100 text-gray-700',
  interviewing: 'bg-blue-100 text-blue-700',
  offer: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  accepted: 'bg-emerald-100 text-emerald-700',
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
    <div className="bg-white rounded-xl shadow p-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 truncate">{application.company}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[application.status]}`}>
            {application.status}
          </span>
        </div>
        <p className="text-sm text-gray-600">{application.role}</p>
        {application.deadline && (
          <p className="text-xs text-gray-400 mt-1">Deadline: {application.deadline}</p>
        )}
        {application.notes && (
          <p className="text-sm text-gray-500 mt-2 whitespace-pre-wrap">{application.notes}</p>
        )}
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <select
          value={application.status}
          onChange={(e) => onStatusChange(application.id, e.target.value as ApplicationStatus)}
          className="text-xs rounded-lg border border-gray-300 px-2 py-1"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={() => onDelete(application.id)}
          className="text-xs text-red-500 hover:text-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
