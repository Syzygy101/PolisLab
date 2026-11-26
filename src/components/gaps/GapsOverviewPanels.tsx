import { Link } from 'react-router-dom';
import { allClaims } from '@/data/researchDataset';
import {
  claimsWithAssessmentChangingObservations,
  requirementsForCase,
  type GapsAtlasCounts,
} from '@/research/gapsQueries';
import { gapsHref } from '@/research/gapsUrl';
import { claimsExplorerHref } from '@/research/urlFilters';
import { RESEARCH_AGENDA_PROGRAMMES } from '@/research/gapsRequirements';
import { CASE_IDS, RESEARCH_CASES } from '@/research/taxonomy';
import { GAPS_REGISTRY } from '@/research/gapsRequirements';

const THEME_EXAMPLES = [
  {
    id: 'site-control',
    title: 'Site-control identification',
    body: 'Distinguish descriptive site data from identification of foreclosure. Use ATLAS-EMP-001, ATLAS-EMP-002, ATLAS-HYP-001, ATLAS-GAP-001 and Case1 §9.',
    href: gapsHref({ cases: ['Case1'], mechanismFamilies: ['M1'] }),
  },
  {
    id: 'foreign-investment',
    title: 'Foreign investment',
    body: 'Distinguish ordinary administrative processing from evidence that a requirement was binding. Use transaction-specific legal rules and Case2 §9.',
    href: gapsHref({ cases: ['Case2'] }),
  },
  {
    id: 'aldi-scale-up',
    title: 'ALDI scale-up',
    body: 'Distinguish observed investment order from identification of a binding logistics constraint. Use ATLAS-EMP-005, ATLAS-HYP-004 and Case3 §9.',
    href: gapsHref({ cases: ['Case3'], claimId: 'ATLAS-HYP-004' }),
  },
  {
    id: 'consumer-substitution',
    title: 'Consumer substitution',
    body: 'Use ATLAS-GAP-002 and related demand/format evidence. Do not import foreign diversion magnitudes as Australian parameters.',
    href: gapsHref({ claimId: 'ATLAS-GAP-002' }),
  },
  {
    id: 'acquisition-oversight',
    title: 'Acquisition oversight',
    body: 'Distinguish notification and waiver records from realised development and competitive outcomes. Use ATLAS-EMP-007, ATLAS-GAP-003 and Case4 §9.',
    href: gapsHref({ cases: ['Case4'] }),
  },
] as const;

