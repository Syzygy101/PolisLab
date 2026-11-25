import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getCasebookCase, casebookDataset } from '@/data/casebookDataset';
import { findClaimById } from '@/data/researchDataset';
import { CASE_DERIVED_META } from '@/research/casebookMeta';
import { isCaseId, mechanismProfileHref, type CaseId } from '@/research/taxonomy';
import { claimsExplorerHref } from '@/research/urlFilters';
import { comparisonHref } from '@/research/comparisonUrl';
import { listVariants } from '@/research/comparisonQueries';
import { isNavigableMechanismId } from '@/research/mechanismQueries';
import { CasebookMarkdown } from '@/components/casebook/CasebookMarkdown';
import { CitedEvidencePanel } from '@/components/casebook/CitedEvidencePanel';
import { CaseOneLab } from '@/components/case-one/CaseOneLab';
import { CaseInterventionFocus } from '@/components/casebook/CaseInterventionFocus';
import type { ParsedCase } from '@/research/casebookSchema';
import {
  RESEARCH_CORRECTION_PASS,
  RESEARCH_CUTOFF,
  RESEARCH_RELEASE,
} from '@/research/constants';
import { gapsHref } from '@/research/gapsUrl';
import { requirementsForCase } from '@/research/gapsQueries';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** Published example pairings only — no new comparisons are invented here. */
const CASE_COMPARISON_PAIRS: Partial<Record<CaseId, { a: string; b?: string; label: string }>> = {
  Case1: { a: 'C1-VAR-R', b: 'C1-VAR-E', label: 'Compare R and E' },
  Case2: { a: 'C2-VAR-CF-A', b: 'C2-VAR-CF-C', label: 'Compare CF-A and CF-C' },
  Case4: { a: 'C4-VAR-B0', b: 'C4-VAR-CF-STRONGER', label: 'Compare B0 and CF-stronger' },
};

/** True when a section body contains a GFM table (analytical tables get a wider measure). */
function hasMarkdownTable(markdown: string): boolean {
  return /^\s*\|?\s*:?-{3,}:?\s*\|/m.test(markdown);
}

/** Tracks which section is nearest the top of the viewport for rail highlighting. */
function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = ids.join('|');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const elements = key
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);

  return active;
}

function CaseNotFound({ caseId, missingData }: { caseId: string; missingData: boolean }) {
  return (
    <div data-testid="case-not-found">
      <p className="page-kicker">Investigations</p>
      <h1 className="page-title">Case not found</h1>
      {missingData ? (
        <p className="lede">Generated casebook data is missing {caseId}.</p>
      ) : (
        <p className="lede">
          No published investigation matches{' '}
          <span className="mono">{caseId || '(empty)'}</span>. Valid IDs: Case1, Case2, Case3,
          Case4.
        </p>
      )}
      <Link to="/casebook" className="btn btn--secondary">
        Back to investigations
      </Link>
    </div>
  );
}

export function CaseDetailPage() {
  const { caseId = '' } = useParams();
  useDocumentTitle(caseId ? `Casebook ${caseId}` : 'Casebook');

  if (!isCaseId(caseId)) {
    return <CaseNotFound caseId={caseId} missingData={false} />;
  }
  const researchCase = getCasebookCase(caseId);
  if (!researchCase) {
    return <CaseNotFound caseId={caseId} missingData />;
  }
  return <CaseInvestigation caseId={caseId} researchCase={researchCase} />;
}

