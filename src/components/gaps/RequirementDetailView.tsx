import { Link } from 'react-router-dom';
import { findClaimById } from '@/data/researchDataset';
import { displayRequirementText } from '@/research/gapsParse';
import {
  OBSERVATION_ROLE_LABELS,
  RESEARCH_REQUIREMENT_TYPE_LABELS,
  type ResearchRequirement,
} from '@/research/gapsSchema';
import { casebookSection9Href } from '@/research/gapsQueries';
import { gapsHref } from '@/research/gapsUrl';
import { mechanismProfileHref } from '@/research/taxonomy';
import { StatusBadge } from '@/components/claims/StatusBadge';
import { AdmissibilityBadge } from '@/components/claims/AdmissibilityBadge';
import { CasebookMarkdown } from '@/components/casebook/CasebookMarkdown';

export function RequirementDetailView({
  requirement,
}: {
  requirement: ResearchRequirement;
}) {
  const sourceDisplay = displayRequirementText(requirement.sourceText);

  return (
    <article className="space-y-6" data-testid={`requirement-detail-${requirement.id}`}>
      <header className="space-y-3 border border-line bg-paper-raised p-5">
        <p className="font-mono text-xs text-ink-subtle">{requirement.id}</p>
        <h1 className="font-display text-2xl font-semibold text-ink">
          {requirement.curatedLabel}
        </h1>
        <p className="text-sm text-ink-muted">
          {requirement.caseId} §9 item {requirement.itemNumber} ·{' '}
          {RESEARCH_REQUIREMENT_TYPE_LABELS[requirement.requirementType]}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            to={casebookSection9Href(requirement.caseId)}
            className="border border-accent/40 bg-accent-soft px-3 py-1.5 text-sm text-accent no-underline"
          >
            Open {requirement.caseId} §9 in casebook
          </Link>
          <Link
            to={gapsHref({ cases: [requirement.caseId] })}
            className="border border-line px-3 py-1.5 text-sm text-ink no-underline hover:bg-neutral-soft"
          >
            All {requirement.caseId} requirements
          </Link>
        </div>
      </header>

      <section
        className="space-y-3 border border-line bg-paper-raised p-5"
        aria-labelledby="original-req-heading"
      >
        <h2 id="original-req-heading" className="text-sm font-semibold text-ink">
          1. Original research requirement
        </h2>
        <p className="text-xs text-ink-subtle">
          Exact published wording from {requirement.sourceFile} (v0.1.1). Distinct from the curated
          label above.
        </p>
        <blockquote className="border-l-2 border-accent bg-accent-soft/40 px-4 py-3 text-sm text-ink">
          <CasebookMarkdown markdown={sourceDisplay} />
        </blockquote>
      </section>

      <section
        className="space-y-2 border border-line bg-paper-raised p-5"
        aria-labelledby="proposition-heading"
      >
        <h2 id="proposition-heading" className="text-sm font-semibold text-ink">
          2. Relevant proposition or policy question
        </h2>
        <p className="text-xs uppercase tracking-wide text-ink-subtle">Curated summary</p>
        <p className="text-sm text-ink">{requirement.relevantProposition}</p>
      </section>

      <section
        className="space-y-3 border border-line bg-paper-raised p-5"
        aria-labelledby="establishes-heading"
      >
        <h2 id="establishes-heading" className="text-sm font-semibold text-ink">
          3. What the available research establishes
        </h2>
        {requirement.referencedClaimIds.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No atlas claims are directly referenced for this requirement.
          </p>
        ) : (
          <ul className="space-y-3">
            {requirement.referencedClaimIds.map((claimId) => {
              const claim = findClaimById(claimId);
              if (!claim) {
                return (
                  <li key={claimId} className="text-sm text-caution">
                    Missing claim {claimId}
                  </li>
                );
              }
              return (
                <li key={claimId} className="border border-line bg-paper px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/claims/${claimId}`}
                      className="font-mono text-xs text-accent no-underline hover:underline"
                    >
                      {claimId}
                    </Link>
                    <StatusBadge status={claim.status} />
                    <AdmissibilityBadge value={claim.admissible_in_policy_comparison} />
                  </div>
                  <p className="mt-1 text-sm text-ink">{claim.exact_claim}</p>
                  <p className="mt-2 text-xs text-ink-muted">
                    <span className="font-medium text-ink">Source establishes: </span>
                    {claim.what_source_establishes}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section
        className="space-y-2 border border-line bg-paper-raised p-5"
        aria-labelledby="uncertain-heading"
      >
        <h2 id="uncertain-heading" className="text-sm font-semibold text-ink">
          4. What remains uncertain
        </h2>
        <p className="text-xs uppercase tracking-wide text-ink-subtle">Curated summary</p>
        <p className="text-sm text-ink">{requirement.remainsUncertain}</p>
      </section>

      <section
        className="space-y-2 border border-line bg-paper-raised p-5"
        aria-labelledby="competing-heading"
      >
        <h2 id="competing-heading" className="text-sm font-semibold text-ink">
          5. Competing explanations
        </h2>
        {requirement.competingExplanations.length === 0 ? (
          <p className="text-sm text-ink-muted">
            This requirement does not engage a competing-mechanism frame in the published §9 item.
          </p>
        ) : (
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink">
            {requirement.competingExplanations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        {requirement.referencedClaimIds.map((claimId) => {
          const claim = findClaimById(claimId);
          if (!claim?.competing_mechanism_or_contrary_evidence.trim()) return null;
          return (
            <p key={`${claimId}-comp`} className="text-xs text-ink-muted">
              <Link to={`/claims/${claimId}`} className="font-mono text-accent">
                {claimId}
              </Link>
              : {claim.competing_mechanism_or_contrary_evidence}
            </p>
          );
        })}
      </section>

      <section
        className="space-y-2 border border-line bg-paper-raised p-5"
        aria-labelledby="alter-heading"
      >
        <h2 id="alter-heading" className="text-sm font-semibold text-ink">
          6. Observation that could alter the assessment
        </h2>
        <p className="text-sm text-ink">{requirement.assessmentChangingNote}</p>
        <p className="text-xs text-ink-muted">
          Role: {OBSERVATION_ROLE_LABELS[requirement.observationRole]}
        </p>
        {requirement.falsificationUnspecified ||
        requirement.observationRole === 'unspecified_by_source' ? (
          <p className="border border-line-strong bg-neutral-soft px-3 py-2 text-sm text-ink">
            The published research does not specify a sufficient empirical falsification test.
          </p>
        ) : null}
        {requirement.referencedClaimIds.map((claimId) => {
          const claim = findClaimById(claimId);
          if (!claim?.observation_that_would_alter_assessment.trim()) return null;
          return (
            <p key={`${claimId}-obs`} className="text-xs text-ink-muted">
              <span className="font-mono">{claimId}</span> atlas field:{' '}
              {claim.observation_that_would_alter_assessment}
            </p>
          );
        })}
      </section>

      <section
        className="space-y-2 border border-line bg-paper-raised p-5"
        aria-labelledby="limits-heading"
      >
        <h2 id="limits-heading" className="text-sm font-semibold text-ink">
          7. Relevant outcome and inference limitations
        </h2>
        <p className="text-sm text-ink">{requirement.qualification}</p>
        {requirement.associatedOutcomeIds.length > 0 ? (
          <p className="text-xs text-ink-muted">
            Associated outcomes (where explicitly supported):{' '}
            {requirement.associatedOutcomeIds.map((o) => (
              <Link
                key={o}
                to={gapsHref({ outcomes: [o] })}
                className="mr-2 font-mono text-accent no-underline hover:underline"
              >
                {o}
              </Link>
            ))}
          </p>
        ) : (
          <p className="text-xs text-ink-subtle">
            No outcome IDs are explicitly associated with this requirement.
          </p>
        )}
        {requirement.referencedClaimIds.map((claimId) => {
          const claim = findClaimById(claimId);
          if (!claim?.limitations_external_validity.trim()) return null;
          return (
            <p key={`${claimId}-lim`} className="text-xs text-ink-muted">
              <span className="font-mono">{claimId}</span> limitations:{' '}
              {claim.limitations_external_validity}
            </p>
          );
        })}
        {requirement.referencedClaimIds.map((claimId) => {
          const claim = findClaimById(claimId);
          if (!claim?.admissibility_conditions.trim()) return null;
          return (
            <p key={`${claimId}-adm`} className="text-xs text-ink-muted">
              <span className="font-mono">{claimId}</span> admissibility conditions:{' '}
              {claim.admissibility_conditions}
            </p>
          );
        })}
      </section>

      <section
        className="space-y-3 border border-line bg-paper-raised p-5"
        aria-labelledby="sources-heading"
      >
        <h2 id="sources-heading" className="text-sm font-semibold text-ink">
          8. Source citations and casebook context
        </h2>
        <ul className="space-y-1 text-sm text-ink-muted">
          <li>
            Casebook:{' '}
            <Link
              to={casebookSection9Href(requirement.caseId)}
              className="text-accent no-underline hover:underline"
            >
              {requirement.caseId} §9
            </Link>
          </li>
          <li>
            Release {requirement.researchRelease} · SHA{' '}
            <span className="font-mono text-xs">
              {requirement.sourceContentSha256.slice(0, 12)}…
            </span>
          </li>
        </ul>
        {requirement.associatedMechanismIds.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {requirement.associatedMechanismIds.map((m) => (
              <Link
                key={m}
                to={mechanismProfileHref(m)}
                className="border border-line px-2 py-1 font-mono text-xs text-accent no-underline hover:bg-neutral-soft"
              >
                {m}
              </Link>
            ))}
          </div>
        ) : null}
        {requirement.comparisonVariantIds && requirement.comparisonVariantIds.length > 0 ? (
          <p className="text-xs text-ink-muted">
            Variant-specific links (published support only):{' '}
            {requirement.comparisonVariantIds.map((v) => (
              <Link
                key={v}
                to={`/comparison?a=${encodeURIComponent(v)}`}
                className="mr-2 font-mono text-accent no-underline hover:underline"
              >
                {v}
              </Link>
            ))}
          </p>
        ) : (
          <p className="text-xs text-ink-subtle">
            Case-wide requirement — not assigned to a single comparison variant unless listed above.
          </p>
        )}
      </section>
    </article>
  );
}
