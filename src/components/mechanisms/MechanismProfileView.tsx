import { Link } from 'react-router-dom';
import type { Claim } from '@/research/schema';
import {
  MECHANISM_CONTEXTUAL_SUBDIVISIONS,
  MECHANISM_FAMILIES,
  getMechanismFamily,
  getMechanismSubmechanism,
  isMechanismFamilyId,
  mechanismProfileHref,
  type MechanismFamilyId,
  type MechanismId,
} from '@/research/taxonomy';
import {
  claimsExplorerHrefForMechanism,
  countExactMechanism,
  countMechanismFamily,
} from '@/research/mechanismQueries';
import {
  getMechanismProfileContent,
  mechanismDefinitionLimitation,
  mechanismDisplayDefinition,
  mechanismDisplayTitle,
  mechanismProvenance,
} from '@/research/mechanismProfiles';
import { explanationsForMechanism } from '@/research/mechanismExplanations';
import { MechanismPathway, RelationChip } from './MechanismPathway';
import { caseSectionAnchor } from '@/research/casebookConstants';
import { OUTCOME_STAGES } from '@/research/taxonomy';
import { claimsExplorerHref } from '@/research/urlFilters';
import { gapsHref } from '@/research/gapsUrl';
import { requirementsForMechanism } from '@/research/gapsQueries';

function SourceLinkList({
  sources,
}: {
  sources: { kind: string; id: string; caseId?: string; section?: number }[];
}) {
  return (
    <>
      {sources.map((source) =>
        source.kind === 'claim' ? (
          <Link key={source.id} to={`/claims/${source.id}`} className="id-link">
            {source.id}
          </Link>
        ) : source.caseId && source.section ? (
          <Link
            key={source.id}
            to={`/casebook/${source.caseId}#${caseSectionAnchor(source.section)}`}
            className="id-link"
          >
            {source.id}
          </Link>
        ) : (
          <span key={source.id} className="mono" style={{ color: 'var(--color-ink-muted)' }}>
            {source.id}
          </span>
        ),
      )}
    </>
  );
}

