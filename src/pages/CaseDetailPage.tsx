import { Link, useParams } from 'react-router-dom';
import { getCasebookCase, casebookDataset } from '@/data/casebookDataset';
import { CASE_DERIVED_META } from '@/research/casebookMeta';
import { isCaseId } from '@/research/taxonomy';
import { claimsExplorerHref } from '@/research/urlFilters';
import { CasebookMarkdown } from '@/components/casebook/CasebookMarkdown';
import { CitedEvidencePanel } from '@/components/casebook/CitedEvidencePanel';
import { CaseInterventionFocus } from '@/components/casebook/CaseInterventionFocus';
import {
  RESEARCH_CORRECTION_PASS,
  RESEARCH_CUTOFF,
  RESEARCH_RELEASE,
} from '@/research/constants';
import { gapsHref } from '@/research/gapsUrl';
import { requirementsForCase } from '@/research/gapsQueries';

export function CaseDetailPage() {
  const { caseId = '' } = useParams();

  if (!isCaseId(caseId)) {
    return (
      <div className="space-y-3" data-testid="case-not-found">
        <h1 className="font-display text-2xl font-semibold text-ink">Case not found</h1>
        <p className="text-sm text-ink-muted">
          No published investigation matches <span className="font-mono">{caseId || '(empty)'}</span>.
          Valid IDs: Case1, Case2, Case3, Case4.
        </p>
        <Link to="/casebook" className="text-sm text-accent">
          Back to Casebook directory
        </Link>
      </div>
    );
  }

  const researchCase = getCasebookCase(caseId);
  if (!researchCase) {
    return (
      <div className="space-y-3" data-testid="case-not-found">
        <h1 className="font-display text-2xl font-semibold text-ink">Case not found</h1>
        <p className="text-sm text-ink-muted">Generated casebook data is missing {caseId}.</p>
        <Link to="/casebook" className="text-sm text-accent">
          Back to Casebook directory
        </Link>
      </div>
    );
  }

  const meta = CASE_DERIVED_META[caseId];
  const questionSection = researchCase.sections.find((s) => s.number === 1);
  const section9Requirements = requirementsForCase(caseId);

  return (
    <div className="space-y-6" data-testid={`case-page-${caseId}`}>
      <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
        <Link to="/casebook" className="text-accent no-underline hover:underline">
          Casebook
        </Link>
        <span className="mx-2 text-ink-subtle">/</span>
        <span className="text-ink">{researchCase.id}</span>
      </nav>

      <header className="space-y-3 border-b border-line pb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-accent">
          {researchCase.heading}
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink">{researchCase.title}</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-ink-muted">{meta.orientation}</p>
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-medium text-ink">Published research question. </span>
            <span className="text-ink-muted">
              See section 1 below for the complete original wording
              {questionSection ? ` (“${questionSection.title}”).` : '.'}
            </span>
          </p>
          <p className="text-xs text-ink-subtle">
            Research {RESEARCH_RELEASE} · cutoff {RESEARCH_CUTOFF} · correction pass{' '}
            {RESEARCH_CORRECTION_PASS} · source{' '}
            <span className="font-mono">{casebookDataset.provenance.sourceFile}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="#cited-evidence"
            className="border border-accent bg-accent px-3 py-1.5 text-sm font-medium text-white no-underline hover:opacity-90"
          >
            Cited evidence ({researchCase.membershipClaimIds.length})
          </a>
          <Link
            to={claimsExplorerHref({ cases: [caseId] })}
            className="border border-accent/40 bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent no-underline"
          >
            Filtered Claims Explorer
          </Link>
          <Link
            to="/casebook/source"
            className="border border-line px-3 py-1.5 text-sm text-ink no-underline hover:bg-neutral-soft"
          >
            Full source document
          </Link>
          <a
            href="#section-9"
            className="border border-line px-3 py-1.5 text-sm text-ink no-underline hover:bg-neutral-soft"
          >
            Evidence that would change the assessment
          </a>
          <Link
            to={gapsHref({ cases: [caseId] })}
            className="border border-line px-3 py-1.5 text-sm text-ink no-underline hover:bg-neutral-soft"
            data-testid="case-gaps-link"
          >
            Evidence Gaps ({section9Requirements.length} §9 requirements)
          </Link>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8">
        <nav
          aria-label="Case sections"
          className="mb-4 space-y-1 lg:sticky lg:top-4 lg:mb-0 lg:self-start"
          data-testid="case-section-nav"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">Sections</p>
          <div className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {researchCase.sections.map((section) => (
              <a
                key={section.anchor}
                href={`#${section.anchor}`}
                className="shrink-0 border border-line bg-paper-raised px-2 py-1 text-xs text-ink no-underline hover:bg-neutral-soft lg:border-0 lg:bg-transparent lg:px-0 lg:py-0.5 lg:text-sm lg:text-accent lg:hover:underline"
              >
                <span className="font-mono text-ink-subtle">{section.number}.</span>{' '}
                {section.title}
              </a>
            ))}
            <a
              href="#cited-evidence"
              className="shrink-0 border border-line bg-paper-raised px-2 py-1 text-xs text-ink no-underline hover:bg-neutral-soft lg:border-0 lg:bg-transparent lg:px-0 lg:py-0.5 lg:text-sm lg:text-accent lg:hover:underline"
            >
              Cited evidence index
            </a>
          </div>
        </nav>

        <div className="space-y-8">
          {caseId === 'Case1' ? <CaseInterventionFocus /> : null}

          {researchCase.sections.map((section) => (
            <section
              key={section.anchor}
              id={section.anchor}
              className="scroll-mt-6 space-y-3 border-t border-line pt-5"
              data-testid={`case-section-${section.number}`}
              aria-labelledby={`${section.anchor}-heading`}
            >
              <h2
                id={`${section.anchor}-heading`}
                className="font-display text-xl font-semibold text-ink"
              >
                {section.heading}
              </h2>
              {section.number === 7 ? (
                <p className="text-xs text-ink-subtle">
                  Outcome tags below are assessment notes from the published case text — not measured
                  results or confidence scores.
                </p>
              ) : null}
              {section.number === 6 && caseId === 'Case1' ? (
                <p className="text-xs text-ink-subtle">
                  Favourable / unfavourable / null pathways are listed separately for R and E. Colour
                  and order do not encode probability.
                </p>
              ) : null}
              <CasebookMarkdown
                markdown={section.markdown}
                claimReturn={{ caseId, section: section.number }}
              />
              {section.number === 9 && section9Requirements.length > 0 ? (
                <div
                  className="space-y-2 border border-line bg-paper px-3 py-3"
                  data-testid="case-section-9-gaps"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                    Inspect in Evidence Gaps
                  </p>
                  <ul className="space-y-1 text-sm">
                    {section9Requirements.map((req) => (
                      <li key={req.id}>
                        <Link
                          to={`/gaps/${req.id}`}
                          className="font-mono text-xs text-accent no-underline hover:underline"
                        >
                          {req.id}
                        </Link>
                        <span className="text-ink-muted"> — {req.curatedLabel}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={gapsHref({ cases: [caseId] })}
                    className="text-xs text-accent no-underline hover:underline"
                  >
                    All {caseId} research requirements
                  </Link>
                </div>
              ) : null}
              {section.explicitClaimIds.length > 0 ? (
                <p className="text-xs text-ink-subtle">
                  Explicit claim IDs in this section:{' '}
                  {section.explicitClaimIds.map((id, i) => (
                    <span key={id}>
                      {i > 0 ? ', ' : ''}
                      <Link
                        to={`/claims/${id}`}
                        state={{ caseReturn: { caseId, section: section.number } }}
                        className="font-mono text-accent"
                      >
                        {id}
                      </Link>
                    </span>
                  ))}
                </p>
              ) : null}
            </section>
          ))}

          <div id="cited-evidence" className="scroll-mt-6">
            <CitedEvidencePanel researchCase={researchCase} />
          </div>

          <aside className="space-y-2 border border-line bg-neutral-soft px-4 py-3 text-sm text-ink-muted">
            <h2 className="text-sm font-semibold text-ink">Common methodological rules</h2>
            <p>
              All four cases retain the front-matter hard rules, including conditional O1–O6
              progression (<Link to="/claims/ATLAS-ASM-002">ATLAS-ASM-002</Link>), absence of finding
              versus proof of absence, restrictions on importing international magnitudes, welfare
              inference limits (<Link to="/claims/ATLAS-CON-003">ATLAS-CON-003</Link>), Phase 0D.2
              toy-game status, and ALDI chronology identification limits.
            </p>
            <p className="text-xs">
              Not legal advice. Not a live legal-update service. Research licence CC BY 4.0.
            </p>
            <Link to="/casebook/source" className="text-sm text-accent">
              Read full methodology and cross-case comparison
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