export function GapsEntryPoints({ counts }: { counts: GapsAtlasCounts }) {
  const assessmentClaims = claimsWithAssessmentChangingObservations(allClaims);

  return (
    <section
      id="entry-points"
      className="stack"
      style={{ scrollMarginTop: '1.5rem' }}
      aria-labelledby="entry-points-heading"
      data-testid="gaps-entry-points"
    >
      <div>
        <h2 id="entry-points-heading" className="section-title">
          Entry points
        </h2>
        <p className="small-note">
          Four distinct ways into the unresolved record. They are different kinds of source
          material and are not interchangeable.
        </p>
      </div>
      <div className="gaps-intro-grid">
        <div className="panel stack--tight" style={{ display: 'grid', gap: '0.5rem', alignContent: 'start' }}>
          <h3 className="panel-title">A. Published casebook research requirements</h3>
          <p className="small-note">
            {GAPS_REGISTRY.requirements.length} numbered §9 entries across four cases (source
            entries, not independent studies).
          </p>
          <ul className="link-rows">
            {CASE_IDS.map((caseId) => {
              const title = RESEARCH_CASES.find((c) => c.id === caseId)?.title ?? caseId;
              const n = requirementsForCase(caseId).length;
              return (
                <li key={caseId}>
                  <Link to={gapsHref({ cases: [caseId] })}>
                    {caseId} — {title}
                  </Link>
                  <span className="meta-line">· {n} requirements</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="panel stack--tight" style={{ display: 'grid', gap: '0.5rem', alignContent: 'start' }}>
          <h3 className="panel-title">
            B. Claim-level limitations and assessment-changing observations
          </h3>
          <p className="small-note">
            {assessmentClaims.length} atlas claims describe an observation that could change the assessment.
          </p>
          <details className="guide-disclosure">
            <summary>Atlas field name</summary>
            <p className="small-note mono">observation_that_would_alter_assessment</p>
          </details>
          <p>
            <Link to="/claims" className="btn btn--secondary">
              Open Evidence library
            </Link>
          </p>
          <p className="small-note small-note--subtle">
            Limitations and competing evidence remain on each claim detail — distinct from
            casebook §9 requirements.
          </p>
        </div>

        <div className="panel stack--tight" style={{ display: 'grid', gap: '0.5rem', alignContent: 'start' }}>
          <h3 className="panel-title">C. Unresolved hypotheses and absence-of-finding records</h3>
          <ul className="link-rows">
            <li>
              <span>
                <Link
                  to={claimsExplorerHref({ statuses: ['absence_of_finding'] })}
                  className="underline underline-offset-2"
                >
                  Absence of finding
                </Link>
                : {counts.absenceOfFinding} records (includes {counts.gapPrefixed} GAP-prefixed)
              </span>
            </li>
            <li>
              <span>
                <Link
                  to={claimsExplorerHref({ statuses: ['unresolved_hypothesis'] })}
                  className="underline underline-offset-2"
                >
                  Unresolved hypothesis
                </Link>
                : {counts.unresolvedHypothesis} records
              </span>
            </li>
          </ul>
          <p className="small-note small-note--subtle">
            These groups are not interchangeable. GAP prefixes do not define all research gaps. Do
            not present their sum ({counts.absenceOfFinding + counts.unresolvedHypothesis}) as a
            count of unique unresolved research questions.
          </p>
        </div>

        <div className="panel stack--tight" style={{ display: 'grid', gap: '0.5rem', alignContent: 'start' }}>
          <h3 className="panel-title">D. Source-grounded research agenda</h3>
          <p className="small-note">
            Optional thematic programmes grouping related §9 requirements. Organisational aids
            only — not newly published findings.
          </p>
          <ul className="link-rows">
            {RESEARCH_AGENDA_PROGRAMMES.map((p) => (
              <li key={p.id}>
                <Link to={gapsHref({ agenda: p.id })}>{p.label}</Link>
                <span className="meta-line">· {p.requirementIds.length} requirements</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function AssessmentChangingThemes() {
  return (
    <section
      id="assessment-themes"
      className="stack"
      style={{ scrollMarginTop: '1.5rem' }}
      aria-labelledby="assessment-themes-heading"
      data-testid="gaps-assessment-themes"
    >
      <div>
        <h2 id="assessment-themes-heading" className="section-title">
          Assessment-changing evidence themes
        </h2>
        <p className="small-note">
          Navigable presentations of published observations that could alter assessments.
          Observing a single event does not necessarily falsify a broad economic hypothesis.
        </p>
      </div>
      <div className="theme-grid">
        {THEME_EXAMPLES.map((theme) => (
          <Link
            key={theme.id}
            to={theme.href}
            className="theme-card"
            data-testid={`gaps-theme-${theme.id}`}
          >
            <h3>{theme.title}</h3>
            <p>{theme.body}</p>
            <span className="theme-cta">Show related requirements</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function GapsIntegrityNote({ counts }: { counts: GapsAtlasCounts }) {
  return (
    <aside className="panel panel--muted" data-testid="gaps-integrity-note">
      <p className="small-note" style={{ maxWidth: 'none' }}>
        Dynamic atlas counts — GAP-prefixed {counts.gapPrefixed} · absence_of_finding{' '}
        {counts.absenceOfFinding} · unresolved_hypothesis {counts.unresolvedHypothesis} · total
        claims {counts.totalClaims}. Status is never inferred from ID prefixes. Admissibility is
        not a truth verdict. Absence of finding is not proof of absence. Hypothetical
        observations are not observed results.
      </p>
    </aside>
  );
}
