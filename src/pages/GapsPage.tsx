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

export function GapsPage() {
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
    <div className="space-y-10" data-testid="gaps-page">
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Evidence Gaps and Falsification
        </h1>
        <p className="max-w-3xl text-sm text-ink-muted">
          Identify unresolved propositions, limitations, competing explanations, assessment-changing
          observations, and source-grounded future research requirements from the published atlas
          and casebook. This module does not conduct new empirical research, invent falsification
          tests the source does not state, or automatically close research gaps.
        </p>
        <p className="max-w-3xl text-xs text-ink-subtle">
          Registry {GAPS_REGISTRY.provenance.registryVersion} · {GAPS_REGISTRY.requirements.length}{' '}
          casebook §9 requirements · research {GAPS_REGISTRY.provenance.researchRelease}
        </p>
      </header>

      <GapsIntegrityNote counts={counts} />
      <GapsEntryPoints counts={counts} />
      <AssessmentChangingThemes />

      <section className="space-y-4" id="requirements">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl font-semibold text-ink">
            Research requirements
          </h2>
          <p className="text-sm text-ink-muted" data-testid="gaps-match-count">
            Showing {filtered.length} of {GAPS_REGISTRY.requirements.length}
          </p>
        </div>

        {notices.length > 0 ? (
          <ul
            className="space-y-1 border border-line bg-neutral-soft px-3 py-2 text-xs text-ink-muted"
            data-testid="gaps-url-notices"
          >
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

      <p className="text-sm text-ink-muted">
        Continue in the{' '}
        <Link to="/claims" className="text-accent no-underline hover:underline">
          Claims Explorer
        </Link>
        ,{' '}
        <Link to="/casebook" className="text-accent no-underline hover:underline">
          Casebook
        </Link>
        ,{' '}
        <Link to="/mechanisms" className="text-accent no-underline hover:underline">
          Mechanisms
        </Link>
        , or{' '}
        <Link to="/comparison" className="text-accent no-underline hover:underline">
          Policy Comparison
        </Link>
        .
      </p>
    </div>
  );
}
