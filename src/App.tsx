import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { OverviewPage } from '@/pages/OverviewPage';
import { ClaimsPage } from '@/pages/ClaimsPage';
import { ClaimDetailPage } from '@/pages/ClaimDetailPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<OverviewPage />} />
        <Route path="claims" element={<ClaimsPage />} />
        <Route path="claims/:claimId" element={<ClaimDetailPage />} />
        <Route
          path="casebook"
          element={
            <PlaceholderPage
              title="Casebook Explorer"
              description="Worked policy assessments from the v0.1.1 casebook will be interactive here. Deferred to Build 04 — not implemented in Build 02."
            />
          }
        />
        <Route
          path="mechanisms"
          element={
            <PlaceholderPage
              title="Mechanism Explorer"
              description="Causal mechanism mapping (M1–M6) will be explored here. Deferred — not implemented in Build 02."
            />
          }
        />
        <Route
          path="comparison"
          element={
            <PlaceholderPage
              title="Policy Comparison Laboratory"
              description="Structured comparison of admissible claims across cases. Deferred — not implemented in Build 02."
            />
          }
        />
        <Route
          path="gaps"
          element={
            <PlaceholderPage
              title="Evidence Gaps and Falsification"
              description="Observations that would alter assessments and documented evidence gaps. Deferred — not implemented in Build 02."
            />
          }
        />
        <Route
          path="sandbox"
          element={
            <PlaceholderPage
              title="Analytical Sandbox"
              description="Separately gated analytical workspace. Deferred and gated — not available in Build 02."
              gated
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
