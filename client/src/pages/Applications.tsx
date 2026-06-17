import { useApplications } from '../hooks/useApplications';
import { ApplicationForm } from '../components/ApplicationForm';
import { ApplicationCard } from '../components/ApplicationCard';

export function Applications() {
  const { applications, loading, error, create, update, remove } = useApplications();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Applications</h1>

      <ApplicationForm onSubmit={create} />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : applications.length === 0 ? (
        <p className="text-sm text-gray-500">No applications yet. Add your first above.</p>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onStatusChange={(id, status) => void update(id, { status })}
              onDelete={(id) => void remove(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
