import { useApplications } from '../hooks/useApplications';
import type { ApplicationStatus } from '../types';
import { PANEL, Skeleton, Kicker, SectionLabel, Leader } from '../components/ui';

const STATS: { status: ApplicationStatus; label: string }[] = [
  { status: 'applied', label: 'applied' },
  { status: 'interviewing', label: 'interview' },
  { status: 'offer', label: 'offers' },
  { status: 'accepted', label: 'accepted' },
];

export function Dashboard() {
  const { applications, loading, error } = useApplications();

  const count = (status: ApplicationStatus) =>
    applications.filter((a) => a.status === status).length;

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = applications
    .filter((a) => a.deadline && a.deadline >= today)
    .sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1))
    .slice(0, 5);

  const daysLeft = (deadline: string) => {
    const ms = new Date(deadline).getTime() - new Date(today).getTime();
    return Math.max(0, Math.round(ms / 86_400_000));
  };

  return (
    <div className="space-y-10">
      <header>
        <Kicker path="dashboard" />
        <p className="mt-2 font-mono text-xs text-zinc-600">
          // your internship pipeline at a glance
        </p>
      </header>

      {error && (
        <p className="rounded-md border border-red-500/20 bg-red-500/10 px-4 py-3 font-mono text-xs text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <div className={`${PANEL} grid grid-cols-2 divide-y divide-edge sm:grid-cols-5 sm:divide-x sm:divide-y-0`}>
          <Stat value={applications.length} label="total" accent />
          {STATS.map(({ status, label }) => (
            <Stat key={status} value={count(status)} label={label} />
          ))}
        </div>
      )}

      <section className="space-y-3">
        <SectionLabel>upcoming deadlines</SectionLabel>
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : upcoming.length === 0 ? (
          <div className={`${PANEL} px-6 py-10`}>
            <p className="font-mono text-sm text-zinc-400">
              <span className="text-zinc-700">$</span> no upcoming deadlines
            </p>
            <p className="mt-1 font-mono text-xs text-zinc-600">
              add a deadline when you log an application
            </p>
          </div>
        ) : (
          <div className={`${PANEL} divide-y divide-edge`}>
            {upcoming.map((a, i) => (
              <div
                key={a.id}
                className="group flex items-center px-5 py-3.5"
                style={{ animation: `rise 0.4s ease-out both`, animationDelay: `${i * 60}ms` }}
              >
                <span className="mr-3 font-mono text-accent/70 transition-colors group-hover:text-accent">
                  {'>'}
                </span>
                <div className="min-w-0 shrink-0">
                  <p className="truncate text-sm font-medium text-zinc-100">{a.company}</p>
                  <p className="truncate font-mono text-xs text-zinc-600">{a.role}</p>
                </div>
                <Leader />
                <div className="shrink-0 text-right">
                  <p className="font-mono text-xs text-zinc-300">{a.deadline}</p>
                  <p className="font-mono text-[11px] text-accent">{daysLeft(a.deadline!)}d left</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className="px-5 py-4">
      <p className={`font-mono text-3xl font-semibold tabular-nums ${accent ? 'text-accent' : 'text-white'}`}>
        {value.toString().padStart(2, '0')}
      </p>
      <p className="mt-1 font-mono text-xs uppercase tracking-wider text-zinc-600">{label}</p>
    </div>
  );
}
