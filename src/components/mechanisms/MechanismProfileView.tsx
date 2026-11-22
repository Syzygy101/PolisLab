import { Link } from 'react-router-dom';
import type { Claim } from '@/research/schema';
import {
  MECHANISM_CONTEXTUAL_SUBDIVISIONS,
  MECHANISM_FAMILIES,
  getMechanismFamily,
  getMechanismSubmechanism,
  isMechanismFamilyId,
  mechanismProfileHref,
  type MechanismId,
} from '@/research/taxonomy';
import {
  claimsExplorerHrefForMechanism,
  countExactMechanism,
  countMechanismFamily,
} from '@/research/mechanismQueries';
import {
  RELATION_TYPE_LABELS,
  getMechanismProfileContent,
  mechanismDefinitionLimitation,
  mechanismDisplayDefinition,
  mechanismDisplayTitle,
  mechanismProvenance,
} from '@/research/mechanismProfiles';
import { explanationsForMechanism } from '@/research/mechanismExplanations';
import { MechanismPathway } from './MechanismPathway';
import { caseSectionAnchor } from '@/research/casebookConstants';
import { OUTCOME_STAGES } from '@/research/taxonomy';
import { claimsExplorerHref } from '@/research/urlFilters';

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

  return (
    <article className="space-y-6" data-testid={`mechanism-profile-${mechanismId}`}>
      <header className="space-y-3 border border-line bg-paper-raised p-5">
        <p className="text-xs uppercase tracking-wide text-ink-subtle">
          {isFamily ? 'Mechanism family' : 'Exact atlas submechanism'}
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink">
          <span className="font-mono text-2xl">{mechanismId}</span>
          <span className="ml-3">{mechanismDisplayTitle(mechanismId)}</span>
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-ink">
          {mechanismDisplayDefinition(mechanismId)}
        </p>
        {definitionLimit ? (
          <p className="max-w-3xl text-xs text-ink-muted">{definitionLimit}</p>
        ) : null}
        <p className="text-xs text-ink-subtle">
          Provenance: {mechanismProvenance(mechanismId)}
        </p>
      </header>

      <section className="space-y-3 border border-line bg-paper-raised p-5">
        <h2 className="text-sm font-semibold text-ink">Taxonomy relationships</h2>
        <p className="text-xs text-ink-subtle">
          Relation type: {RELATION_TYPE_LABELS.taxonomy}. Membership is registry-based, not
          substring matching.
        </p>
        {parentId ? (
          <p className="text-sm text-ink">
            Parent family:{' '}
            <Link
              to={mechanismProfileHref(parentId)}
              className="font-mono text-accent no-underline hover:underline"
            >
              {parentId}
            </Link>{' '}
            — {getMechanismFamily(parentId).label}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-ink-muted">Registered submechanisms:</span>
            {children.map((childId) => (
              <Link
                key={childId}
                to={mechanismProfileHref(childId)}
                className="font-mono text-sm text-accent no-underline hover:underline"
              >
                {childId}
              </Link>
            ))}
          </div>
        )}
        {!isFamily && parentId ? (
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="text-ink-muted">Siblings:</span>
            {getMechanismFamily(parentId)
              .childIds.filter((id) => id !== mechanismId)
              .map((id) => (
                <Link
                  key={id}
                  to={mechanismProfileHref(id)}
                  className="font-mono text-accent no-underline hover:underline"
                >
                  {id}
                </Link>
              ))}
          </div>
        ) : null}
      </section>

      <section className="space-y-3 border border-line bg-paper-raised p-5">
        <h2 className="text-sm font-semibold text-ink">Research coverage</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-ink-subtle">Exact-tag claims</dt>
            <dd className="font-mono text-lg text-ink" data-testid="profile-exact-count">
              {exactCount}
            </dd>
          </div>
          {familyCount !== null ? (
            <div>
              <dt className="text-xs text-ink-subtle">Family-expanded unique claims</dt>
              <dd className="font-mono text-lg text-ink" data-testid="profile-family-count">
                {familyCount}
              </dd>
            </div>
          ) : (
            <div>
              <dt className="text-xs text-ink-subtle">Parent family expansion</dt>
              <dd className="text-sm text-ink-muted">
                Exact tag only — use{' '}
                <Link
                  to={mechanismProfileHref(parentId!)}
                  className="font-mono text-accent no-underline hover:underline"
                >
                  {parentId}
                </Link>{' '}
                for family-expanded coverage.
              </dd>
            </div>
          )}
        </dl>
        <p className="text-xs text-ink-subtle">
          Coverage is not causal importance. Exact and family figures are distinct. A family can
          contain legal facts, descriptive findings, hypotheses, assumptions, and limitations —
          do not treat all associated evidence as proof of the mechanism.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            to={
              isFamily
                ? claimsExplorerHrefForMechanism(mechanismId)
                : claimsExplorerHref({ mechanisms: [mechanismId] })
            }
            className="inline-flex border border-accent bg-accent px-3 py-1.5 text-sm font-medium text-white no-underline hover:opacity-90"
            data-testid="profile-claims-link"
          >
            {isFamily
              ? `View ${familyCount} family-associated claims`
              : `View ${exactCount} exact-tag claims`}
          </Link>
          {isFamily ? (
            <Link
              to={claimsExplorerHref({ mechanisms: [mechanismId] })}
              className="inline-flex border border-line px-3 py-1.5 text-sm text-ink no-underline hover:bg-neutral-soft"
            >
              Exact {mechanismId} only ({exactCount})
            </Link>
          ) : null}
        </div>
      </section>

      {mechanismId === 'M5a' || mechanismId === 'M5' ? (
        <section
          id="contextual-subdivisions"
          className="space-y-3 border border-dashed border-line-strong bg-neutral-soft p-5"
          data-testid="contextual-subdivisions"
        >
          <h2 className="text-sm font-semibold text-ink">
            Contextual subdivisions (not atlas tags)
          </h2>
          <p className="text-xs text-ink-muted">
            Case 2 refers to M5a-1 and M5a-2. These are conceptual subdivisions of M5a, not exact
            atlas <span className="font-mono">mechanism_ids</span> values. They do not receive
            fabricated claim counts.
          </p>
          <ul className="space-y-2">
            {MECHANISM_CONTEXTUAL_SUBDIVISIONS.map((item) => (
              <li key={item.id} className="text-sm text-ink">
                <span className="font-mono">{item.id}</span> — {item.label}. {item.note}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-3 border border-line bg-paper-raised p-5">
        <h2 className="text-sm font-semibold text-ink">
          Alternative explanations and curated notes
        </h2>
        {content.sparseExplanation ? (
          <p className="text-sm text-ink-muted">
            Adequate standalone casebook prose for this tag is limited. Taxonomy, linked evidence,
            and the limitation below are presented rather than inventing a detailed theory.
          </p>
        ) : null}
        <ul className="space-y-3">
          {content.alternativeExplanations.map((item, index) => (
            <li key={index} className="space-y-1 text-sm">
              <p className="text-ink">{item.text}</p>
              <p className="text-[10px] uppercase tracking-wide text-ink-subtle">
                {RELATION_TYPE_LABELS[item.relation]}
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                {item.sources.map((source) =>
                  source.kind === 'claim' ? (
                    <Link
                      key={source.id}
                      to={`/claims/${source.id}`}
                      className="font-mono text-accent no-underline hover:underline"
                    >
                      {source.id}
                    </Link>
                  ) : source.caseId && source.section ? (
                    <Link
                      key={source.id}
                      to={`/casebook/${source.caseId}#${caseSectionAnchor(source.section)}`}
                      className="font-mono text-accent no-underline hover:underline"
                    >
                      {source.id}
                    </Link>
                  ) : (
                    <span key={source.id} className="font-mono text-ink-muted">
                      {source.id}
                    </span>
                  ),
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3 border border-line bg-paper-raised p-5">
        <h2 className="text-sm font-semibold text-ink">Outcome associations</h2>
        <p className="text-xs text-ink-subtle">
          Association with an outcome tag is not empirical measurement of that outcome. O1–O6 is
          not a mandatory causal chain.
        </p>
        {content.outcomeNotes.map((note, index) => (
          <p key={index} className="text-sm text-ink-muted">
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
                className="ml-1 font-mono text-xs text-accent no-underline hover:underline"
              >
                {source.id}
              </Link>
            ))}
          </p>
        ))}
        <div className="flex flex-wrap gap-2">
          {associatedOutcomes.map((outcome) => (
            <Link
              key={outcome.id}
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
              className="border border-line px-2 py-1 font-mono text-xs text-ink-muted no-underline hover:border-accent hover:text-accent"
            >
              {outcome.id} {outcome.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3 border border-line bg-paper-raised p-5">
        <h2 className="text-sm font-semibold text-ink">Relevant casebook passages</h2>
        {content.casebookPassages.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No dedicated casebook mechanism-section row for this exact tag; see parent family and
            linked claims.
          </p>
        ) : (
          <ul className="space-y-2">
            {content.casebookPassages.map((passage) => (
              <li key={`${passage.caseId}-${passage.section}`} className="text-sm">
                <Link
                  to={`/casebook/${passage.caseId}#${caseSectionAnchor(passage.section)}`}
                  className="font-medium text-accent no-underline hover:underline"
                >
                  {passage.caseId} §{passage.section} — {passage.label}
                </Link>
                <p className="text-xs text-ink-muted">{passage.note}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {explanations.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-xl font-semibold text-ink">
            Conditional explanations
          </h2>
          {explanations.map((item) => (
            <MechanismPathway key={item.id} explanation={item} />
          ))}
        </section>
      ) : null}

      <section className="space-y-2 border border-line bg-paper-raised p-5">
        <h2 className="text-sm font-semibold text-ink">Material evidence limitations</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-muted">
          {content.limitations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <nav aria-label="Mechanism taxonomy" className="flex flex-wrap gap-2 text-xs">
        {MECHANISM_FAMILIES.map((family) => (
          <Link
            key={family.id}
            to={mechanismProfileHref(family.id)}
            className={[
              'border px-2 py-1 font-mono no-underline',
              family.id === mechanismId || family.id === parentId
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-line text-ink-muted hover:border-accent',
            ].join(' ')}
          >
            {family.id}
          </Link>
        ))}
      </nav>
    </article>
  );
}
