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

const SECTION_NAV = [
  ['original-req', '1. Original requirement'],
  ['proposition', '2. Proposition'],
  ['establishes', '3. What is established'],
  ['uncertain', '4. What is uncertain'],
  ['competing', '5. Competing explanations'],
  ['alter', '6. Assessment-changing observation'],
  ['limits', '7. Limitations'],
  ['sources', '8. Sources and context'],
] as const;

export function RequirementDetailView({
  requirement,
}: {
  requirement: ResearchRequirement;
}) {
  const sourceDisplay = displayRequirementText(requirement.sourceText);

  return (
    <article className="profile-layout" data-testid={`requirement-detail-${requirement.id}`}>
      <header className="profile-header">
        <p className="page-kicker">
          Research requirement · <span className="mono">{requirement.id}</span>
        </p>
        <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>
          {requirement.curatedLabel}
        </h1>
        <p className="lede" style={{ marginBottom: '1rem' }}>
          {requirement.caseId} §9 item {requirement.itemNumber} ·{' '}
          {RESEARCH_REQUIREMENT_TYPE_LABELS[requirement.requirementType]}
        </p>
        <div className="action-row">
          <Link to={casebookSection9Href(requirement.caseId)} className="btn btn--secondary">
            Open {requirement.caseId} §9 in casebook
          </Link>
          <Link to={gapsHref({ cases: [requirement.caseId] })} className="btn btn--ghost">
            All {requirement.caseId} requirements
          </Link>
        </div>
      </header>

      <nav aria-label="On this page">
        <ul className="tag-list">
          {SECTION_NAV.map(([id, label]) => (
            <li key={id}>
              <a className="tag-link" href={`#${id}-section`}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section
        id="original-req-section"
        className="req-section"
        aria-labelledby="original-req-heading"
      >
        <h2 id="original-req-heading">1. Original research requirement</h2>
        <p className="small-note">
          Exact published wording from {requirement.sourceFile} (v0.1.1). Distinct from the curated
          label above.
        </p>
        <blockquote className="req-source-quote">
          <CasebookMarkdown markdown={sourceDisplay} />
        </blockquote>
      </section>

      <section
        id="proposition-section"
        className="req-section"
        aria-labelledby="proposition-heading"
      >
        <h2 id="proposition-heading">2. Relevant proposition or policy question</h2>
        <p className="eyebrow">Curated summary</p>
        <p className="prose-block">{requirement.relevantProposition}</p>
      </section>

      <section
        id="establishes-section"
        className="req-section"
        aria-labelledby="establishes-heading"
      >
        <h2 id="establishes-heading">3. What the available research establishes</h2>
        {requirement.referencedClaimIds.length === 0 ? (
          <p className="small-note">
            No atlas claims are directly referenced for this requirement.
          </p>
        ) : (
          <ul className="stack" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {requirement.referencedClaimIds.map((claimId) => {
              const claim = findClaimById(claimId);
              if (!claim) {
                return (
                  <li key={claimId} className="notice notice--caution">
                    Missing claim {claimId}
                  </li>
                );
              }
              return (
                <li key={claimId} className="req-claim">
                  <div className="req-claim-head">
                    <Link to={`/claims/${claimId}`} className="id-link">
                      {claimId}
                    </Link>
                    <StatusBadge status={claim.status} />
                    <AdmissibilityBadge value={claim.admissible_in_policy_comparison} />
                  </div>
                  <p>{claim.exact_claim}</p>
                  <p className="small-note" style={{ marginTop: '0.5rem' }}>
                    <strong style={{ color: 'var(--color-ink)' }}>Source establishes: </strong>
                    {claim.what_source_establishes}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section id="uncertain-section" className="req-section" aria-labelledby="uncertain-heading">
        <h2 id="uncertain-heading">4. What remains uncertain</h2>
        <p className="eyebrow">Curated summary</p>
        <p className="prose-block">{requirement.remainsUncertain}</p>
      </section>

      <section id="competing-section" className="req-section" aria-labelledby="competing-heading">
        <h2 id="competing-heading">5. Competing explanations</h2>
        {requirement.competingExplanations.length === 0 ? (
          <p className="small-note">
            This requirement does not engage a competing-mechanism frame in the published §9 item.
          </p>
        ) : (
          <ul className="bullets" style={{ color: 'var(--color-ink)' }}>
            {requirement.competingExplanations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        {requirement.referencedClaimIds.map((claimId) => {
          const claim = findClaimById(claimId);
          if (!claim?.competing_mechanism_or_contrary_evidence.trim()) return null;
          return (
            <p key={`${claimId}-comp`} className="req-atlas-note">
              <Link to={`/claims/${claimId}`} className="id-link">
                {claimId}
              </Link>
              : {claim.competing_mechanism_or_contrary_evidence}
            </p>
          );
        })}
      </section>

      <section id="alter-section" className="req-section" aria-labelledby="alter-heading">
        <h2 id="alter-heading">6. Observation that could alter the assessment</h2>
        <p className="prose-block">{requirement.assessmentChangingNote}</p>
        <p className="small-note">
          Role: <strong>{OBSERVATION_ROLE_LABELS[requirement.observationRole]}</strong>
        </p>
        {requirement.falsificationUnspecified ||
        requirement.observationRole === 'unspecified_by_source' ? (
          <p className="notice" style={{ maxWidth: 'var(--c-prose)' }}>
            The published research does not specify a sufficient empirical falsification test.
          </p>
        ) : null}
        {requirement.referencedClaimIds.map((claimId) => {
          const claim = findClaimById(claimId);
          if (!claim?.observation_that_would_alter_assessment.trim()) return null;
          return (
            <p key={`${claimId}-obs`} className="req-atlas-note">
              <span className="mono">{claimId}</span> atlas field:{' '}
              {claim.observation_that_would_alter_assessment}
            </p>
          );
        })}
      </section>

      <section id="limits-section" className="req-section" aria-labelledby="limits-heading">
        <h2 id="limits-heading">7. Relevant outcome and inference limitations</h2>
        <p className="prose-block">{requirement.qualification}</p>
        {requirement.associatedOutcomeIds.length > 0 ? (
          <div>
            <p className="small-note" style={{ marginBottom: '0.35rem' }}>
              Associated outcomes (where explicitly supported):
            </p>
            <ul className="tag-list">
              {requirement.associatedOutcomeIds.map((o) => (
                <li key={o}>
                  <Link to={gapsHref({ outcomes: [o] })} className="tag-link">
                    <span className="mono">{o}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="small-note small-note--subtle">
            No outcome IDs are explicitly associated with this requirement.
          </p>
        )}
        {requirement.referencedClaimIds.map((claimId) => {
          const claim = findClaimById(claimId);
          if (!claim?.limitations_external_validity.trim()) return null;
          return (
            <p key={`${claimId}-lim`} className="req-atlas-note">
              <span className="mono">{claimId}</span> limitations:{' '}
              {claim.limitations_external_validity}
            </p>
          );
        })}
        {requirement.referencedClaimIds.map((claimId) => {
          const claim = findClaimById(claimId);
          if (!claim?.admissibility_conditions.trim()) return null;
          return (
            <p key={`${claimId}-adm`} className="req-atlas-note">
              <span className="mono">{claimId}</span> admissibility conditions:{' '}
              {claim.admissibility_conditions}
            </p>
          );
        })}
      </section>

      <section id="sources-section" className="req-section" aria-labelledby="sources-heading">
        <h2 id="sources-heading">8. Source citations and casebook context</h2>
        <ul className="link-rows">
          <li>
            <span>
              Casebook:{' '}
              <Link to={casebookSection9Href(requirement.caseId)}>{requirement.caseId} §9</Link>
            </span>
          </li>
          <li>
            <span>
              Release {requirement.researchRelease} · SHA{' '}
              <span className="mono">{requirement.sourceContentSha256.slice(0, 12)}…</span>
            </span>
          </li>
        </ul>
        {requirement.associatedMechanismIds.length > 0 ? (
          <div>
            <p className="eyebrow" style={{ marginBottom: '0.35rem' }}>
              Associated mechanisms
            </p>
            <ul className="tag-list">
              {requirement.associatedMechanismIds.map((m) => (
                <li key={m}>
                  <Link to={mechanismProfileHref(m)} className="tag-link">
                    <span className="mono">{m}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {requirement.comparisonVariantIds && requirement.comparisonVariantIds.length > 0 ? (
          <div>
            <p className="small-note" style={{ marginBottom: '0.35rem' }}>
              Variant-specific links (published support only):
            </p>
            <ul className="tag-list">
              {requirement.comparisonVariantIds.map((v) => (
                <li key={v}>
                  <Link to={`/comparison?a=${encodeURIComponent(v)}`} className="tag-link">
                    <span className="mono">{v}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="small-note small-note--subtle">
            Case-wide requirement — not assigned to a single comparison variant unless listed
            above.
          </p>
        )}
      </section>
    </article>
  );
}
