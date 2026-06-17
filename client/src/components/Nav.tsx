import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-2.5 py-1 font-mono text-sm rounded transition-colors ${
    isActive ? 'text-accent bg-accent/10' : 'text-zinc-500 hover:text-zinc-200'
  }`;

const LINKS: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'dashboard', end: true },
  { to: '/applications', label: 'applications' },
  { to: '/analyze', label: 'analyze' },
  { to: '/profile', label: 'profile' },
];

export function Nav() {
  const { user, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-40 border-b border-edge bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 font-mono text-sm text-zinc-300">
            <span
              className="h-2 w-2 rounded-full bg-accent"
              style={{ animation: 'pulse-ring 2.4s infinite' }}
            />
            launchpad
          </span>
          <span className="hidden text-zinc-700 sm:inline">-</span>
          <div className="hidden items-center gap-0.5 sm:flex">
            {LINKS.map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end} className={linkClass}>
                {label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden font-mono text-xs text-zinc-600 md:inline">
            {user?.email}
          </span>
          <button
            onClick={() => void signOut()}
            className="font-mono text-xs text-zinc-500 transition-colors hover:text-accent"
          >
            exit
          </button>
        </div>
      </div>
      {/* Mobile link row */}
      <div className="flex items-center gap-0.5 overflow-x-auto border-t border-edge px-4 py-2 sm:hidden">
        {LINKS.map(({ to, label, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass}>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
