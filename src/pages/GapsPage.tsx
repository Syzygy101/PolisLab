import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { allClaims } from '@/data/researchDataset';
import { GapsFilters } from '@/components/gaps/GapsFilters';
import { RequirementList } from '@/components/gaps/RequirementList';
import {
  AssessmentChangingThemes,
  GapsEntryPoints,
  GapsIntegrityNote,
} from '@/components/gaps/GapsOverviewPanels';
import {
  computeGapsAtlasCounts,
  filterResearchRequirements,
} from '@/research/gapsQueries';
import { parseGapsState, serializeGapsSearchParams } from '@/research/gapsUrl';
import { GAPS_REGISTRY } from '@/research/gapsRequirements';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function GapsPage() {
  useDocumentTitle('Research gaps');

  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, notices } = useMemo(
    () => parseGapsState(searchParams),
    [searchParams],
  );
  const counts = useMemo(() => computeGapsAtlasCounts(allClaims), []);
  const filtered = useMemo(
    () => filterResearchRequirements(filters, allClaims),
    [filters],
  );
  const returnSearch = serializeGapsSearchParams(filters).toString();

  return (
    <div data-testid="gaps-page">
      <p className="page-kicker">Evidence</p>
      <h1 className="page-title">Research gaps</h1>
      <p className="lede" style={{ maxWidth: '60rem' }}>
        Identify unresolved propositions, limitations, competing explanations, assessment-changing
        observations, and source-grounded future research requirements from the published atlas and
        casebook. This module does not conduct new empirical research, invent falsification tests
        the source does not state, or automatically close research gaps.
      </p>
      <p className="meta-line" style={{ marginBottom: '1rem' }}>
        Registry {GAPS_REGISTRY.provenance.registryVersion} · {GAPS_REGISTRY.requirements.length}{' '}
        casebook §9 requirements · research {GAPS_REGISTRY.provenance.researchRelease}
      </p>

      <nav aria-label="On this page" style={{ marginBottom: '1.5rem' }}>
        <ul className="tag-list">
          <li>
            <a className="tag-link" href="#requirements">
              Research requirements ({GAPS_REGISTRY.requirements.length})
            </a>
          </li>
          <li>
            <a className="tag-link" href="#entry-points">
              Entry points
            </a>
          </li>
          <li>
            <a className="tag-link" href="#assessment-themes">
              Assessment-changing themes
            </a>
          </li>
        </ul>
      </nav>

      <div className="stack stack--loose">
        <GapsIntegrityNote counts={counts} />
        <GapsEntryPoints counts={counts} />
        <AssessmentChangingThemes />

        <section
          className="stack"
          id="requirements"
          style={{ scrollMarginTop: '1.5rem' }}
          aria-labelledby="requirements-heading"
        >
          <div className="req-item-head" style={{ alignItems: 'baseline' }}>
            <h2 id="requirements-heading" className="section-title" style={{ marginBottom: 0 }}>
              Research requirements
            </h2>
            <p className="result-count" data-testid="gaps-match-count" role="status">
              Showing {filtered.length} of {GAPS_REGISTRY.requirements.length}
            </p>
          </div>

          {notices.length > 0 ? (
            <ul className="notice" style={{ margin: 0, listStyle: 'none' }} data-testid="gaps-url-notices">
              {notices.map((n) => (
                <li key={`${n.code}-${n.raw}`}>{n.message}</li>
              ))}
            </ul>
          ) : null}

          <GapsFilters
            filters={filters}
            onChange={(next) => {
              setSearchParams(serializeGapsSearchParams(next), { replace: false });
            }}
          />

          <RequirementList requirements={filtered} returnSearch={returnSearch} />
        </section>

        <p className="small-note">
          Continue in the{' '}
          <Link to="/claims" className="underline underline-offset-2">
            Evidence library
          </Link>
          ,{' '}
          <Link to="/casebook" className="underline underline-offset-2">
            investigations
          </Link>
          ,{' '}
          <Link to="/mechanisms" className="underline underline-offset-2">
            mechanisms
          </Link>
          , or{' '}
          <Link to="/comparison" className="underline underline-offset-2">
            policy comparison
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
