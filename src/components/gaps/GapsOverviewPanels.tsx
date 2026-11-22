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
    <section className="space-y-4" data-testid="gaps-entry-points">
      <h2 className="font-display text-xl font-semibold text-ink">Entry points</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 border border-line bg-paper-raised p-4">
          <h3 className="text-sm font-semibold text-ink">
            A. Published casebook research requirements
          </h3>
          <p className="text-sm text-ink-muted">
            {GAPS_REGISTRY.requirements.length} numbered §9 entries across four cases (source
            entries, not independent studies).
          </p>
          <ul className="space-y-1 text-sm">
            {CASE_IDS.map((caseId) => {
              const title = RESEARCH_CASES.find((c) => c.id === caseId)?.title ?? caseId;
              const n = requirementsForCase(caseId).length;
              return (
                <li key={caseId}>
                  <Link
                    to={gapsHref({ cases: [caseId] })}
                    className="text-accent no-underline hover:underline"
                  >
                    {caseId} — {title}
                  </Link>
                  <span className="text-ink-subtle"> · {n} requirements</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-2 border border-line bg-paper-raised p-4">
          <h3 className="text-sm font-semibold text-ink">
            B. Claim-level limitations and assessment-changing observations
          </h3>
          <p className="text-sm text-ink-muted">
            {assessmentClaims.length} atlas claims carry a non-empty{' '}
            <span className="font-mono text-xs">observation_that_would_alter_assessment</span>.
          </p>
          <Link
            to="/claims"
            className="text-sm text-accent no-underline hover:underline"
          >
            Open Claims Explorer
          </Link>
          <p className="text-xs text-ink-subtle">
            Limitations and competing evidence remain on each claim detail — distinct from casebook
            §9 requirements.
          </p>
        </div>

        <div className="space-y-2 border border-line bg-paper-raised p-4">
          <h3 className="text-sm font-semibold text-ink">
            C. Unresolved hypotheses and absence-of-finding records
          </h3>
          <ul className="space-y-1 text-sm text-ink-muted">
            <li>
              <Link
                to={claimsExplorerHref({ statuses: ['absence_of_finding'] })}
                className="text-accent no-underline hover:underline"
              >
                Absence of finding
              </Link>
              : {counts.absenceOfFinding} records (includes {counts.gapPrefixed} GAP-prefixed)
            </li>
            <li>
              <Link
                to={claimsExplorerHref({ statuses: ['unresolved_hypothesis'] })}
                className="text-accent no-underline hover:underline"
              >
                Unresolved hypothesis
              </Link>
              : {counts.unresolvedHypothesis} records
            </li>
          </ul>
          <p className="text-xs text-ink-subtle">
            These groups are not interchangeable. GAP prefixes do not define all research gaps.
            Do not present their sum ({counts.absenceOfFinding + counts.unresolvedHypothesis}) as a
            count of unique unresolved research questions.
          </p>
        </div>

        <div className="space-y-2 border border-line bg-paper-raised p-4">
          <h3 className="text-sm font-semibold text-ink">
            D. Source-grounded research agenda
          </h3>
          <p className="text-sm text-ink-muted">
            Optional thematic programmes grouping related §9 requirements. Organisational aids
            only — not newly published findings.
          </p>
          <ul className="space-y-1 text-sm">
            {RESEARCH_AGENDA_PROGRAMMES.map((p) => (
              <li key={p.id}>
                <Link
                  to={gapsHref({ agenda: p.id })}
                  className="text-accent no-underline hover:underline"
                >
                  {p.label}
                </Link>
                <span className="text-ink-subtle"> · {p.requirementIds.length} requirements</span>
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
    <section className="space-y-3" data-testid="gaps-assessment-themes">
      <h2 className="font-display text-xl font-semibold text-ink">
        Assessment-changing evidence themes
      </h2>
      <p className="max-w-3xl text-sm text-ink-muted">
        Navigable presentations of published observations that could alter assessments. Observing a
        single event does not necessarily falsify a broad economic hypothesis.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {THEME_EXAMPLES.map((theme) => (
          <Link
            key={theme.id}
            to={theme.href}
            className="block space-y-1 border border-line bg-paper-raised p-4 text-ink no-underline hover:border-accent"
            data-testid={`gaps-theme-${theme.id}`}
          >
            <h3 className="text-sm font-semibold">{theme.title}</h3>
            <p className="text-xs text-ink-muted">{theme.body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function GapsIntegrityNote({ counts }: { counts: GapsAtlasCounts }) {
  return (
    <aside
      className="space-y-1 border border-line-strong bg-neutral-soft px-4 py-3 text-xs text-ink-muted"
      data-testid="gaps-integrity-note"
    >
      <p>
        Dynamic atlas counts — GAP-prefixed {counts.gapPrefixed} · absence_of_finding{' '}
        {counts.absenceOfFinding} · unresolved_hypothesis {counts.unresolvedHypothesis} · total
        claims {counts.totalClaims}. Status is never inferred from ID prefixes. Admissibility is not
        a truth verdict. Absence of finding is not proof of absence. Hypothetical observations are
        not observed results.
      </p>
    </aside>
  );
}
