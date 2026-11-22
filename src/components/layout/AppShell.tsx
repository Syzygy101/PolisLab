import { NavLink, Outlet } from 'react-router-dom';
import {
  RESEARCH_CORRECTION_PASS,
  RESEARCH_CUTOFF,
  RESEARCH_RELEASE,
} from '@/research/constants';
import { researchDataset } from '@/data/researchDataset';

const navItems = [
  { to: '/', label: 'Overview', end: true },
  { to: '/claims', label: 'Claims Explorer' },
  { to: '/casebook', label: 'Casebook' },
  { to: '/mechanisms', label: 'Mechanisms' },
  { to: '/comparison', label: 'Comparison' },
  { to: '/gaps', label: 'Evidence Gaps' },
  { to: '/sandbox', label: 'Sandbox', deferred: true },
] as const;

export function AppShell() {
  const { provenance } = researchDataset;

  return (
    <div className="min-h-screen text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper-raised focus:px-3 focus:py-2"
      >
        Skip to content
      </a>

      <header className="border-b border-line bg-paper-raised/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                PolisLab
              </p>
              <p className="mt-1 max-w-2xl text-sm text-ink-muted">
                Interactive evidence-based political-economy research laboratory
              </p>
            </div>
            <div className="text-right text-xs text-ink-subtle">
              <p>
                Research {RESEARCH_RELEASE} · app development v0.2 · Build 07
              </p>
              <p>Evidence cutoff {RESEARCH_CUTOFF}</p>
              <p>Correction pass {RESEARCH_CORRECTION_PASS}</p>
            </div>
          </div>

          <nav aria-label="Primary" className="flex flex-wrap gap-1 border-t border-line pt-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) =>
                  [
                    'rounded px-2.5 py-1.5 text-sm no-underline transition-colors',
                    isActive
                      ? 'bg-accent-soft font-medium text-accent'
                      : 'text-ink-muted hover:bg-neutral-soft hover:text-ink',
                  ].join(' ')
                }
              >
                {item.label}
                {'deferred' in item && item.deferred ? (
                  <span className="ml-1 text-[10px] uppercase tracking-wide text-ink-subtle">
                    later
                  </span>
                ) : null}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 text-xs text-ink-subtle sm:px-6 lg:px-8">
          <p>
            Source: {provenance.sourceFile} · SHA-256{' '}
            <span className="font-mono">{provenance.sourceContentSha256.slice(0, 12)}…</span>
          </p>
          <p>
            Research text licensed CC BY 4.0. Software licensing for this application layer is
            a separate decision and is not set by this build.
          </p>
          <p>
            Not legal advice. Does not produce policy rankings, welfare forecasts, or simulated
            economic effects.
          </p>
        </div>
      </footer>
    </div>
  );
}
