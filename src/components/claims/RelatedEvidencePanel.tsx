import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Claim } from '@/research/schema';
import {
  findRelatedEvidence,
  type RelatedEvidenceItem,
  type RelatedOverlapDimension,
} from '@/research/relatedEvidence';
import { claimsExplorerHref } from '@/research/urlFilters';
import { StatusBadge } from './StatusBadge';

const DIMENSION_OPTIONS: { id: 'all' | RelatedOverlapDimension; label: string }[] = [
  { id: 'all', label: 'All associations' },
  { id: 'mechanism', label: 'Mechanism' },
  { id: 'outcome', label: 'Outcome' },
  { id: 'case', label: 'Case' },
  { id: 'literature', label: 'Literature ID' },
];

const INITIAL_VISIBLE = 8;

function itemMatchesDimension(
  item: RelatedEvidenceItem,
  dimension: 'all' | RelatedOverlapDimension,
): boolean {
  if (dimension === 'all') {
    return true;
  }
  return item.overlaps.some((overlap) => overlap.dimension === dimension);
}

export function RelatedEvidencePanel({
  claim,
  claims,
}: {
  claim: Claim;
  claims: Claim[];
}) {
  const related = useMemo(() => findRelatedEvidence(claim, claims), [claim, claims]);
  const [dimension, setDimension] = useState<'all' | RelatedOverlapDimension>('all');
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(
    () => related.filter((item) => itemMatchesDimension(item, dimension)),
    [related, dimension],
  );

  const visible = expanded ? filtered : filtered.slice(0, INITIAL_VISIBLE);
  const hiddenCount = Math.max(0, filtered.length - INITIAL_VISIBLE);

  return (
    <section
      aria-labelledby="related-heading"
      className="space-y-3 border border-line bg-paper-raised p-5"
      data-testid="related-evidence"
    >
      <h2 id="related-heading" className="text-sm font-semibold text-ink">
        Related evidence (metadata association)
      </h2>
      <p className="text-xs text-ink-muted">
        Links below reflect shared mechanism, outcome, case, or literature-source identifiers from
        the atlas. Metadata association is not causal connection, corroboration, contradiction, or
        a citation relationship unless the authoritative source explicitly establishes that
        relationship. Sharing a source URL is listed separately and does not imply corroboration.
      </p>

      {related.length === 0 ? (
        <p className="text-sm text-ink-subtle" data-testid="related-empty">
          No other claims share mechanism, outcome, case, or literature identifiers with this
          record.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs text-ink-muted" data-testid="related-count">
              {filtered.length} of {related.length} associated claim
              {related.length === 1 ? '' : 's'}
              {dimension === 'all' ? '' : ` (filtered to ${dimension})`}
            </p>
            <div
              className="flex flex-wrap gap-1"
              role="group"
              aria-label="Related evidence dimension filter"
            >
              {DIMENSION_OPTIONS.map((option) => {
                const pressed = dimension === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => {
                      setDimension(option.id);
                      setExpanded(false);
                    }}
                    className={[
                      'rounded border px-2 py-1 text-[11px]',
                      pressed
                        ? 'border-accent bg-accent-soft text-accent'
                        : 'border-line bg-paper text-ink-muted hover:bg-neutral-soft',
                    ].join(' ')}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-ink-subtle" data-testid="related-dimension-empty">
              No associations on the selected dimension. Choose another dimension or show all
              associations.
            </p>
          ) : (
            <ul className="divide-y divide-line border border-line">
              {visible.map((item) => (
                <li key={item.claim.claim_id} className="space-y-1 px-3 py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link
                      to={`/claims/${item.claim.claim_id}`}
                      className="font-mono text-xs text-accent"
                    >
                      {item.claim.claim_id}
                    </Link>
                    <StatusBadge status={item.claim.status} />
                  </div>
                  <p className="line-clamp-2 text-sm text-ink">{item.claim.exact_claim}</p>
                  <p className="text-xs text-ink-muted">{item.explanation}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {item.overlaps
                      .filter((o) => o.dimension === 'mechanism')
                      .flatMap((o) => o.sharedIds)
                      .map((id) => (
                        <Link
                          key={`m-${id}`}
                          to={claimsExplorerHref({ mechanisms: [id] })}
                          className="text-accent"
                        >
                          Mechanism {id} subset
                        </Link>
                      ))}
                    {item.overlaps
                      .filter((o) => o.dimension === 'case')
                      .flatMap((o) => o.sharedIds)
                      .slice(0, 2)
                      .map((id) => (
                        <Link
                          key={`c-${id}`}
                          to={claimsExplorerHref({ cases: [id] })}
                          className="text-accent"
                        >
                          {id} evidence
                        </Link>
                      ))}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {hiddenCount > 0 ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="border border-line px-3 py-1.5 text-sm text-ink-muted hover:bg-neutral-soft"
              data-testid="related-toggle"
            >
              {expanded
                ? 'Show fewer associations'
                : `Show all ${filtered.length} associations (${hiddenCount} more)`}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
