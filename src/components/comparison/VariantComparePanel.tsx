import { Link } from 'react-router-dom';
import type { VariantComparison, VariantComparisonSide } from '@/research/comparisonQueries';
import { OUTCOME_STAGES, getOutcomeStage } from '@/research/taxonomy';
import { caseSectionAnchor } from '@/research/casebookConstants';
import { SourceRefList } from './SourceRefList';
import { allClaims, findClaimById } from '@/data/researchDataset';
import { partitionComparisonRequirements } from '@/research/gapsQueries';
import type { ResearchRequirement } from '@/research/gapsSchema';
import {
  CrossCaseSideRequirements,
  SharedCaseWideRequirements,
  VariantSpecificRequirements,
} from './ComparisonRequirements';

function SideColumn({
  side,
  label,
  gapRequirements,
  sameCase,
}: {
  side: VariantComparisonSide | null;
  label: string;
  gapRequirements: ResearchRequirement[];
  sameCase: boolean;
}) {
  if (!side) {
    return (
      <div className="border border-dashed border-line-strong bg-paper-raised p-4 text-sm text-ink-muted">
        {label}: no variant selected
      </div>
    );
  }
  const { variant, baseline, pathways, assessments, evidenceUses } = side;
  return (
    <article
      className="space-y-4 border border-line bg-paper-raised p-4"
      data-testid={`comparison-side-${variant.id}`}
    >
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-ink-subtle">{label}</p>
        <h3 className="font-display text-lg font-semibold text-ink">
          <span className="font-mono text-base">{variant.shortCode}</span>
          <span className="ml-2">{variant.label}</span>
        </h3>
        <p className="font-mono text-[11px] text-ink-subtle">{variant.id}</p>
        <p className="text-sm text-ink">{variant.definition}</p>
        <SourceRefList sources={variant.sources} />
      </header>

      <section className="space-y-1">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Baseline
        </h4>
        {baseline ? (
          <>
            <p className="text-sm text-ink">
              <span className="font-mono text-xs">{baseline.id}</span> — {baseline.label}{' '}
              <span className="text-ink-subtle">(Layer {baseline.layer})</span>
            </p>
            <p className="text-xs text-ink-muted">{baseline.description}</p>
            {baseline.datedNote ? (
              <p className="text-xs text-ink-subtle">{baseline.datedNote}</p>
            ) : null}
            <SourceRefList sources={baseline.sources} />
          </>
        ) : (
          <p className="text-xs text-caution">Baseline missing</p>
        )}
      </section>

      <section className="space-y-1">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Conditions
        </h4>
        <ul className="list-disc space-y-1 pl-5 text-xs text-ink">
          {variant.conditions.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        {variant.retainedConstraints.length > 0 ? (
          <>
            <h4 className="pt-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Retained constraints
            </h4>
            <ul className="list-disc space-y-1 pl-5 text-xs text-ink-muted">
              {variant.retainedConstraints.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Pathways (variant-assigned)
        </h4>
        {pathways.length === 0 ? (
          <p className="text-xs text-ink-subtle">
            No pathways assigned specifically to this variant in the published text.
          </p>
        ) : (
          pathways.map((p) => (
            <div key={p.id} className="border border-line bg-paper px-3 py-2 text-xs">
              <p className="font-medium text-ink">
                {p.polarity === 'null_path' ? 'null' : p.polarity} — {p.summary}
              </p>
              <SourceRefList sources={p.sources} />
            </div>
          ))
        )}
      </section>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Outcome assessments (variant-scoped)
        </h4>
        {OUTCOME_STAGES.map((stage) => {
          const rows = assessments.filter((a) => a.outcomeId === stage.id);
          if (rows.length === 0) {
            return (
              <p key={stage.id} className="text-xs text-ink-subtle">
                <span className="font-mono">{stage.id}</span> — no variant-scoped assessment
              </p>
            );
          }
          return rows.map((a) => (
            <div
              key={a.id}
              className="space-y-1 border border-line bg-paper px-3 py-2 text-xs"
              data-testid={`assessment-${a.id}`}
            >
              <p className="font-medium text-ink">
                <span className="font-mono">{a.outcomeId}</span> {getOutcomeStage(a.outcomeId).label}{' '}
                — {a.assessability.replaceAll('_', ' ')} ({a.scope.replaceAll('_', ' ')})
              </p>
              <p className="text-ink">{a.judgment}</p>
              <p className="text-ink-muted">
                <span className="font-medium text-ink">Limitation: </span>
                {a.limitations}
              </p>
              {a.changeEvidenceRefs.length > 0 ? (
                <div>
                  <p className="font-medium text-ink">Evidence that would change this:</p>
                  <SourceRefList sources={a.changeEvidenceRefs} />
                </div>
              ) : null}
              <SourceRefList sources={a.sources} />
            </div>
          ));
        })}
      </section>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Evidence uses
        </h4>
        {evidenceUses.length === 0 ? (
          <p className="text-xs text-ink-subtle">No variant-specific evidence uses recorded.</p>
        ) : (
          evidenceUses.map((use) => {
            const claim = findClaimById(use.claimId);
            return (
              <div key={use.id} className="border border-line bg-paper px-3 py-2 text-xs">
                <p className="text-ink">
                  <Link
                    to={`/claims/${use.claimId}`}
                    className="font-mono text-accent no-underline hover:underline"
                  >
                    {use.claimId}
                  </Link>
                  {' — '}
                  {use.supportsProposition}
                </p>
                {claim ? (
                  <p className="mt-1 text-ink-muted">
                    Status: <span className="font-mono">{claim.status}</span> · Admissibility:{' '}
                    <span className="font-mono">{claim.admissible_in_policy_comparison}</span>
                    {claim.admissibility_conditions.trim()
                      ? ` · Conditions: ${claim.admissibility_conditions}`
                      : ''}
                  </p>
                ) : (
                  <p className="text-caution">Claim not found in atlas</p>
                )}
                <SourceRefList sources={use.sources} />
              </div>
            );
          })
        )}
      </section>

      {sameCase ? (
        <VariantSpecificRequirements
          requirements={gapRequirements}
          variantId={variant.id}
        />
      ) : (
        <CrossCaseSideRequirements
          requirements={gapRequirements}
          variantId={variant.id}
          caseId={variant.caseId}
        />
      )}

      <p className="text-[11px] text-ink-subtle">
        Atlas claims available for lookup: {allClaims.length}. Admissibility is not a truth
        verdict.
      </p>
    </article>
  );
}

export function VariantComparePanel({ comparison }: { comparison: VariantComparison }) {
  const partitioned = partitionComparisonRequirements(
    comparison.a
      ? { id: comparison.a.variant.id, caseId: comparison.a.variant.caseId }
      : null,
    comparison.b
      ? { id: comparison.b.variant.id, caseId: comparison.b.variant.caseId }
      : null,
  );

  return (
    <div className="space-y-4" data-testid="variant-compare-panel">
      {comparison.notices.length > 0 ? (
        <ul className="space-y-1 border border-line bg-neutral-soft px-3 py-2 text-xs text-ink-muted">
          {comparison.notices.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      ) : null}

      <p className="text-xs text-ink-subtle">
        Qualitative comparison only. No policy rankings, composite scores, fabricated probabilities,
        effect sizes, or causal edges inferred from taxonomy/co-tagging/chronology.
        policyWinnerDeclared={String(comparison.policyWinnerDeclared)}.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <SideColumn
          side={comparison.a}
          label="Variant A"
          gapRequirements={partitioned.sideA}
          sameCase={partitioned.sameCase}
        />
        <SideColumn
          side={comparison.b}
          label="Variant B"
          gapRequirements={partitioned.sideB}
          sameCase={partitioned.sameCase}
        />
      </div>

      {comparison.shared ? (
        <section
          className="space-y-3 border border-line bg-paper-raised p-4"
          data-testid="comparison-shared"
        >
          <h3 className="font-display text-lg font-semibold text-ink">
            Shared case-level material ({comparison.shared.caseId})
          </h3>
          <p className="text-xs text-ink-muted">
            Pathways and assessments below are case-wide — not attributed to a single variant unless
            the published text assigns them.
          </p>
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Shared pathways
            </h4>
            {comparison.shared.pathways.map((p) => (
              <div key={p.id} className="border border-line bg-paper px-3 py-2 text-xs">
                <p className="text-ink">
                  {p.polarity === 'null_path' ? 'null' : p.polarity}: {p.summary}
                </p>
                <SourceRefList sources={p.sources} />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Case-wide outcome assessments
            </h4>
            {comparison.shared.assessments.map((a) => (
              <div key={a.id} className="border border-line bg-paper px-3 py-2 text-xs">
                <p className="font-medium text-ink">
                  <span className="font-mono">{a.outcomeId}</span> — {a.judgment}
                </p>
                <p className="text-ink-muted">{a.limitations}</p>
                <SourceRefList sources={a.changeEvidenceRefs} />
                <SourceRefList sources={a.sources} />
              </div>
            ))}
          </div>
          <SharedCaseWideRequirements
            caseId={comparison.shared.caseId}
            requirements={partitioned.sharedCaseWide}
          />
          <Link
            to={`/casebook/${comparison.shared.caseId}#${caseSectionAnchor(6)}`}
            className="text-sm text-accent no-underline hover:underline"
          >
            Open {comparison.shared.caseId} §6 pathways in casebook
          </Link>
        </section>
      ) : null}
    </div>
  );
}
