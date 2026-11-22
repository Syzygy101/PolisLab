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
      className="stack"
      aria-labelledby="cited-evidence-heading"
      data-testid="cited-evidence-panel"
    >
      <div className="case-section-head">
        <h2 id="cited-evidence-heading">Cited evidence ({members.length})</h2>
      </div>
      <p className="small-note">
        Direct citation membership for {researchCase.id} — including common all-case rules where
        applicable. Memberships overlap across cases and do not measure evidence quality or policy
        performance.
      </p>

      <div className="action-row">
        <Link
          to={claimsExplorerHref({ cases: [researchCase.id] })}
          className="btn btn--primary"
          data-testid="open-case-claims-explorer"
        >
          Open in Evidence library
        </Link>
        {compareReady ? (
          <Link
            to={compareHref({ a: selected[0], b: selected[1] })}
            className="btn btn--secondary"
            data-testid="compare-selected-claims"
          >
            Compare selected claims
          </Link>
        ) : (
          <span className="small-note small-note--subtle" role="status">
            Select two cited claims to open evidence comparison
          </span>
        )}
      </div>

      <ul className="evidence-list">
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
            <li key={claim.claim_id}>
              <div style={{ minWidth: 0 }}>
                <div className="action-row" style={{ marginBottom: '0.25rem' }}>
                  <Link to={`/claims/${claim.claim_id}`} className="id-link">
                    {claim.claim_id}
                  </Link>
                  <StatusBadge status={claim.status} />
                  <span className="meta-line">{CITATION_RELATION_LABELS[relation]}</span>
                </div>
                <p className="claim-text">{claim.exact_claim}</p>
              </div>
              <label className="check-inline">
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
      <p className="meta-line">
        Atlas universe: {allClaims.length} claims. This index lists direct members only.
      </p>
    </section>
  );
}
