import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { OverviewPage } from '@/pages/OverviewPage';
import { ClaimsPage } from '@/pages/ClaimsPage';
import { ClaimDetailPage } from '@/pages/ClaimDetailPage';
import { ComparePage } from '@/pages/ComparePage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

/** Casebook / mechanism routes load on demand. */
const CasebookPage = lazy(() =>
  import('@/pages/CasebookPage').then((m) => ({ default: m.CasebookPage })),
);
const CaseDetailPage = lazy(() =>
  import('@/pages/CaseDetailPage').then((m) => ({ default: m.CaseDetailPage })),
);
const CasebookSourcePage = lazy(() =>
  import('@/pages/CasebookSourcePage').then((m) => ({ default: m.CasebookSourcePage })),
);
const MechanismsPage = lazy(() =>
  import('@/pages/MechanismsPage').then((m) => ({ default: m.MechanismsPage })),
);
const MechanismDetailPage = lazy(() =>
  import('@/pages/MechanismDetailPage').then((m) => ({ default: m.MechanismDetailPage })),
);
const ComparisonPage = lazy(() =>
  import('@/pages/ComparisonPage').then((m) => ({ default: m.ComparisonPage })),
);

function RouteFallback({ label }: { label: string }) {
  return (
    <p className="text-sm text-ink-muted" role="status">
      Loading {label}…
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
            <Suspense fallback={<RouteFallback label="casebook" />}>
              <CasebookPage />
            </Suspense>
          }
        />
        <Route
          path="casebook/source"
          element={
            <Suspense fallback={<RouteFallback label="casebook" />}>
              <CasebookSourcePage />
            </Suspense>
          }
        />
        <Route
          path="casebook/:caseId"
          element={
            <Suspense fallback={<RouteFallback label="casebook" />}>
              <CaseDetailPage />
            </Suspense>
          }
        />
        <Route
          path="mechanisms"
          element={
            <Suspense fallback={<RouteFallback label="mechanisms" />}>
              <MechanismsPage />
            </Suspense>
          }
        />
        <Route
          path="mechanisms/:mechanismId"
          element={
            <Suspense fallback={<RouteFallback label="mechanisms" />}>
              <MechanismDetailPage />
            </Suspense>
          }
        />
        <Route
          path="comparison"
          element={
            <Suspense fallback={<RouteFallback label="comparison" />}>
              <ComparisonPage />
            </Suspense>
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
              description="Separately gated analytical workspace. Deferred and gated — not available in Build 06."
              gated
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
