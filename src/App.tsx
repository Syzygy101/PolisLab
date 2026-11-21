import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { OverviewPage } from '@/pages/OverviewPage';
import { ClaimsPage } from '@/pages/ClaimsPage';
import { ClaimDetailPage } from '@/pages/ClaimDetailPage';
import { ComparePage } from '@/pages/ComparePage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

/** Casebook routes load markdown renderer + generated case bodies on demand. */
const CasebookPage = lazy(() =>
  import('@/pages/CasebookPage').then((m) => ({ default: m.CasebookPage })),
);
const CaseDetailPage = lazy(() =>
  import('@/pages/CaseDetailPage').then((m) => ({ default: m.CaseDetailPage })),
);
const CasebookSourcePage = lazy(() =>
  import('@/pages/CasebookSourcePage').then((m) => ({ default: m.CasebookSourcePage })),
);

function CasebookFallback() {
  return (
    <p className="text-sm text-ink-muted" role="status">
      Loading casebook…
    </p>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<OverviewPage />} />
        <Route path="claims" element={<ClaimsPage />} />
        <Route path="claims/compare" element={<ComparePage />} />
        <Route path="claims/:claimId" element={<ClaimDetailPage />} />
        <Route
          path="casebook"
          element={
            <Suspense fallback={<CasebookFallback />}>
              <CasebookPage />
            </Suspense>
          }
        />
        <Route
          path="casebook/source"
          element={
            <Suspense fallback={<CasebookFallback />}>
              <CasebookSourcePage />
            </Suspense>
          }
        />
        <Route
          path="casebook/:caseId"
          element={
            <Suspense fallback={<CasebookFallback />}>
              <CaseDetailPage />
            </Suspense>
          }
        />
        <Route
          path="mechanisms"
          element={
            <PlaceholderPage
              title="Mechanism Explorer"
              description="Causal mechanism mapping (M1–M6) will be explored here. Deferred — not implemented in Build 04."
            />
          }
        />
        <Route
          path="comparison"
          element={
            <PlaceholderPage
              title="Policy Comparison Laboratory"
              description="Structured cross-policy comparison of admissible claims across cases. Deferred — not implemented in Build 04. Two-claim evidence comparison remains at /claims/compare; case investigations are at /casebook."
            />
          }
        />
        <Route
          path="gaps"
          element={
            <PlaceholderPage
              title="Evidence Gaps and Falsification"
              description="Observations that would alter assessments and documented evidence gaps. Deferred — case §9 sections are navigable in the Casebook Explorer (Build 07 will prioritise the gap register)."
            />
          }
        />
        <Route
          path="sandbox"
          element={
            <PlaceholderPage
              title="Analytical Sandbox"
              description="Separately gated analytical workspace. Deferred and gated — not available in Build 04."
              gated
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
