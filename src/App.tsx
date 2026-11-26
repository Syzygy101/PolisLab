import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { OverviewPage } from '@/pages/OverviewPage';
import { ClaimsPage } from '@/pages/ClaimsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
const RetailDevelopmentPage = lazy(() => import('@/pages/RetailDevelopmentPage'));

/** Claim detail / compare and heavier modules load on demand. */
const ClaimDetailPage = lazy(() =>
  import('@/pages/ClaimDetailPage').then((m) => ({ default: m.ClaimDetailPage })),
);
const ComparePage = lazy(() =>
  import('@/pages/ComparePage').then((m) => ({ default: m.ComparePage })),
);
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
const GapsPage = lazy(() =>
  import('@/pages/GapsPage').then((m) => ({ default: m.GapsPage })),
);
const GapRequirementPage = lazy(() =>
  import('@/pages/GapRequirementPage').then((m) => ({ default: m.GapRequirementPage })),
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
        <Route
          path="claims/compare"
          element={
            <Suspense fallback={<RouteFallback label="claim comparison" />}>
              <ComparePage />
            </Suspense>
          }
        />
        <Route
          path="claims/:claimId"
          element={
            <Suspense fallback={<RouteFallback label="claim" />}>
              <ClaimDetailPage />
            </Suspense>
          }
        />
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
            <Suspense fallback={<RouteFallback label="evidence gaps" />}>
              <GapsPage />
            </Suspense>
          }
        />
        <Route
          path="gaps/:requirementId"
          element={
            <Suspense fallback={<RouteFallback label="evidence gaps" />}>
              <GapRequirementPage />
            </Suspense>
          }
        />
        <Route path="sandbox" element={<Suspense fallback={<RouteFallback label="experiment" />}>
          <RetailDevelopmentPage />
        </Suspense>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
