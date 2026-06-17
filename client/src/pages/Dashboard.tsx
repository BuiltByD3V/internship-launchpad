import { useApplications } from '../hooks/useApplications';
import type { ApplicationStatus } from '../types';

const STAT_LABELS: { status: ApplicationStatus; label: string }[] = [
  { status: 'applied', label: 'Applied' },
  { status: 'interviewing', label: 'Interviewing' },
  { status: 'offer', label: 'Offers' },
  { status: 'accepted', label: 'Accepted' },
];

export function Dashboard() {
  const { applications, loading } = useApplications();

  const countByStatus = (status: ApplicationStatus) =>
    applications.filter((a) => a.status === status).length;

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = applications
    .filter((a) => a.deadline && a.deadline >= today)
    .sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
            {STAT_LABELS.map(({ status, label }) => (
              <div key={status} className="bg-white rounded-xl shadow p-4">
                <p className="text-2xl font-bold text-gray-900">{countByStatus(status)}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold text-gray-900 mb-2">Upcoming deadlines</h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming deadlines.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {upcoming.map((a) => (
                  <li key={a.id} className="py-2 flex justify-between text-sm">
                    <span className="text-gray-700">
                      {a.company} — {a.role}
                    </span>
                    <span className="text-gray-400">{a.deadline}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
