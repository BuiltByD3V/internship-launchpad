import { useApplications } from '../hooks/useApplications';
import { ApplicationForm } from '../components/ApplicationForm';
import { ApplicationCard } from '../components/ApplicationCard';
import { PANEL, Skeleton, Kicker, SectionLabel } from '../components/ui';

export function Applications() {
  const { applications, loading, error, create, update, remove } = useApplications();

  return (
    <div className="space-y-10">
      <header>
        <Kicker path="applications" />
        <p className="mt-2 font-mono text-xs text-zinc-600">
          // log every role and move it through the pipeline
        </p>
      </header>

      <ApplicationForm onSubmit={create} />

      {error && (
        <p className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 font-mono text-xs text-red-400">
          {error}
        </p>
      )}

      <section className="space-y-3">
        <SectionLabel>
          tracked{' '}
          <span className="text-zinc-600">({applications.length})</span>
        </SectionLabel>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : applications.length === 0 ? (
          <div className={`${PANEL} px-6 py-14`}>
            <p className="font-mono text-sm text-zinc-400">
              <span className="text-zinc-700">$</span> no applications yet
            </p>
            <p className="mt-1 font-mono text-xs text-zinc-600">
              add your first one with the form above
            </p>
          </div>
        ) : (
          <div className={`${PANEL} divide-y divide-edge`}>
            {applications.map((app, i) => (
              <div
                key={app.id}
                style={{ animation: 'rise 0.4s ease-out both', animationDelay: `${i * 45}ms` }}
              >
                <ApplicationCard
                  application={app}
                  onStatusChange={(id, status) => void update(id, { status })}
                  onDelete={(id) => void remove(id)}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
