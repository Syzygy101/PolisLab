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
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function CasebookPage() {
  useDocumentTitle('Investigations');

  const { provenance } = casebookDataset;

  return (
    <div data-testid="casebook-directory">
      <p className="page-kicker">Research · Policy Assessment Casebook {RESEARCH_RELEASE}</p>
      <h1 className="page-title">Investigations</h1>
      <p className="lede">
        Four published policy investigations from the evidence synthesis. Each keeps its research
        question, dated baseline, analytical sections, and source qualifications — without new
        policy research, rankings, or causal conclusions.
      </p>

      <div className="action-row" style={{ marginBottom: '1rem' }}>
        <Link
          to="/casebook/source"
          className="btn btn--secondary"
          data-testid="casebook-source-link"
        >
          Methodology &amp; source document
        </Link>
        <Link to="/claims" className="btn btn--ghost">
          Evidence library
        </Link>
        <Link to="/comparison" className="btn btn--ghost">
          Compare policies
        </Link>
      </div>

      <p className="meta-line" style={{ marginBottom: '1.25rem' }}>
        Evidence cutoff {RESEARCH_CUTOFF} · Correction pass {RESEARCH_CORRECTION_PASS} · Source{' '}
        <span className="mono">{provenance.sourceFile}</span> · SHA-256{' '}
        <span className="mono">{provenance.sourceContentSha256.slice(0, 12)}…</span>
      </p>

      <p className="notice" style={{ marginBottom: '1.5rem', maxWidth: '60rem' }} data-testid="membership-overlap-note">
        Direct cited-claim counts come from the validated atlas{' '}
        <span className="mono">casebook_cases</span> field. Memberships overlap and represent
        direct citation (including common front-matter rules), not exhaustive relevance, evidence
        quality, or policy performance.
      </p>

      <ol className="investigation-list">
        {RESEARCH_CASES.map((researchCase, index) => {
          const parsed = casebookDataset.cases.find((c) => c.id === researchCase.id);
          const meta = CASE_DERIVED_META[researchCase.id];
          const citedCount = atlasMembershipIds(allClaims, researchCase.id).length;
          return (
            <li
              key={researchCase.id}
              className="investigation-item"
              data-testid={`casebook-card-${researchCase.id}`}
            >
              <p className="meta-line" style={{ margin: 0 }}>
                Investigation {index + 1} · <span className="mono">{researchCase.id}</span>
              </p>
              <h2>
                <Link to={`/casebook/${researchCase.id}`}>{researchCase.title}</Link>
              </h2>
              <dl className="detail-list">
                <dt>Research question</dt>
                <dd>{researchCase.researchQuestion}</dd>
                <dt>Analytical focus</dt>
                <dd>{meta.analyticalFocus}</dd>
                <dt>Assessment boundary</dt>
                <dd>{meta.assessmentBoundary}</dd>
                <dt>Direct cited claims</dt>
                <dd>
                  <strong
                    className="tabular"
                    data-testid={`casebook-count-${researchCase.id}`}
                  >
                    {citedCount}
                  </strong>
                  {parsed ? (
                    <span className="meta-line">
                      {' '}
                      · {parsed.sections.length} analytical sections · body citations{' '}
                      {parsed.bodyClaimIds.length} · membership {parsed.membershipClaimIds.length}
                    </span>
                  ) : null}
                </dd>
              </dl>
              <div className="action-row">
                <Link
                  to={`/casebook/${researchCase.id}`}
                  className="btn btn--primary"
                  data-testid={`open-case-${researchCase.id}`}
                >
                  Open investigation
                </Link>
                <Link
                  to={claimsExplorerHref({ cases: [researchCase.id] })}
                  className="btn btn--secondary"
                  data-testid={`casebook-claims-${researchCase.id}`}
                >
                  Case evidence subset
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
