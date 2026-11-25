import { useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CompareView } from '@/components/claims/CompareView';
import type { ExplorerReturnState } from '@/components/claims/ClaimsTable';
import { findClaimById } from '@/data/researchDataset';
import {
  parseCompareState,
  serializeCompareSearchParams,
} from '@/research/compareUrl';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

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

export function ComparePage() {
  useDocumentTitle('Compare claims');

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const explorerHref = explorerHrefFromState(location.state);

  const state = useMemo(
    () => parseCompareState(searchParams, findClaimById),
    [searchParams],
  );

  function onSetSlot(param: 'a' | 'b', claimId: string | null) {
    const next = {
      a: param === 'a' ? claimId : state.slotA.rawId,
      b: param === 'b' ? claimId : state.slotB.rawId,
    };
    setSearchParams(serializeCompareSearchParams(next), { replace: false });
  }

  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
        <Link to={explorerHref} className="no-underline hover:underline">
          Evidence library
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Compare</span>
      </nav>
      <CompareView state={state} onSetSlot={onSetSlot} />
    </div>
  );
}
