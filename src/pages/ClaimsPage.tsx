import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { allClaims } from '@/data/researchDataset';
import { ClaimFiltersPanel } from '@/components/claims/ClaimFilters';
import { ClaimsTable } from '@/components/claims/ClaimsTable';
import {
  collectPresentStatuses,
  collectUniqueCases,
  collectUniqueMechanisms,
  collectUniqueOutcomes,
  filterClaims,
  filtersAreActive,
  type ClaimFilters,
} from '@/research/queries';
import {
  collectIgnoredFilterParams,
  dimensionsEqualExceptSearch,
  ignoredFilterParamsAreEmpty,
  parseFiltersFromSearchParams,
  serializeFiltersToSearchParams,
} from '@/research/urlFilters';

const SEARCH_URL_DEBOUNCE_MS = 200;

/**
 * Committed filter state is the URL. A local search draft keeps typing responsive;
 * non-search dimensions always read from and write to the query string immediately.
 */
export function ClaimsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const committed = useMemo(
    () => parseFiltersFromSearchParams(searchParams),
    [searchParams],
  );

  const [searchDraft, setSearchDraft] = useState(committed.search);
  const searchDraftRef = useRef(searchDraft);
  searchDraftRef.current = searchDraft;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchDraft(committed.search);
  }, [committed.search]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const filters: ClaimFilters = useMemo(
    () => ({ ...committed, search: searchDraft }),
    [committed, searchDraft],
  );

  const setFilters = useCallback(
    (next: ClaimFilters) => {
      setSearchDraft(next.search);

      const dimsUnchanged = dimensionsEqualExceptSearch(committed, next);
      if (dimsUnchanged) {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          setSearchParams(
            serializeFiltersToSearchParams({
              ...committed,
              search: searchDraftRef.current,
            }),
            { replace: true },
          );
        }, SEARCH_URL_DEBOUNCE_MS);
        return;
      }

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      setSearchParams(serializeFiltersToSearchParams(next), { replace: false });
    },
    [committed, setSearchParams],
  );

  const ignored = useMemo(
    () => collectIgnoredFilterParams(searchParams),
    [searchParams],
  );

  const availableStatuses = useMemo(() => collectPresentStatuses(allClaims), []);
  const availableMechanisms = useMemo(() => collectUniqueMechanisms(allClaims), []);
  const availableOutcomes = useMemo(() => collectUniqueOutcomes(allClaims), []);
  const availableCases = useMemo(() => collectUniqueCases(allClaims), []);

  const matched = useMemo(() => filterClaims(allClaims, filters), [filters]);
  const active = filtersAreActive(filters);

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-ink">Claims Explorer</h1>
        <p className="max-w-3xl text-sm text-ink-muted">
          Browse all {allClaims.length} authentic research claims from the Policy Claims Atlas.
          Status labels preserve the published vocabulary; hypotheses are not styled as established
          findings. Outcomes O1–O6 remain distinct. Filters sync to the URL for shareable views.
        </p>
        {!ignoredFilterParamsAreEmpty(ignored) ? (
          <p
            className="text-sm text-warn"
            role="status"
            data-testid="ignored-filter-params"
          >
            Ignored unknown URL filter value
            {ignored.statuses.length + ignored.cases.length + ignored.outcomes.length === 1
              ? ''
              : 's'}
            :{' '}
            <span className="font-mono">
              {[
                ...ignored.statuses.map((v) => `status=${v}`),
                ...ignored.cases.map((v) => `case=${v}`),
                ...ignored.outcomes.map((v) => `outcome=${v}`),
              ].join(', ')}
            </span>
            . Valid filters still apply. Unknown mechanism tags are kept as exact-tag filters.
          </p>
        ) : null}
      </header>

      <ClaimFiltersPanel
        filters={filters}
        onChange={setFilters}
        availableStatuses={availableStatuses}
        availableMechanisms={availableMechanisms}
        availableOutcomes={availableOutcomes}
        availableCases={availableCases}
        matchCount={matched.length}
        totalCount={allClaims.length}
        active={active}
      />

      <ClaimsTable claims={matched} />
    </div>
  );
}
