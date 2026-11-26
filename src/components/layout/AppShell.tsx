import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  RESEARCH_CORRECTION_PASS,
  RESEARCH_CUTOFF,
  RESEARCH_RELEASE,
} from '@/research/constants';
import { researchDataset } from '@/data/researchDataset';
import { BrandLockup } from '@/components/brand/Mark';

/**
 * Primary navigation hierarchy (approved Direction C).
 * Canonical routes and research IDs are unchanged.
 */
const NAV_GROUPS = [
  {
    label: 'Research',
    items: [
      { to: '/', label: 'Overview', end: true },
      { to: '/casebook', label: 'Investigations', end: false },
    ],
  },
  {
    label: 'Analysis',
    items: [
      { to: '/comparison', label: 'Compare policies', end: false },
      { to: '/mechanisms', label: 'Mechanisms', end: false },
    ],
  },
  {
    label: 'Evidence',
    items: [
      { to: '/claims', label: 'Evidence library', end: false },
      { to: '/gaps', label: 'Research gaps', end: false },
    ],
  },
] as const;

function isWorkspaceRoute(pathname: string): boolean {
  return pathname !== '/';
}

function NavGroups({
  onNavigate,
  idPrefix,
}: {
  onNavigate?: () => void;
  idPrefix: string;
}) {
  return (
    <>
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="rail-group-label" id={`${idPrefix}-${group.label}`}>
            {group.label}
          </p>
          <div role="group" aria-labelledby={`${idPrefix}-${group.label}`}>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rail-link${isActive ? ' is-active' : ''}`
                }
                onClick={onNavigate}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export function AppShell() {
  const location = useLocation();
  const withRail = isWorkspaceRoute(location.pathname);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerTitleId = useId();
  const { provenance } = researchDataset;

  const drawerRef = useRef<HTMLDialogElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const previousPath = useRef(location.pathname);

  useEffect(() => {
    if (previousPath.current === location.pathname) return;
    previousPath.current = location.pathname;
    drawerRef.current?.close();
    if (!location.hash) window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!location.hash || !mainRef.current) return;
    let id = location.hash.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch {
      // An invalid escape can still be part of a literal fragment.
    }
    function scrollToFragment() {
      const anchor = document.getElementById(id);
      anchor?.scrollIntoView?.();
      return Boolean(anchor);
    }
    if (scrollToFragment()) return;

    const observer = new MutationObserver(() => {
      if (scrollToFragment()) observer.disconnect();
    });
    observer.observe(mainRef.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const desktop = window.matchMedia('(min-width: 960px)');
    const closeOnDesktop = () => {
      if (desktop.matches) drawerRef.current?.close();
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  function openDrawer() {
    drawerRef.current?.showModal();
    setDrawerOpen(true);
  }

  function closeDrawer() {
    drawerRef.current?.close();
  }

  return (
    <div className="app">
      <a className="skip-link sr-only" href="#main-content">
        Skip to content
      </a>

      <header className="chrome">
        <div className="chrome-inner">
          <Link
            to="/"
            className="brand-lockup brand-lockup--compact"
            aria-label="PolisLab home"
          >
            <BrandLockup compact />
          </Link>
          <div className="chrome-actions">
            {!withRail ? (
              <a href="#policy-investigations" className="btn btn--secondary">
                Browse questions
              </a>
            ) : null}
            <button
              ref={menuButtonRef}
              type="button"
              className="menu-toggle"
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav-drawer"
              onClick={openDrawer}
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      <dialog
        ref={drawerRef}
        className="drawer"
        id="mobile-nav-drawer"
        aria-labelledby={drawerTitleId}
        onClose={() => {
          setDrawerOpen(false);
          menuButtonRef.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="drawer-panel">
          <div className="drawer-header">
            <p id={drawerTitleId} className="page-kicker" style={{ margin: 0 }}>
              Navigate
            </p>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={closeDrawer}
            >
              Close
            </button>
          </div>
          <nav aria-label="Mobile primary">
            <NavGroups idPrefix="m" onNavigate={closeDrawer} />
          </nav>
          <div className="rail-secondary" style={{ marginTop: '1.5rem' }}>
            <p>
              Research {RESEARCH_RELEASE} · cutoff {RESEARCH_CUTOFF}
            </p>
            <p>
              <Link to="/casebook/source" onClick={closeDrawer}>
                Methodology &amp; source
              </Link>
            </p>
          </div>
        </div>
      </dialog>

      <div className={`workspace${withRail ? ' workspace--with-rail' : ''}`}>
        {withRail ? (
          <aside className="rail" aria-label="Workspace">
            <nav aria-label="Primary">
              <NavGroups idPrefix="d" />
            </nav>
            <div className="rail-secondary">
              <p>
                Research {RESEARCH_RELEASE}
                <br />
                Cutoff {RESEARCH_CUTOFF}
                <br />
                Correction {RESEARCH_CORRECTION_PASS}
                <br />
                App v0.2 · Build 08F
              </p>
              <p style={{ marginTop: '0.75rem' }}>
                <Link to="/casebook/source">Methodology &amp; source</Link>
              </p>
            </div>
          </aside>
        ) : null}

        <main
          ref={mainRef}
          tabIndex={-1}
          id="main-content"
          className={`main${withRail ? ' main--workspace' : ' main--editorial'}`}
        >
          <Outlet />
        </main>
      </div>

      <footer className="footer-bar">
        <p>
          Source {provenance.sourceFile} · SHA-256{' '}
          <span className="mono">{provenance.sourceContentSha256.slice(0, 12)}…</span>
        </p>
        <p>
          Research text{' '}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            CC BY 4.0
          </a>
          ; application software Apache 2.0 (see repository{' '}
          <span className="mono">LICENSE-SOFTWARE</span>).{' '}
          <Link to="/casebook/source#licensing" className="underline underline-offset-2">
            Methodology &amp; licensing
          </Link>
          .
        </p>
        <p>
          Not legal advice. Does not produce policy rankings, welfare forecasts, or
          simulated economic effects.
        </p>
      </footer>
    </div>
  );
}
