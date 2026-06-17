import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { INPUT, BTN_PRIMARY } from '../components/ui';

export function Login() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signin') await signIn(email, password);
      else await signUp(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const label = 'font-mono text-xs uppercase tracking-widest text-zinc-500';

  return (
    <div className="relative grid min-h-[100dvh] bg-surface lg:grid-cols-2">
      <div className="grid-wash pointer-events-none absolute inset-0" />

      {/* Brand half - faux terminal session. */}
      <div className="relative hidden overflow-hidden border-r border-edge lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(60% 50% at 20% 15%, rgba(163,230,53,0.10), transparent 70%)',
          }}
        />
        <div className="relative flex items-center gap-2 font-mono text-sm text-zinc-400">
          <span
            className="h-2 w-2 rounded-full bg-accent"
            style={{ animation: 'pulse-ring 2.4s infinite' }}
          />
          internship-launchpad
        </div>

        <div className="relative">
          <pre className="font-mono text-sm leading-7 text-zinc-500">
            <span className="text-zinc-600">$</span>{' '}
            <span className="text-zinc-300">launchpad</span> --init{'\n'}
            <span className="text-accent">{'>'}</span> track every application{'\n'}
            <span className="text-accent">{'>'}</span> turn a job description into{'\n'}
            {'  '}skill-gaps + a mock interview set{'\n'}
            <span className="text-accent">{'>'}</span> prep against{' '}
            <span className="text-zinc-300">your</span> profile, not a guess
          </pre>
          <h1 className="mt-8 max-w-[18ch] text-4xl font-bold leading-[1.05] tracking-tighter text-white">
            Run your internship hunt like a build.
          </h1>
        </div>

        <div className="relative font-mono text-xs text-zinc-600">v1 - built solo</div>
      </div>

      {/* Form half */}
      <div className="relative flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="font-mono text-xl tracking-tight text-zinc-100">
            <span className="text-accent">~</span>
            <span className="text-zinc-600">/</span>
            {mode === 'signin' ? 'login' : 'register'}
          </div>
          <p className="mt-1 mb-8 font-mono text-xs text-zinc-600">
            {mode === 'signin'
              ? '// authenticate to continue'
              : '// create an account in under a minute'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className={label}>
                email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className={label}>
                password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                placeholder="at least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={INPUT}
              />
            </div>

            {error && (
              <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 font-mono text-xs text-red-400">
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className={`${BTN_PRIMARY} w-full`}>
              {busy ? 'working...' : mode === 'signin' ? '[ sign in ]' : '[ sign up ]'}
            </button>
          </form>

          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
            }}
            className="mt-6 font-mono text-xs text-zinc-500 transition-colors hover:text-zinc-300"
          >
            {mode === 'signin' ? (
              <>
                no account? <span className="text-accent">register</span>
              </>
            ) : (
              <>
                have an account? <span className="text-accent">login</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
