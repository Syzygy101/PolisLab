import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type {
  VariantComparison,
  VariantComparisonSide,
} from '@/research/comparisonQueries';
import type {
  ComparisonPathway,
  EvidenceUse,
  OutcomeAssessment,
} from '@/research/comparisonSchema';
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

const PATHWAY_GROUPS = [
  { key: 'favourable', title: 'Favourable pathways' },
  { key: 'unfavourable', title: 'Unfavourable pathways' },
  { key: 'null_path', title: 'Null pathways' },
] as const;

const PATHWAY_ROLE_NOTE =
  'Pathway references (may be limiting evidence, not affirmative proof):';

function sideTitle(side: VariantComparisonSide | null, fallback: string): string {
  return side ? `${side.variant.shortCode} · ${side.variant.label}` : fallback;
}

function EmptySide() {
  return <p className="meta-line text-xs text-ink-subtle">No policy selected for this side.</p>;
}

/** One analytical section: label + A side + B side (stacked on mobile via `.band`). */
function Band({
  label,
  labelId,
  aTitle,
  bTitle,
  a,
  b,
  testId,
  aTestId,
  bTestId,
  className = '',
  as: Tag = 'div',
}: {
  label: string;
  labelId: string;
  aTitle: string;
  bTitle: string;
  a: ReactNode;
  b: ReactNode;
  testId?: string;
  aTestId?: string;
  bTestId?: string;
  className?: string;
  as?: 'div' | 'section';
}) {
  return (
    <Tag
      className={`band ${className}`.trim()}
      aria-labelledby={labelId}
      data-testid={testId}
    >
      <h2 className="band-label" id={labelId} style={{ margin: 0 }}>
        {label}
      </h2>
      <div className="band-side" data-testid={aTestId}>
        <h3 className="band-policy">{aTitle}</h3>
        {a}
      </div>
      <div className="band-side" data-testid={bTestId}>
        <h3 className="band-policy">{bTitle}</h3>
        {b}
      </div>
    </Tag>
  );
}

/** Single-column band for material that applies to both policies (rendered once). */
function SharedBand({
  label,
  labelId,
  testId,
  children,
}: {
  label: string;
  labelId: string;
  testId?: string;
  children: ReactNode;
}) {
  return (
    <section
      className="band band--shared"
      aria-labelledby={labelId}
      data-testid={testId}
    >
      <h2 className="band-label" id={labelId} style={{ margin: 0 }}>
        {label}
      </h2>
      <div className="band-side space-y-3">{children}</div>
    </section>
  );
}

function BaselineBlock({ side }: { side: VariantComparisonSide | null }) {
  if (!side) return <EmptySide />;
  const { baseline } = side;
  if (!baseline) return <p className="text-xs text-caution">Baseline missing</p>;
  return (
    <div className="space-y-1">
      <p>
        <span className="font-mono text-xs">{baseline.id}</span> — {baseline.label}{' '}
        <span className="text-ink-subtle">(Layer {baseline.layer})</span>
      </p>
      <p className="text-ink-muted">{baseline.description}</p>
      {baseline.datedNote ? <p className="meta-line">{baseline.datedNote}</p> : null}
      <SourceRefList sources={baseline.sources} />
    </div>
  );
}

function PathwayItems({
  pathways,
  emptyLabel,
}: {
  pathways: ComparisonPathway[];
  emptyLabel: string;
}) {
  if (pathways.length === 0) {
    return <p className="meta-line text-xs text-ink-subtle">{emptyLabel}</p>;
  }
  return (
    <div className="space-y-2">
      {pathways.map((p) => (
        <div key={p.id} className="border border-line bg-paper px-3 py-2">
          <p>
            <span className="font-mono text-xs">{p.id}</span> — {p.summary}
          </p>
          <SourceRefList sources={p.sources} roleNote={PATHWAY_ROLE_NOTE} />
        </div>
      ))}
    </div>
  );
}