function CaseInvestigation({
  caseId,
  researchCase,
}: {
  caseId: CaseId;
  researchCase: ParsedCase;
}) {
  const jumpRef = useRef<HTMLDetailsElement>(null);
  const meta = CASE_DERIVED_META[caseId];
  const questionSection = researchCase.sections.find((s) => s.number === 1);
  const section9Requirements = requirementsForCase(caseId);
  const variants = listVariants(caseId);
  const pairing = CASE_COMPARISON_PAIRS[caseId];
  const compareTarget = pairing
    ? comparisonHref({ a: pairing.a, b: pairing.b })
    : variants[0]
      ? comparisonHref({ a: variants[0].id })
      : '/comparison';

  // Mechanism tags are metadata co-tags on directly cited claims, not a causal pathway.
  const mechanismTags = useMemo(() => {
    const tags = new Set<string>();
    for (const claimId of researchCase.membershipClaimIds) {
      findClaimById(claimId)?.mechanisms.forEach((m) => tags.add(m));
    }
    return [...tags].filter(isNavigableMechanismId).sort();
  }, [researchCase]);

  const sectionIds = useMemo(
    () => [...researchCase.sections.map((s) => s.anchor), 'cited-evidence'],
    [researchCase],
  );
  const activeId = useActiveSection(sectionIds);

  // The route is lazy-loaded, so a direct #section-N link can arrive before the section
  // exists; scroll to it once the investigation has rendered.
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    let id = hash.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch {
      // keep the raw fragment
    }
    document.getElementById(id)?.scrollIntoView?.();
  }, [hash, caseId]);

  function closeJump() {
    if (jumpRef.current) jumpRef.current.open = false;
  }

  return (
    <div data-testid={`case-page-${caseId}`}>
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link to="/casebook">Investigations</Link>
        <span aria-hidden="true">/</span>
        <span>{researchCase.id}</span>
      </nav>

      {caseId === 'Case1' && <CaseOneLab requirements={section9Requirements} />}

      <header className={caseId === 'Case1' ? 'site-published-header' : undefined}>
        <p className="page-kicker">{researchCase.heading}</p>
        {caseId === 'Case1'
          ? <h2 className="page-title">{researchCase.title}</h2>
          : <h1 className="page-title page-title--hero">{researchCase.title}</h1>}
        <p className="lede">{meta.orientation}</p>
        <p className="small-note" style={{ marginBottom: '1rem' }}>
          <strong>Published research question.</strong> See section 1 below for the complete
          original wording
          {questionSection ? ` (“${questionSection.title}”).` : '.'}
        </p>

        <div className="action-row" style={{ marginBottom: '1rem' }}>
          <Link to={compareTarget} className="btn btn--primary" data-testid="case-compare-policies">
            {pairing ? 'Compare policies' : 'Compare policies in this case'}
          </Link>
          <a href="#cited-evidence" className="btn btn--secondary">
            Cited evidence ({researchCase.membershipClaimIds.length})
          </a>
          <Link
            to={claimsExplorerHref({ cases: [caseId] })}
            className="btn btn--secondary"
            data-testid="case-evidence-subset"
          >
            Case evidence subset
          </Link>
          <Link
            to={gapsHref({ cases: [caseId] })}
            className="btn btn--secondary"
            data-testid="case-gaps-link"
          >
            Research gaps ({section9Requirements.length} §9 requirements)
          </Link>
          <a href="#section-9" className="btn btn--ghost">
            Evidence that would change the assessment
          </a>
          <Link to="/casebook/source" className="btn btn--ghost">
            Full source document
          </Link>
        </div>

        <p className="meta-line" style={{ marginBottom: '1.5rem' }}>
          Research {RESEARCH_RELEASE} · cutoff {RESEARCH_CUTOFF} · correction pass{' '}
          {RESEARCH_CORRECTION_PASS} ·{' '}
          <span className="mono">{casebookDataset.provenance.sourceFile}</span>
        </p>
      </header>

      <details className="case-jump" ref={jumpRef} data-testid="case-section-jump">
        <summary>Jump to section</summary>
        <nav aria-label="Jump to section">
          <ol>
            {researchCase.sections.map((section) => (
              <li key={section.anchor}>
                <a href={`#${section.anchor}`} onClick={closeJump}>
                  <span className="rail-num">{section.number}.</span> {section.title}
                </a>
              </li>
            ))}
            <li>
              <a href="#cited-evidence" onClick={closeJump}>
                Cited evidence index
              </a>
            </li>
          </ol>
        </nav>
      </details>

      <section
        className="panel panel--muted case-related"
        aria-labelledby="case-related-heading"
        data-testid="case-related"
      >
        <h2 id="case-related-heading" className="sr-only">
          Related analysis for {researchCase.id}
        </h2>
        <div className="case-related-group">
          <p className="eyebrow">Policies to compare</p>
          <ul className="tag-list">
            {variants.map((variant) => (
              <li key={variant.id}>
                <Link
                  to={comparisonHref({ a: variant.id })}
                  className="tag-link"
                  title={variant.label}
                  data-testid={`case-variant-${variant.id}`}
                >
                  <span className="mono">{variant.shortCode}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="small-note small-note--subtle">
            Opens the comparison with that variant selected.
          </p>
        </div>
        <div className="case-related-group">
          <p className="eyebrow">Mechanism tags on cited claims</p>
          <ul className="tag-list">
            {mechanismTags.map((tag) => (
              <li key={tag}>
                <Link to={mechanismProfileHref(tag)} className="tag-link">
                  <span className="mono">{tag}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="small-note small-note--subtle">
            Metadata co-tags on directly cited claims — not a causal pathway.
          </p>
        </div>
        <div className="case-related-group">
          <p className="eyebrow">Evidence</p>
          <ul className="link-rows">
            <li>
              <a href="#cited-evidence">
                Cited evidence index ({researchCase.membershipClaimIds.length})
              </a>
            </li>
            <li>
              <Link to={claimsExplorerHref({ cases: [caseId] })}>Open in Evidence library</Link>
            </li>
          </ul>
        </div>
        <div className="case-related-group">
          <p className="eyebrow">Research requirements</p>
          <ul className="tag-list">
            {section9Requirements.map((req) => (
              <li key={req.id}>
                <Link to={`/gaps/${req.id}`} className="tag-link" title={req.curatedLabel}>
                  <span className="mono">{req.id}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="small-note small-note--subtle">
            Published §9 entries for {caseId}.
          </p>
        </div>
      </section>


      <div className="case-layout">
        <nav
          className="section-rail"
          aria-label="Case sections"
          data-testid="case-section-nav"
        >
          <p className="section-rail-label">Sections</p>
          <ol>
            {researchCase.sections.map((section) => (
              <li key={section.anchor}>
                <a
                  href={`#${section.anchor}`}
                  className={activeId === section.anchor ? 'is-active' : undefined}
                  aria-current={activeId === section.anchor ? 'true' : undefined}
                >
                  <span className="rail-num">{section.number}.</span> {section.title}
                </a>
              </li>
            ))}
          </ol>
          <hr className="section-rail-divider" />
          <a
            href="#cited-evidence"
            className={activeId === 'cited-evidence' ? 'is-active' : undefined}
            aria-current={activeId === 'cited-evidence' ? 'true' : undefined}
          >
            Cited evidence index
          </a>
        </nav>

        <div>
          {caseId === 'Case1' ? (
            <div className="case-prose" style={{ marginBottom: '1.5rem' }}>
              <CaseInterventionFocus />
            </div>
          ) : null}

          {researchCase.sections.map((section) => {
            const wide = hasMarkdownTable(section.markdown);
            return (
              <section
                key={section.anchor}
                id={section.anchor}
                className="case-section"
                data-testid={`case-section-${section.number}`}
                aria-labelledby={`${section.anchor}-heading`}
              >
                <div className="case-section-head">
                  <h2 id={`${section.anchor}-heading`}>{section.heading}</h2>
                </div>
                {section.number === 7 ? (
                  <p className="notice case-prose" style={{ marginBottom: '0.75rem' }}>
                    Outcome tags below are assessment notes from the published case text — not
                    measured results or confidence scores.
                  </p>
                ) : null}
                {section.number === 6 && caseId === 'Case1' ? (
                  <p className="notice case-prose" style={{ marginBottom: '0.75rem' }}>
                    Favourable / unfavourable / null pathways are listed separately for R and E.
                    Colour and order do not encode probability.
                  </p>
                ) : null}
                <div className={wide ? 'case-prose case-prose--wide' : 'case-prose'}>
                  <CasebookMarkdown
                    markdown={section.markdown}
                    claimReturn={{ caseId, section: section.number }}
                  />
                </div>
                {section.number === 9 && section9Requirements.length > 0 ? (
                  <div className="panel panel--muted" data-testid="case-section-9-gaps">
                    <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>
                      Inspect in Research gaps
                    </p>
                    <ul className="link-rows">
                      {section9Requirements.map((req) => (
                        <li key={req.id}>
                          <Link to={`/gaps/${req.id}`} className="id-link link-rows-id">
                            {req.id}
                          </Link>
                          <span>{req.curatedLabel}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="small-note" style={{ marginTop: '0.5rem' }}>
                      <Link to={gapsHref({ cases: [caseId] })}>
                        All {caseId} research requirements
                      </Link>
                    </p>
                  </div>
                ) : null}
                {section.explicitClaimIds.length > 0 ? (
                  <p className="case-section-meta">
                    Explicit claim IDs in this section:{' '}
                    {section.explicitClaimIds.map((id, i) => (
                      <span key={id}>
                        {i > 0 ? ', ' : ''}
                        <Link
                          to={`/claims/${id}`}
                          state={{ caseReturn: { caseId, section: section.number } }}
                          className="id-link"
                        >
                          {id}
                        </Link>
                      </span>
                    ))}
                  </p>
                ) : null}
              </section>
            );
          })}

          <div id="cited-evidence" className="case-section">
            <CitedEvidencePanel researchCase={researchCase} />
          </div>

          <aside className="panel panel--muted case-prose" aria-labelledby="common-rules-heading">
            <h2 id="common-rules-heading" className="panel-title">
              Common methodological rules
            </h2>
            <p className="small-note" style={{ maxWidth: 'none', marginBottom: '0.5rem' }}>
              All four cases retain the front-matter hard rules, including conditional O1–O6
              progression (<Link to="/claims/ATLAS-ASM-002">ATLAS-ASM-002</Link>), absence of
              finding versus proof of absence, restrictions on importing international
              magnitudes, welfare inference limits (
              <Link to="/claims/ATLAS-CON-003">ATLAS-CON-003</Link>), Phase 0D.2 toy-game status,
              and ALDI chronology identification limits.
            </p>
            <p className="small-note small-note--subtle" style={{ marginBottom: '0.5rem' }}>
              Not legal advice. Not a live legal-update service. Research licence CC BY 4.0.
            </p>
            <Link to="/casebook/source">Read full methodology and cross-case comparison</Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
