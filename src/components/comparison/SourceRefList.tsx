import { Link } from 'react-router-dom';
import { findClaimById } from '@/data/researchDataset';
import type { ComparisonSourceRef } from '@/research/comparisonSchema';
import { caseSectionAnchor } from '@/research/casebookConstants';
import { isCaseId } from '@/research/taxonomy';

function claimSupportHint(claimId: string): string | null {
  const claim = findClaimById(claimId);
  if (!claim) return 'claim not in atlas';
  const parts = [
    `status ${claim.status}`,
    `admissibility ${claim.admissible_in_policy_comparison}`,
  ];
  if (
    claim.status === 'absence_of_finding' ||
    claim.status === 'unresolved_hypothesis' ||
    claim.claim_id.startsWith('ATLAS-GAP-') ||
    claim.claim_id.startsWith('ATLAS-HYP-')
  ) {
    parts.push('limiting or conditional evidence — not affirmative pathway proof');
  } else if (claim.admissible_in_policy_comparison === 'no') {
    parts.push('not admissible as a validated analytical result');
  }
  return parts.join(' · ');
}

export function SourceRefList({
  sources,
  testId,
  roleNote,
}: {
  sources: readonly ComparisonSourceRef[];
  testId?: string;
  /** Optional framing when sources may limit rather than establish a pathway. */
  roleNote?: string;
}) {
  if (sources.length === 0) {
    return null;
  }
  return (
    <div className="space-y-1 text-xs" data-testid={testId}>
      {roleNote ? <p className="text-ink-subtle">{roleNote}</p> : null}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-ink-subtle">Sources:</span>
        {sources.map((source) => {
          if (source.kind === 'claim') {
            const hint = claimSupportHint(source.id);
            return (
              <span key={`${source.kind}-${source.id}`} className="inline-flex flex-wrap items-baseline gap-1">
                <Link
                  to={`/claims/${source.id}`}
                  className="inline-flex min-h-6 items-center font-mono text-accent no-underline hover:underline"
                  data-comparison-claim={source.id}
                  title={hint ?? undefined}
                >
                  {source.id}
                </Link>
                {hint ? (
                  <span className="text-[10px] text-ink-subtle">({hint})</span>
                ) : null}
              </span>
            );
          }
          if (source.caseId && isCaseId(source.caseId) && source.section) {
            return (
              <Link
                key={`${source.kind}-${source.id}`}
                to={`/casebook/${source.caseId}#${caseSectionAnchor(source.section)}`}
                className="inline-flex min-h-6 items-center font-mono text-accent no-underline hover:underline"
                data-comparison-case-section={source.id}
              >
                {source.id}
              </Link>
            );
          }
          return (
            <span key={source.id} className="font-mono text-ink-muted">
              {source.id}
            </span>
          );
        })}
      </div>
    </div>
  );
}
