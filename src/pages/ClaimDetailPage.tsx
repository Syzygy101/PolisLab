import { Link, useParams } from 'react-router-dom';
import { findClaimById } from '@/data/researchDataset';
import { ClaimDetailView } from '@/components/claims/ClaimDetailView';

export function ClaimDetailPage() {
  const { claimId } = useParams<{ claimId: string }>();
  const claim = claimId ? findClaimById(claimId) : undefined;

  if (!claim) {
    return (
      <div className="space-y-4 border border-dashed border-line-strong bg-paper-raised p-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Claim not found</h1>
        <p className="text-sm text-ink-muted">
          No atlas claim matches{' '}
          <span className="font-mono text-ink">{claimId ?? '(missing id)'}</span>. Check the claim
          ID or return to the explorer.
        </p>
        <Link to="/claims" className="text-sm font-medium">
          Back to Claims Explorer
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
        <Link to="/claims" className="no-underline hover:underline">
          Claims Explorer
        </Link>
        <span className="mx-2">/</span>
        <span className="font-mono text-ink">{claim.claim_id}</span>
      </nav>
      <ClaimDetailView claim={claim} />
    </div>
  );
}
