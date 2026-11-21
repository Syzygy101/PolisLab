import { Link, useLocation, useParams } from 'react-router-dom';
import { findClaimById } from '@/data/researchDataset';
import { ClaimDetailView } from '@/components/claims/ClaimDetailView';
import type { ExplorerReturnState } from '@/components/claims/ClaimsTable';
import type { CaseClaimReturnState } from '@/components/casebook/CasebookMarkdown';
import { caseSectionAnchor } from '@/research/casebookConstants';
import { isCaseId } from '@/research/taxonomy';

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

function caseReturnFromState(state: unknown): CaseClaimReturnState | null {
  if (!state || typeof state !== 'object') {
    return null;
  }
  const caseReturn = (state as { caseReturn?: CaseClaimReturnState }).caseReturn;
  if (!caseReturn || !isCaseId(caseReturn.caseId)) {
    return null;
  }
  return caseReturn;
}

export function ClaimDetailPage() {
  const { claimId } = useParams<{ claimId: string }>();
  const location = useLocation();
  const claim = claimId ? findClaimById(claimId) : undefined;
  const explorerHref = explorerHrefFromState(location.state);
  const caseReturn = caseReturnFromState(location.state);
  const caseReturnHref = caseReturn
    ? `/casebook/${caseReturn.caseId}${
        caseReturn.section ? `#${caseSectionAnchor(caseReturn.section)}` : ''
      }`
    : null;

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
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-2 text-sm text-ink-muted">
        <Link to={explorerHref} className="no-underline hover:underline">
          Claims Explorer
        </Link>
        <span>/</span>
        <span className="font-mono text-ink">{claim.claim_id}</span>
        {caseReturnHref ? (
          <>
            <span className="text-ink-subtle">·</span>
            <Link
              to={caseReturnHref}
              className="text-accent no-underline hover:underline"
              data-testid="return-to-case-section"
            >
              Back to {caseReturn!.caseId}
              {caseReturn!.section ? ` §${caseReturn!.section}` : ''}
            </Link>
          </>
        ) : null}
      </nav>
      <ClaimDetailView claim={claim} explorerReturnState={location.state as ExplorerReturnState | null} />
    </div>
  );
}
