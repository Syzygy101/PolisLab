import { Link, useLocation, useParams } from 'react-router-dom';
import { findClaimById } from '@/data/researchDataset';
import { ClaimDetailView } from '@/components/claims/ClaimDetailView';
import type { ExplorerReturnState } from '@/components/claims/ClaimsTable';

function explorerHrefFromState(state: unknown): string {
  if (!state || typeof state !== 'object') {
    return '/claims';
  }
  const explorerSearch = (state as ExplorerReturnState).explorerSearch;
  if (typeof explorerSearch !== 'string') {
    return '/claims';
  }
  return explorerSearch.length > 0 ? `/claims?${explorerSearch}` : '/claims';
}

export function ClaimDetailPage() {
  const { claimId } = useParams<{ claimId: string }>();
  const location = useLocation();
  const claim = claimId ? findClaimById(claimId) : undefined;
  const explorerHref = explorerHrefFromState(location.state);

  if (!claim) {
    return (
      <div className="space-y-4 border border-dashed border-line-strong bg-paper-raised p-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Claim not found</h1>
        <p className="text-sm text-ink-muted">
          No atlas claim matches{' '}
          <span className="font-mono text-ink">{claimId ?? '(missing id)'}</span>. Check the claim
          ID or return to the explorer.
        </p>
        <Link to={explorerHref} className="text-sm font-medium">
          Back to Claims Explorer
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
        <Link to={explorerHref} className="no-underline hover:underline">
          Claims Explorer
        </Link>
        <span className="mx-2">/</span>
        <span className="font-mono text-ink">{claim.claim_id}</span>
      </nav>
      <ClaimDetailView claim={claim} explorerReturnState={location.state as ExplorerReturnState | null} />
    </div>
  );
}
