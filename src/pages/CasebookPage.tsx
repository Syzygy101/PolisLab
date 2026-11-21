import { Link } from 'react-router-dom';
import { casebookDataset } from '@/data/casebookDataset';
import { allClaims } from '@/data/researchDataset';
import { CASE_DERIVED_META } from '@/research/casebookMeta';
import { RESEARCH_CASES } from '@/research/taxonomy';
import { atlasMembershipIds } from '@/research/casebookQueries';
import { claimsExplorerHref } from '@/research/urlFilters';
import {
  RESEARCH_CORRECTION_PASS,
  RESEARCH_CUTOFF,
  RESEARCH_RELEASE,
} from '@/research/constants';

export function CasebookPage() {
  const { provenance } = casebookDataset;

  return (
    <div className="space-y-6" data-testid="casebook-directory">
      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
          Casebook Explorer · research {RESEARCH_RELEASE}
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
          Policy Assessment Casebook
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-ink-muted">
          Four published policy investigations from the v0.1.1 evidence synthesis. Investigate
          analytical structure, inspect cited claims, and read original qualifications — without
          new policy research, rankings, or causal conclusions.
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            to="/casebook/source"
            className="border border-line bg-paper-raised px-3 py-1.5 text-ink no-underline hover:bg-neutral-soft"
            data-testid="casebook-source-link"
          >
            Methodology &amp; source document
          </Link>
          <Link
            to="/claims"
            className="border border-line bg-paper-raised px-3 py-1.5 text-ink no-underline hover:bg-neutral-soft"
          >
            Claims Explorer
          </Link>
        </div>
        <p className="text-xs text-ink-subtle">
          Evidence cutoff {RESEARCH_CUTOFF} · Correction pass {RESEARCH_CORRECTION_PASS} · Source{' '}
          <span className="font-mono">{provenance.sourceFile}</span> · SHA-256{' '}
          <span className="font-mono">{provenance.sourceContentSha256.slice(0, 12)}…</span>
        </p>
      </header>

      <p className="max-w-3xl text-sm text-ink-muted" data-testid="membership-overlap-note">
        Direct cited-claim counts come from the validated atlas <span className="font-mono">casebook_cases</span>{' '}
        field. Memberships overlap and represent direct citation (including common front-matter
        rules), not exhaustive relevance, evidence quality, or policy performance.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {RESEARCH_CASES.map((researchCase, index) => {
          const parsed = casebookDataset.cases.find((c) => c.id === researchCase.id);
          const meta = CASE_DERIVED_META[researchCase.id];
          const citedCount = atlasMembershipIds(allClaims, researchCase.id).length;
          return (
            <article
              key={researchCase.id}
              className="flex flex-col space-y-3 border border-line-strong bg-paper-raised p-4"
              data-testid={`casebook-card-${researchCase.id}`}
            >
              <header className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-accent">
                  Case {index + 1}
                  <span className="ml-2 font-mono font-normal normal-case text-ink-subtle">
                    {researchCase.id}
                  </span>
                </p>
                <h2 className="font-display text-xl font-semibold text-ink">
                  {researchCase.title}
                </h2>
              </header>
              <p className="text-sm leading-relaxed text-ink-muted">
                <span className="font-medium text-ink">Research question. </span>
                {researchCase.researchQuestion}
              </p>
              <p className="text-sm text-ink-muted">
                <span className="font-medium text-ink">Analytical focus. </span>
                {meta.analyticalFocus}
              </p>
              <p className="text-sm text-ink">
                <span className="text-ink-subtle">Direct cited claims </span>
                <span
                  className="font-display text-lg font-semibold tabular-nums"
                  data-testid={`casebook-count-${researchCase.id}`}
                >
                  {citedCount}
                </span>
              </p>
              <p className="text-sm text-ink-muted">
                <span className="font-medium text-ink">Assessment boundary. </span>
                {meta.assessmentBoundary}
              </p>
              <div className="mt-auto flex flex-wrap gap-2 pt-1">
                <Link
                  to={`/casebook/${researchCase.id}`}
                  className="border border-accent bg-accent px-3 py-1.5 text-sm font-medium text-white no-underline hover:opacity-90"
                  data-testid={`open-case-${researchCase.id}`}
                >
                  Open case investigation
                </Link>
                <Link
                  to={claimsExplorerHref({ cases: [researchCase.id] })}
                  className="border border-accent/40 bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent no-underline hover:bg-accent-soft"
                  data-testid={`casebook-claims-${researchCase.id}`}
                >
                  Inspect cited claims
                </Link>
              </div>
              {parsed ? (
                <p className="text-[11px] text-ink-subtle">
                  {parsed.sections.length} analytical sections · body citations{' '}
                  {parsed.bodyClaimIds.length} · membership {parsed.membershipClaimIds.length}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
