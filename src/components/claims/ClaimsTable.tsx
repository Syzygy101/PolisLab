import { Link } from 'react-router-dom';
import type { Claim } from '@/research/schema';
import { AdmissibilityBadge } from './AdmissibilityBadge';
import { StatusBadge } from './StatusBadge';
import { IdChipList } from './IdChip';

/** Location state passed when opening a claim from the explorer. */
export interface ExplorerReturnState {
  explorerSearch: string;
}

interface ClaimsTableProps {
  claims: Claim[];
  selectedIds: string[];
  onToggleSelect: (claimId: string) => void;
  compareHref: string | null;
  onClearSelection: () => void;
  /** Current explorer query string (including pending search draft). */
  explorerReturnState: ExplorerReturnState;
  /** Synchronously commit pending search into the address bar before leaving. */
  onBeforeNavigate: () => void;
}

export function ClaimsTable({
  claims,
  selectedIds,
  onToggleSelect,
  compareHref,
  onClearSelection,
  explorerReturnState,
  onBeforeNavigate,
}: ClaimsTableProps) {
  if (claims.length === 0) {
    return (
      <div
        role="status"
        className="border border-dashed border-line-strong bg-paper-raised px-4 py-10 text-center"
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
    <div className="space-y-3">
      <div
        className="flex flex-wrap items-center justify-between gap-2 border border-line bg-paper-raised px-3 py-2 text-sm"
        data-testid="compare-tray"
      >
        <p className="text-ink-muted">
          Compare selection:{' '}
          <span className="font-mono text-ink">
            {selectedIds.length === 0 ? 'none' : selectedIds.join(' · ')}
          </span>
          <span className="text-ink-subtle"> (up to two distinct claims)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {selectedIds.length > 0 ? (
            <button
              type="button"
              onClick={onClearSelection}
              className="border border-line px-2 py-1 text-xs text-ink-muted hover:bg-neutral-soft"
            >
              Clear selection
            </button>
          ) : null}
          {compareHref ? (
            <Link
              to={compareHref}
              className="border border-accent bg-accent-soft px-2 py-1 text-xs font-medium text-accent no-underline hover:underline"
              state={explorerReturnState}
              onClick={onBeforeNavigate}
            >
              Open comparison
            </Link>
          ) : (
            <span className="px-2 py-1 text-xs text-ink-subtle">
              Select two claims to compare
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto border border-line bg-paper-raised">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-neutral-soft text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th scope="col" className="border-b border-line px-3 py-2 font-medium">
                Compare
              </th>
              <th scope="col" className="border-b border-line px-3 py-2 font-medium">
                Claim ID
              </th>
              <th scope="col" className="border-b border-line px-3 py-2 font-medium">
                Claim preview
              </th>
              <th scope="col" className="border-b border-line px-3 py-2 font-medium">
                Status
              </th>
              <th scope="col" className="border-b border-line px-3 py-2 font-medium">
                Admissibility
              </th>
              <th scope="col" className="border-b border-line px-3 py-2 font-medium">
                Mechanisms
              </th>
              <th scope="col" className="border-b border-line px-3 py-2 font-medium">
                Outcomes
              </th>
              <th scope="col" className="border-b border-line px-3 py-2 font-medium">
                Cases
              </th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => {
              const selected = selectedIds.includes(claim.claim_id);
              const selectionFull =
                selectedIds.length >= 2 && !selectedIds.includes(claim.claim_id);
              return (
                <tr
                  key={claim.claim_id}
                  className="border-b border-line last:border-b-0 hover:bg-accent-soft/40"
                >
                  <td className="px-3 py-2 align-top">
                    <input
                      type="checkbox"
                      checked={selected}
                      disabled={selectionFull}
                      onChange={() => onToggleSelect(claim.claim_id)}
                      aria-label={`Select ${claim.claim_id} for comparison`}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 align-top font-mono text-xs">
                    <Link
                      to={`/claims/${claim.claim_id}`}
                      className="text-accent no-underline hover:underline"
                      state={explorerReturnState}
                      onClick={onBeforeNavigate}
                    >
                      {claim.claim_id}
                    </Link>
                  </td>
                  <td className="max-w-xl px-3 py-2 align-top text-ink">
                    <Link
                      to={`/claims/${claim.claim_id}`}
                      className="block text-sm text-ink no-underline hover:underline"
                      aria-label={`Open claim ${claim.claim_id}`}
                      state={explorerReturnState}
                      onClick={onBeforeNavigate}
                    >
                      <span className="line-clamp-3">{claim.exact_claim}</span>
                      {claim.limitations_external_validity.trim() ? (
                        <span className="mt-1 block text-[11px] font-normal text-ink-subtle no-underline">
                          Full claim and limitations on the detail page — preview is not a
                          summary.
                        </span>
                      ) : (
                        <span className="mt-1 block text-[11px] font-normal text-ink-subtle no-underline">
                          Full claim on the detail page.
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="px-3 py-2 align-top">
                    <StatusBadge status={claim.status} />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <AdmissibilityBadge value={claim.admissible_in_policy_comparison} />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <IdChipList values={claim.mechanisms} />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <IdChipList values={claim.outcomes} />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <IdChipList values={claim.cases} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
