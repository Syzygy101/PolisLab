import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Claim } from '@/research/schema';
import { ATLAS_SOURCE_FIELDS } from '@/research/constants';
import { AdmissibilityBadge } from './AdmissibilityBadge';
import { FIELD_LABELS, FieldValue } from './ClaimDetailView';
import { IdChipList } from './IdChip';
import type { ExplorerReturnState } from './ClaimsTable';
import { StatusBadge, statusTone } from './StatusBadge';

interface ClaimInspectorProps {
  claim: Claim;
  /** Explorer query string (including pending search draft) for return navigation. */
  explorerReturnState: ExplorerReturnState;
  /** Synchronously commit pending search into the address bar before leaving. */
  onBeforeNavigate: () => void;
}

/**
 * Desktop record inspector for the Evidence library master-detail layout.
 *
 * Renders the complete original atlas record (all 18 source fields) so the
 * researcher can read a record without leaving the filtered list. The stable
 * `/claims/:claimId` page remains the canonical, independently accessible URL.
 */
export function ClaimInspector({
  claim,
  explorerReturnState,
  onBeforeNavigate,
}: ClaimInspectorProps) {
  const [copyState, setCopyState] = useState<{ id: string; ok: boolean } | null>(null);
  const sharePath = `/claims/${claim.claim_id}`;

  async function copyClaimLink() {
    const url = `${window.location.origin}${sharePath}`;
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('clipboard unavailable');
      }
      await navigator.clipboard.writeText(url);
      setCopyState({ id: claim.claim_id, ok: true });
    } catch {
      setCopyState({ id: claim.claim_id, ok: false });
    }
  }

  const feedback =
    copyState && copyState.id === claim.claim_id
      ? copyState.ok
        ? 'Claim link copied.'
        : 'Could not copy automatically — use the full-page URL instead.'
      : '';

  return (
    <article
      data-testid="claim-inspector"
      aria-label={`Record inspector for ${claim.claim_id}`}
      className="space-y-4"
    >
      <header className="space-y-3">
        <p className="claim-id" data-testid="inspector-claim-id">
          {claim.claim_id}
        </p>
        <h2 className="font-display text-lg font-semibold leading-snug text-ink">
          {claim.exact_claim}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={claim.status} />
          <AdmissibilityBadge value={claim.admissible_in_policy_comparison} />
        </div>
        <p className="meta-line">{statusTone(claim.status)}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={sharePath}
            state={explorerReturnState}
            onClick={onBeforeNavigate}
            className="btn btn--secondary"
            data-testid="inspector-open-full"
          >
            Open full record page
          </Link>
          <button type="button" className="btn btn--ghost" onClick={() => void copyClaimLink()}>
            Copy claim URL
          </button>
          <span role="status" className="meta-line" data-testid="inspector-copy-feedback">
            {feedback}
          </span>
        </div>
      </header>

      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-subtle">Mechanisms</p>
          <div className="mt-1">
            <IdChipList values={claim.mechanisms} linkMechanisms />
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-subtle">Outcomes</p>
          <div className="mt-1">
            <IdChipList values={claim.outcomes} />
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-subtle">Cases</p>
          <div className="mt-1">
            <IdChipList values={claim.cases} />
          </div>
        </div>
      </div>

      <section aria-label="All 18 source fields" data-testid="inspector-fields">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Complete atlas record (18 source fields)
        </h3>
        <dl className="mt-2 divide-y divide-line border border-line">
          {ATLAS_SOURCE_FIELDS.map((field) => (
            <div key={field} className="space-y-1 px-3 py-2" data-field={field}>
              <dt className="text-xs font-medium text-ink-muted">
                <span>{FIELD_LABELS[field]}</span>
                <span className="ml-2 font-mono text-[10px] text-ink-subtle">{field}</span>
              </dt>
              <dd className="m-0 break-words whitespace-pre-wrap text-sm text-ink">
                <FieldValue claim={claim} field={field} />
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}
