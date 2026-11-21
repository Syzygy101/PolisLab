import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ParsedCase } from '@/research/casebookSchema';
import { casebookDataset } from '@/data/casebookDataset';
import { allClaims, findClaimById } from '@/data/researchDataset';
import { claimsExplorerHref } from '@/research/urlFilters';
import { compareHref } from '@/research/compareUrl';
import {
  CITATION_RELATION_LABELS,
  classifyCitationRelation,
} from '@/research/casebookQueries';
import { StatusBadge } from '@/components/claims/StatusBadge';

export function CitedEvidencePanel({ researchCase }: { researchCase: ParsedCase }) {
  const [selected, setSelected] = useState<string[]>([]);

  const members = useMemo(() => {
    return researchCase.membershipClaimIds
      .map((id) => findClaimById(id))
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
  }, [researchCase]);

  const atlasMemberIds = useMemo(
    () => new Set(researchCase.membershipClaimIds),
    [researchCase],
  );

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  }

  const compareReady = selected.length === 2;

  return (
    <section
      className="space-y-3 border border-line bg-paper-raised p-4"
      aria-labelledby="cited-evidence-heading"
      data-testid="cited-evidence-panel"
    >
      <div className="space-y-1">
        <h2 id="cited-evidence-heading" className="font-display text-lg font-semibold text-ink">
          Cited evidence ({members.length})
        </h2>
        <p className="text-sm text-ink-muted">
          Direct citation membership for {researchCase.id} — including common all-case rules where
          applicable. Memberships overlap across cases and do not measure evidence quality or policy
          performance.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          to={claimsExplorerHref({ cases: [researchCase.id] })}
          className="border border-accent bg-accent px-3 py-1.5 text-sm font-medium text-white no-underline hover:opacity-90"
          data-testid="open-case-claims-explorer"
        >
          Open in Claims Explorer
        </Link>
        {compareReady ? (
          <Link
            to={compareHref({ a: selected[0], b: selected[1] })}
            className="border border-accent/40 bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent no-underline hover:bg-accent-soft"
            data-testid="compare-selected-claims"
          >
            Compare selected claims
          </Link>
        ) : (
          <span className="px-1 py-1.5 text-xs text-ink-subtle">
            Select two cited claims to open evidence comparison
          </span>
        )}
      </div>

      <ul className="divide-y divide-line border border-line">
        {members.map((claim) => {
          const relation = classifyCitationRelation(
            casebookDataset,
            researchCase.id,
            claim.claim_id,
            {
              atlasMemberIds,
              claimCases: claim.cases,
            },
          );
          const checked = selected.includes(claim.claim_id);
          return (
            <li
              key={claim.claim_id}
              className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/claims/${claim.claim_id}`}
                    className="font-mono text-xs text-accent no-underline hover:underline"
                  >
                    {claim.claim_id}
                  </Link>
                  <StatusBadge status={claim.status} />
                  <span className="text-[11px] text-ink-subtle">
                    {CITATION_RELATION_LABELS[relation]}
                  </span>
                </div>
                <p className="text-sm text-ink line-clamp-2">{claim.exact_claim}</p>
              </div>
              <label className="flex shrink-0 items-center gap-2 text-xs text-ink-muted">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(claim.claim_id)}
                  aria-label={`Select ${claim.claim_id} for comparison`}
                />
                Compare
              </label>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-ink-subtle">
        Atlas universe: {allClaims.length} claims. This index lists direct members only.
      </p>
    </section>
  );
}