export function MechanismProfileView({
  mechanismId,
  claims,
}: {
  mechanismId: MechanismId;
  claims: Claim[];
}) {
  const content = getMechanismProfileContent(mechanismId);
  const isFamily = isMechanismFamilyId(mechanismId);
  const exactCount = countExactMechanism(claims, mechanismId);
  const linkedRequirements = requirementsForMechanism(
    mechanismId,
    { familyExpand: isFamily },
  );
  const familyCount = isFamily
    ? countMechanismFamily(claims, mechanismId)
    : null;
  const parentId = isFamily
    ? null
    : getMechanismSubmechanism(mechanismId).parentId;
  const children = isFamily ? getMechanismFamily(mechanismId).childIds : [];
  const explanations = explanationsForMechanism(mechanismId);
  const definitionLimit = mechanismDefinitionLimitation(mechanismId);

  const familyTagSet = new Set<string>(
    isFamily ? [mechanismId, ...children] : [mechanismId],
  );
  const associatedOutcomes = OUTCOME_STAGES.filter((stage) =>
    claims.some(
      (claim) =>
        claim.outcomes.includes(stage.id) &&
        claim.mechanisms.some((m) => familyTagSet.has(m)),
    ),
  );

  const claimsHref = isFamily
    ? claimsExplorerHrefForMechanism(mechanismId)
    : claimsExplorerHref({ mechanisms: [mechanismId] });

  return (
    <article className="profile-layout" data-testid={`mechanism-profile-${mechanismId}`}>
      <header className="profile-header">
        <p className="page-kicker">
          {isFamily ? 'Mechanism family' : 'Exact atlas submechanism'}
        </p>
        <h1 className="page-title" style={{ marginBottom: '0.75rem' }}>
          <span className="family-id">{mechanismId}</span>{' '}
          {mechanismDisplayTitle(mechanismId)}
        </h1>
        <p className="lede" style={{ marginBottom: '0.75rem' }}>
          {mechanismDisplayDefinition(mechanismId)}
        </p>
        {definitionLimit ? <p className="small-note">{definitionLimit}</p> : null}
        <p className="meta-line" style={{ marginTop: '0.5rem' }}>
          Provenance: {mechanismProvenance(mechanismId)}
        </p>
        <div className="action-row" style={{ marginTop: '1rem' }}>
          <Link to={claimsHref} className="btn btn--primary" data-testid="profile-claims-link">
            {isFamily
              ? `View ${familyCount} family-associated claims`
              : `View ${exactCount} exact-tag claims`}
          </Link>
          {isFamily ? (
            <Link to={claimsExplorerHref({ mechanisms: [mechanismId] })} className="btn btn--secondary">
              Exact {mechanismId} only ({exactCount})
            </Link>
          ) : null}
        </div>
      </header>

      <nav aria-label="On this page">
        <ul className="tag-list">
          <li>
            <a className="tag-link" href="#profile-taxonomy">
              Taxonomy
            </a>
          </li>
          <li>
            <a className="tag-link" href="#profile-coverage">
              Coverage
            </a>
          </li>
          <li>
            <a className="tag-link" href="#profile-alternatives">
              Alternative explanations
            </a>
          </li>
          <li>
            <a className="tag-link" href="#profile-outcomes">
              Outcomes
            </a>
          </li>
          <li>
            <a className="tag-link" href="#profile-casebook">
              Casebook passages
            </a>
          </li>
          <li>
            <a className="tag-link" href="#profile-limitations">
              Limitations
            </a>
          </li>
        </ul>
      </nav>

      <section id="profile-taxonomy" className="profile-section" aria-labelledby="profile-taxonomy-h">
        <h2 id="profile-taxonomy-h">Taxonomy relationships</h2>
        <p className="small-note">
          Relation type: <RelationChip relation="taxonomy" /> Membership is registry-based, not
          substring matching.
        </p>
        {parentId ? (
          <p className="prose-block">
            Parent family:{' '}
            <Link to={mechanismProfileHref(parentId)} className="id-link">
              {parentId}
            </Link>{' '}
            — {getMechanismFamily(parentId).label}
          </p>
        ) : (
          <div>
            <p className="eyebrow" style={{ marginBottom: '0.35rem' }}>
              Registered submechanisms
            </p>
            <ul className="sub-list">
              {children.map((childId) => (
                <li key={childId}>
                  <Link to={mechanismProfileHref(childId)} className="sub-id">
                    {childId}
                  </Link>
                  <span>{getMechanismSubmechanism(childId).label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {!isFamily && parentId ? (
          <div>
            <p className="eyebrow" style={{ marginBottom: '0.35rem' }}>
              Siblings
            </p>
            <ul className="tag-list">
              {getMechanismFamily(parentId)
                .childIds.filter((id) => id !== mechanismId)
                .map((id) => (
                  <li key={id}>
                    <Link to={mechanismProfileHref(id)} className="tag-link">
                      <span className="mono">{id}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section id="profile-coverage" className="profile-section" aria-labelledby="profile-coverage-h">
        <h2 id="profile-coverage-h">Research coverage</h2>
        <dl className="stat-row">
          <div>
            <dt>Exact-tag claims</dt>
            <dd data-testid="profile-exact-count">{exactCount}</dd>
          </div>
          {familyCount !== null ? (
            <div>
              <dt>Family-expanded unique claims</dt>
              <dd data-testid="profile-family-count">{familyCount}</dd>
            </div>
          ) : (
            <div>
              <dt>Parent family expansion</dt>
              <dd style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--c-fs-label)', fontWeight: 400 }}>
                Exact tag only — use{' '}
                <Link to={mechanismProfileHref(parentId!)} className="id-link">
                  {parentId}
                </Link>{' '}
                for family-expanded coverage.
              </dd>
            </div>
          )}
        </dl>
        <p className="small-note">
          Coverage is not causal importance. Exact and family figures are distinct. A family can
          contain legal facts, descriptive findings, hypotheses, assumptions, and limitations — do
          not treat all associated evidence as proof of the mechanism.
        </p>
      </section>

      {mechanismId === 'M5a' || mechanismId === 'M5' ? (
        <section
          id="contextual-subdivisions"
          className="panel panel--dashed"
          style={{ scrollMarginTop: '1.5rem' }}
          data-testid="contextual-subdivisions"
          aria-labelledby="contextual-subdivisions-h"
        >
          <h2 id="contextual-subdivisions-h" className="panel-title">
            Contextual subdivisions (not atlas tags)
          </h2>
          <p className="small-note" style={{ marginBottom: '0.75rem' }}>
            Case 2 refers to M5a-1 and M5a-2. These are conceptual subdivisions of M5a, not exact
            atlas <span className="mono">mechanism_ids</span> values. They do not receive
            fabricated claim counts.
          </p>
          <ul className="link-rows">
            {MECHANISM_CONTEXTUAL_SUBDIVISIONS.map((item) => (
              <li key={item.id}>
                <span className="mono link-rows-id">{item.id}</span>
                <span>
                  {item.label}. {item.note}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section
        id="profile-alternatives"
        className="profile-section"
        aria-labelledby="profile-alternatives-h"
      >
        <h2 id="profile-alternatives-h">Alternative explanations and curated notes</h2>
        {content.sparseExplanation ? (
          <p className="notice" style={{ maxWidth: 'var(--c-prose)' }}>
            Adequate standalone casebook prose for this tag is limited. Taxonomy, linked evidence,
            and the limitation below are presented rather than inventing a detailed theory.
          </p>
        ) : null}
        <ul className="relation-list">
          {content.alternativeExplanations.map((item, index) => (
            <li key={index}>
              <p className="prose-block">{item.text}</p>
              <div className="action-row" style={{ marginTop: '0.4rem', gap: '0.25rem 0.75rem' }}>
                <RelationChip relation={item.relation} />
                <SourceLinkList sources={item.sources} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="profile-outcomes" className="profile-section" aria-labelledby="profile-outcomes-h">
        <h2 id="profile-outcomes-h">Outcome associations</h2>
        <p className="small-note">
          Association with an outcome tag is not empirical measurement of that outcome. O1–O6 is
          not a mandatory causal chain.
        </p>
        {content.outcomeNotes.map((note, index) => (
          <p key={index} className="prose-block">
            {note.text}{' '}
            {note.sources.map((source) => (
              <Link
                key={source.id}
                to={
                  source.kind === 'claim'
                    ? `/claims/${source.id}`
                    : source.caseId && source.section
                      ? `/casebook/${source.caseId}#${caseSectionAnchor(source.section)}`
                      : '#'
                }
                className="id-link"
                style={{ marginLeft: '0.25rem' }}
              >
                {source.id}
              </Link>
            ))}
          </p>
        ))}
        <ul className="tag-list">
          {associatedOutcomes.map((outcome) => (
            <li key={outcome.id}>
              <Link
                to={
                  isFamily
                    ? claimsExplorerHref({
                        mechanismFamilies: [mechanismId],
                        outcomes: [outcome.id],
                      })
                    : claimsExplorerHref({
                        mechanisms: [mechanismId],
                        outcomes: [outcome.id],
                      })
                }
                className="tag-link"
              >
                <span className="mono">{outcome.id}</span> {outcome.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="profile-casebook" className="profile-section" aria-labelledby="profile-casebook-h">
        <h2 id="profile-casebook-h">Relevant casebook passages</h2>
        {content.casebookPassages.length === 0 ? (
          <p className="small-note">
            No dedicated casebook mechanism-section row for this exact tag; see parent family and
            linked claims.
          </p>
        ) : (
          <ul className="relation-list">
            {content.casebookPassages.map((passage) => (
              <li key={`${passage.caseId}-${passage.section}`}>
                <Link to={`/casebook/${passage.caseId}#${caseSectionAnchor(passage.section)}`}>
                  {passage.caseId} §{passage.section} — {passage.label}
                </Link>
                <p className="small-note">{passage.note}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {explanations.length > 0 ? (
        <section
          id="profile-explanations"
          className="profile-section"
          aria-labelledby="profile-explanations-h"
        >
          <h2 id="profile-explanations-h">Conditional explanations</h2>
          <div className="stack">
            {explanations.map((item) => (
              <MechanismPathway key={item.id} explanation={item} />
            ))}
          </div>
        </section>
      ) : null}

      <section
        id="profile-limitations"
        className="profile-section"
        aria-labelledby="profile-limitations-h"
      >
        <h2 id="profile-limitations-h">Material evidence limitations</h2>
        <ul className="bullets">
          {content.limitations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {linkedRequirements.length > 0 ? (
          <div className="panel panel--muted" data-testid="mechanism-gaps-links">
            <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>
              Related research requirements
            </p>
            <ul className="link-rows">
              {linkedRequirements.map((req) => (
                <li key={req.id}>
                  <Link to={`/gaps/${req.id}`} className="id-link link-rows-id">
                    {req.id}
                  </Link>
                  <span>{req.curatedLabel}</span>
                </li>
              ))}
            </ul>
            <p className="small-note" style={{ marginTop: '0.5rem' }}>
              <Link
                to={
                  isFamily
                    ? gapsHref({
                        mechanismFamilies: [mechanismId as MechanismFamilyId],
                      })
                    : gapsHref({ mechanisms: [mechanismId] })
                }
              >
                Filter Research gaps by {mechanismId}
              </Link>
            </p>
          </div>
        ) : (
          <p className="small-note small-note--subtle">
            No curated §9 requirement associations for this tag. Associations are source-grounded,
            not inferred from co-tagging alone.
          </p>
        )}
      </section>

      <nav aria-label="Mechanism taxonomy" className="taxonomy-nav">
        <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>
          Mechanism families
        </p>
        <ul className="tag-list">
          {MECHANISM_FAMILIES.map((family) => {
            const current = family.id === mechanismId || family.id === parentId;
            return (
              <li key={family.id}>
                <Link
                  to={mechanismProfileHref(family.id)}
                  className="tag-link"
                  aria-current={current ? 'true' : undefined}
                >
                  <span className="mono">{family.id}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </article>
  );
}
