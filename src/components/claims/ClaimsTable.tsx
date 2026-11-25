import { Link } from 'react-router-dom';
import type { Claim } from '@/research/schema';
import { AdmissibilityBadge } from './AdmissibilityBadge';
import { StatusBadge } from './StatusBadge';
import { IdChipList } from './IdChip';

/** Location state passed when opening a claim from the explorer. */
export interface ExplorerReturnState {
  explorerSearch: string;
}

interface CompareBarProps {
  selectedIds: string[];
  compareHref: string | null;
  onClearSelection: () => void;
  explorerReturnState: ExplorerReturnState;
  onBeforeNavigate: () => void;
}

/** Visible comparison selection tray (up to two distinct claims). */
export function CompareBar({
  selectedIds,
  compareHref,
  onClearSelection,
  explorerReturnState,
  onBeforeNavigate,
}: CompareBarProps) {
  return (
    <div className="compare-bar" data-testid="compare-tray" role="region" aria-label="Comparison selection">
      <p className="m-0">
        Compare selection:{' '}
        <span className="mono" data-testid="compare-selection">
          {selectedIds.length === 0 ? 'none' : selectedIds.join(' · ')}
        </span>
        <span className="text-ink-subtle"> (up to two distinct claims)</span>
      </p>
      <span className="flex-1" />
      {selectedIds.length > 0 ? (
        <button type="button" onClick={onClearSelection} className="btn btn--ghost">
          Clear selection
        </button>
      ) : null}
      {compareHref ? (
        <Link
          to={compareHref}
          className="btn btn--primary"
          state={explorerReturnState}
          onClick={onBeforeNavigate}
          data-testid="claims-compare-action"
        >
          Open comparison
        </Link>
      ) : (
        <span className="meta-line">Select two claims to compare</span>
      )}
    </div>
  );
}

interface ClaimsTableProps {
  claims: Claim[];
  selectedIds: string[];
  onToggleSelect: (claimId: string) => void;
  /** Current explorer query string (including pending search draft). */
  explorerReturnState: ExplorerReturnState;
  /** Synchronously commit pending search into the address bar before leaving. */
  onBeforeNavigate: () => void;
  /** Wide (master-detail) layout: record text inspects instead of navigating. */
  wide: boolean;
  /** Claim currently shown in the inspector (wide layout only). */
  inspectedId: string | null;
  onInspect: (claimId: string) => void;
}

/**
 * Evidence library result list (record rows).
 *
 * Controls are deliberately distinct:
 * - checkbox            → add/remove the claim from the comparison selection
 * - ID link             → open the stable `/claims/:claimId` page
 * - record text (wide)  → inspect in the side inspector without leaving the list
 * - record text (narrow)→ navigate to the full-page record (return state preserved)
 */
export function ClaimsTable({
  claims,
  selectedIds,
  onToggleSelect,
  explorerReturnState,
  onBeforeNavigate,
  wide,
  inspectedId,
  onInspect,
}: ClaimsTableProps) {
  if (claims.length === 0) {
    return (
      <div
        role="status"
        className="inspector-empty border border-dashed border-line-strong bg-paper-raised px-4 py-10 text-center"
        data-testid="empty-results"
      >
        <p className="text-sm font-medium text-ink">No claims match the current research subset</p>
        <p className="mt-1 text-sm text-ink-muted">
          Remove an active filter chip, reset filters, or broaden the search. Exact claim IDs and
          literature-source identifiers remain searchable.
        </p>
      </div>
    );
  }

  return (
    <div className="claims-list" role="list" aria-label="Matching claims" data-testid="claims-list">
      {claims.map((claim) => {
        const selected = selectedIds.includes(claim.claim_id);
        const selectionFull = selectedIds.length >= 2 && !selected;
        const inspecting = wide && inspectedId === claim.claim_id;
        const snippet = (
          <>
            <span className="claim-snippet">{claim.exact_claim}</span>
          </>
        );
        return (
          <div
            key={claim.claim_id}
            role="listitem"
            className={`record-row${inspecting ? ' is-selected' : ''}`}
            data-claim-id={claim.claim_id}
          >
            <input
              type="checkbox"
              checked={selected}
              disabled={selectionFull}
              onChange={() => onToggleSelect(claim.claim_id)}
              aria-label={`Select ${claim.claim_id} for comparison`}
              style={{ marginTop: '0.2rem', width: '1.1rem', height: '1.1rem' }}
            />
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Link
                  to={`/claims/${claim.claim_id}`}
                  className="claim-id text-accent no-underline hover:underline"
                  state={explorerReturnState}
                  onClick={onBeforeNavigate}
                >
                  {claim.claim_id}
                </Link>
                <StatusBadge status={claim.status} />
                <AdmissibilityBadge value={claim.admissible_in_policy_comparison} />
              </div>

              {wide ? (
                <button
                  type="button"
                  className="record-open"
                  onClick={() => onInspect(claim.claim_id)}
                  aria-describedby={`claim-row-desc-${claim.claim_id}`}
                  aria-pressed={inspecting}
                >
                  {snippet}
                </button>
              ) : (
                <Link
                  to={`/claims/${claim.claim_id}`}
                  className="record-open underline-offset-2 hover:underline"
                  aria-describedby={`claim-row-desc-${claim.claim_id}`}
                  state={explorerReturnState}
                  onClick={onBeforeNavigate}
                >
                  {snippet}
                </Link>
              )}
              <span id={`claim-row-desc-${claim.claim_id}`} className="sr-only">
                Claim {claim.claim_id}
              </span>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                <IdChipList values={claim.mechanisms} linkMechanisms />
                <IdChipList values={claim.outcomes} />
                <IdChipList values={claim.cases} />
                {wide ? (
                  <Link
                    to={`/claims/${claim.claim_id}`}
                    state={explorerReturnState}
                    onClick={onBeforeNavigate}
                    className="ml-auto text-accent underline underline-offset-2"
                  >
                    Open full page
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
