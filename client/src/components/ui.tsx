// Shared visual primitives - "Terminal / Engineer" system.
// Flat hairline frames (no elevation), mono-led chrome, single lime accent.

import type { ReactNode } from 'react';

// Frame: flat near-black surface with a 1px hairline. No diffusion shadow -
// depth comes from lines and negative space, not elevation.
export const PANEL = 'rounded-md border border-edge bg-panel';

// Inputs: monospace, sunken (darker than the frame), lime focus ring-line.
export const INPUT =
  'w-full rounded-md border border-edge bg-black/40 px-3 py-2 font-mono text-sm text-zinc-100 placeholder-zinc-600 transition-colors focus:border-accent focus:outline-none';

// Primary action: bracketed mono pill, lime on a faint lime wash.
export const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-sm font-medium text-accent transition-[background-color,border-color,transform] duration-150 hover:border-accent/70 hover:bg-accent/20 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40';

// Quiet secondary action.
export const BTN_GHOST =
  'inline-flex items-center justify-center gap-1.5 rounded-md border border-edge px-3 py-1.5 font-mono text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200';

// Section label: mono uppercase, prefixed with a dim "//" comment marker.
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-mono text-xs uppercase tracking-widest text-zinc-500">
      <span className="text-zinc-700">// </span>
      {children}
    </h2>
  );
}

// Page title in terminal-path form: ~/segment, lime tilde.
export function Kicker({ path }: { path: string }) {
  return (
    <div className="font-mono text-2xl tracking-tight text-zinc-100">
      <span className="text-accent">~</span>
      <span className="text-zinc-600">/</span>
      {path}
      <span
        className="ml-1 inline-block h-5 w-2 translate-y-0.5 bg-accent/80"
        style={{ animation: 'blink 1.2s step-end infinite' }}
      />
    </div>
  );
}

// Dotted leader: fills the gap between a label (left) and a value (right),
// the classic terminal/table dotted rule.
export function Leader() {
  return <span className="mx-3 flex-1 self-end border-b border-dashed border-edge" />;
}

// Shimmer skeleton matching content footprint (no spinners).
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-md border border-edge bg-white/[0.02] ${className}`}>
      <div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        style={{ animation: 'shimmer 1.6s infinite' }}
      />
    </div>
  );
}