function AssessmentItem({ a }: { a: OutcomeAssessment }) {
  const stage = getOutcomeStage(a.outcomeId);
  return (
    <div
      className="space-y-1 border border-line bg-paper px-3 py-2"
      data-testid={`assessment-${a.id}`}
    >
      <p className="font-medium">
        <span className="font-mono">{a.outcomeId}</span>
        {stage ? ` ${stage.label}` : ''} — {a.assessability.replaceAll('_', ' ')} (
        {a.scope.replaceAll('_', ' ')})
      </p>
      <p>{a.judgment}</p>
      <p className="notice" style={{ margin: '0.35rem 0' }}>
        <strong>Limitations.</strong> {a.limitations}
      </p>
      {a.changeEvidenceRefs.length > 0 ? (
        <div>
          <p className="font-medium">Evidence that would change this:</p>
          <SourceRefList sources={a.changeEvidenceRefs} />
        </div>
      ) : null}
      <SourceRefList sources={a.sources} />
    </div>
  );
}

function EvidenceUseItem({ use }: { use: EvidenceUse }) {
  const claim = findClaimById(use.claimId);
  return (
    <div className="border border-line bg-paper px-3 py-2">
      <p>
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
}

function EvidenceItems({
  uses,
  emptyLabel,
}: {
  uses: EvidenceUse[];
  emptyLabel: string;
}) {
  if (uses.length === 0) {
    return <p className="meta-line text-xs text-ink-subtle">{emptyLabel}</p>;
  }
  return (
    <div className="space-y-2">
      {uses.map((use) => (
        <EvidenceUseItem key={use.id} use={use} />
      ))}
    </div>
  );
}

function SideRequirements({
  side,
  requirements,
  sameCase,
}: {
  side: VariantComparisonSide | null;
  requirements: ResearchRequirement[];
  sameCase: boolean;
}) {
  if (!side) return <EmptySide />;
  return sameCase ? (
    <VariantSpecificRequirements
      requirements={requirements}
      variantId={side.variant.id}
    />
  ) : (
    <CrossCaseSideRequirements
      requirements={requirements}
      variantId={side.variant.id}
      caseId={side.variant.caseId}
    />
  );
}

function StringList({
  items,
  muted,
  emptyLabel,
}: {
  items: readonly string[];
  muted?: boolean;
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <p className="meta-line text-xs text-ink-subtle">{emptyLabel}</p>;
  }
  return (
    <ul className={`list-disc space-y-1 pl-5 ${muted ? 'text-ink-muted' : ''}`}>
      {items.map((c) => (
        <li key={c}>{c}</li>
      ))}
    </ul>
  );
}

export function VariantComparePanel({ comparison }: { comparison: VariantComparison }) {
  const { a, b, shared } = comparison;
  const partitioned = partitionComparisonRequirements(
    a ? { id: a.variant.id, caseId: a.variant.caseId } : null,
    b ? { id: b.variant.id, caseId: b.variant.caseId } : null,
  );
  const aTitle = sideTitle(a, 'Policy A');
  const bTitle = sideTitle(b, 'Policy B');

  return (
    <div data-testid="variant-compare-panel">
      <div data-testid="comparison-bands">
        {comparison.notices.length > 0 ? (
          <ul className="notice notice--caution space-y-1" data-testid="comparison-notices">
            {comparison.notices.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        ) : null}

        <p className="meta-line py-2 text-xs text-ink-subtle">
          Qualitative comparison only. No policy rankings, numerical effects or causal conclusions
          follow from these pathways.
        </p>

        {/* Definitions */}
        <Band
          label="Definition"
          labelId="band-definition"
          aTitle={aTitle}
          bTitle={bTitle}
          aTestId={a ? `comparison-side-${a.variant.id}` : undefined}
          bTestId={b ? `comparison-side-${b.variant.id}` : undefined}
          a={
            a ? (
              <div className="space-y-1">
                <p className="font-mono text-[11px] text-ink-subtle">{a.variant.id}</p>
                <p>{a.variant.definition}</p>
                <SourceRefList sources={a.variant.sources} />
              </div>
            ) : (
              <EmptySide />
            )
          }
          b={
            b ? (
              <div className="space-y-1">
                <p className="font-mono text-[11px] text-ink-subtle">{b.variant.id}</p>
                <p>{b.variant.definition}</p>
                <SourceRefList sources={b.variant.sources} />
              </div>
            ) : (
              <EmptySide />
            )
          }
        />

        {/* Institutional baselines */}
        {comparison.sameBaseline && a?.baseline ? (
          <SharedBand
            label="Shared baseline"
            labelId="band-baseline-shared"
            testId="comparison-shared-baseline"
          >
            <BaselineBlock side={a} />
          </SharedBand>
        ) : (
          <Band
            label="Baseline"
            labelId="band-baseline"
            aTitle={aTitle}
            bTitle={bTitle}
            a={<BaselineBlock side={a} />}
            b={<BaselineBlock side={b} />}
          />
        )}

        {/* Conditions */}
        <Band
          label="Conditions"
          labelId="band-conditions"
          aTitle={aTitle}
          bTitle={bTitle}
          a={
            a ? (
              <StringList items={a.variant.conditions} emptyLabel="No conditions recorded." />
            ) : (
              <EmptySide />
            )
          }
          b={
            b ? (
              <StringList items={b.variant.conditions} emptyLabel="No conditions recorded." />
            ) : (
              <EmptySide />
            )
          }
        />

        {/* Retained constraints */}
        <Band
          label="Retained constraints"
          labelId="band-constraints"
          aTitle={aTitle}
          bTitle={bTitle}
          a={
            a ? (
              <StringList
                items={a.variant.retainedConstraints}
                muted
                emptyLabel="No retained constraints recorded."
              />
            ) : (
              <EmptySide />
            )
          }
          b={
            b ? (
              <StringList
                items={b.variant.retainedConstraints}
                muted
                emptyLabel="No retained constraints recorded."
              />
            ) : (
              <EmptySide />
            )
          }
        />

        {/* Pathways — one aligned row per polarity */}
        <section aria-label="Variant pathways" data-testid="pathways-band">
          <p className="meta-line py-2 text-[11px] text-ink-subtle">
            Casebook §6 lists plausible favourable, unfavourable and null pathways — not
            established effects, probabilities, or welfare rankings. Linked claims may limit
            inference rather than prove the pathway.
          </p>
          {PATHWAY_GROUPS.map(({ key, title }) => (
            <Band
              key={key}
              as="section"
              className="pathway-pair"
              label={title}
              labelId={`pathway-${key}`}
              testId={`pathways-${key}`}
              aTitle={aTitle}
              bTitle={bTitle}
              a={
                a ? (
                  <PathwayItems
                    pathways={a.pathways.filter((p) => p.polarity === key)}
                    emptyLabel="None assigned specifically to this variant in the published text."
                  />
                ) : (
                  <EmptySide />
                )
              }
              b={
                b ? (
                  <PathwayItems
                    pathways={b.pathways.filter((p) => p.polarity === key)}
                    emptyLabel="None assigned specifically to this variant in the published text."
                  />
                ) : (
                  <EmptySide />
                )
              }
            />
          ))}
        </section>

        {/* Outcome assessments — one aligned row per outcome stage */}
        <section aria-label="Variant outcome assessments" data-testid="outcomes-band">
          {OUTCOME_STAGES.map((stage) => {
            const rowsFor = (side: VariantComparisonSide | null) => {
              if (!side) return <EmptySide />;
              const rows = side.assessments.filter((x) => x.outcomeId === stage.id);
              if (rows.length === 0) {
                return (
                  <p className="meta-line text-xs text-ink-subtle">
                    <span className="font-mono">{stage.id}</span> — no variant-scoped assessment
                  </p>
                );
              }
              return (
                <div className="space-y-2">
                  {rows.map((x) => (
                    <AssessmentItem key={x.id} a={x} />
                  ))}
                </div>
              );
            };
            return (
              <Band
                key={stage.id}
                as="section"
                label={`Outcome ${stage.id}`}
                labelId={`outcome-${stage.id}`}
                testId={`outcome-band-${stage.id}`}
                aTitle={aTitle}
                bTitle={bTitle}
                a={rowsFor(a)}
                b={rowsFor(b)}
              />
            );
          })}
        </section>

        {/* Supporting evidence */}
        <Band
          label="Supporting evidence"
          labelId="band-evidence"
          testId="evidence-band"
          aTitle={aTitle}
          bTitle={bTitle}
          a={
            a ? (
              <EvidenceItems
                uses={a.evidenceUses}
                emptyLabel="No variant-specific evidence uses recorded."
              />
            ) : (
              <EmptySide />
            )
          }
          b={
            b ? (
              <EvidenceItems
                uses={b.evidenceUses}
                emptyLabel="No variant-specific evidence uses recorded."
              />
            ) : (
              <EmptySide />
            )
          }
        />

        {/* Research requirements (variant-specific / per-side) */}
        <Band
          label="Research requirements"
          labelId="band-requirements"
          testId="requirements-band"
          aTitle={aTitle}
          bTitle={bTitle}
          a={
            <SideRequirements
              side={a}
              requirements={partitioned.sideA}
              sameCase={partitioned.sameCase}
            />
          }
          b={
            <SideRequirements
              side={b}
              requirements={partitioned.sideB}
              sameCase={partitioned.sameCase}
            />
          }
        />

        {/* Shared case-level material: rendered once */}
        {shared ? (
          <section
            aria-label={`Shared case-level material (${shared.caseId})`}
            data-testid="comparison-shared"
          >
            <p className="meta-line py-2 text-xs text-ink-muted">
              Shared case-level material ({shared.caseId}) — shown once. Plausible pathways and
              assessments below are case-wide, not attributed to a single variant unless the
              published text assigns them. They are not established effects.
            </p>

            <SharedBand label="Shared plausible pathways" labelId="shared-pathways">
              <p className="text-[11px] text-ink-subtle">
                From casebook §6 “Plausible favourable, unfavourable and null pathways.” Linked
                claims may be absence-of-finding or hypothesis rows that limit inference.
              </p>
              {PATHWAY_GROUPS.map(({ key, title }) => {
                const items = shared.pathways.filter((p) => p.polarity === key);
                return (
                  <section key={key} aria-label={`Case-wide ${title.toLowerCase()}`}>
                    <h3>{title}</h3>
                    <PathwayItems
                      pathways={items}
                      emptyLabel="None recorded at case level."
                    />
                  </section>
                );
              })}
            </SharedBand>

            <SharedBand
              label="Case-wide outcome assessments"
              labelId="shared-assessments"
              testId="case-wide-outcomes"
            >
              {shared.assessments.length === 0 ? (
                <p className="meta-line text-xs text-ink-subtle">
                  No case-wide assessments recorded.
                </p>
              ) : (
                <div className="space-y-2">
                  {shared.assessments.map((x) => (
                    <AssessmentItem key={x.id} a={x} />
                  ))}
                </div>
              )}
            </SharedBand>

            {shared.evidenceUses.length > 0 ? (
              <SharedBand
                label="Case-level evidence"
                labelId="shared-evidence"
                testId="case-level-evidence"
              >
                <EvidenceItems uses={shared.evidenceUses} emptyLabel="" />
              </SharedBand>
            ) : null}

            <SharedBand label="Shared research requirements" labelId="shared-requirements">
              <SharedCaseWideRequirements
                caseId={shared.caseId}
                requirements={partitioned.sharedCaseWide}
              />
              <Link
                to={`/casebook/${shared.caseId}#${caseSectionAnchor(6)}`}
                className="text-sm text-accent no-underline hover:underline"
              >
                Open {shared.caseId} §6 pathways in casebook
              </Link>
            </SharedBand>
          </section>
        ) : null}

        <p className="meta-line py-3 text-[11px] text-ink-subtle">
          Atlas claims available for lookup: {allClaims.length}. Admissibility is not a truth
          verdict.
        </p>
      </div>
    </div>
  );
}
