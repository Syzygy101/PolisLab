import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { allClaims } from '@/data/researchDataset';
import { ClaimFiltersPanel } from '@/components/claims/ClaimFilters';
import {
  ClaimsTable,
  type ExplorerReturnState,
} from '@/components/claims/ClaimsTable';
import { compareHref } from '@/research/compareUrl';
import {
  collectPresentAdmissibilities,
  collectPresentStatuses,
  collectUniqueCases,
  collectUniqueLiteratureSources,
  collectUniqueMechanisms,
  collectUniqueOutcomes,
  filterClaims,
  filtersAreActive,
  type ClaimFilters,
} from '@/research/queries';
import {
  collectIgnoredFilterParams,
  dimensionsEqualExceptSearch,
  filtersEqual,
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const mountedRef = useRef(true);

  const committed = useMemo(
    () => parseFiltersFromSearchParams(searchParams),
    [searchParams],
  );

  const [searchDraft, setSearchDraft] = useState(committed.search);
  const searchDraftRef = useRef(searchDraft);
  searchDraftRef.current = searchDraft;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    setSearchDraft(committed.search);
  }, [committed.search]);

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
        const committedSnapshot = committed;
        debounceRef.current = setTimeout(() => {
          debounceRef.current = null;
          if (!mountedRef.current) {
            return;
          }
          setSearchParams(
            serializeFiltersToSearchParams({
              ...committedSnapshot,
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

  /**
   * Synchronously commit the search draft into the current history entry so
   * delayed debounce callbacks cannot overwrite a later route, and so browser
   * back / copy-link see the intended research subset.
   */
  const commitPendingSearch = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    const next: ClaimFilters = {
      ...committed,
      search: searchDraftRef.current,
    };
    if (filtersEqual(next, committed)) {
      return;
    }
    const params = serializeFiltersToSearchParams(next);
    const qs = params.toString();
    const target = qs ? `/claims?${qs}` : '/claims';
    const current = `${window.location.pathname}${window.location.search}`;
    if (current !== target) {
      window.history.replaceState(window.history.state, '', target);
    }
    // Keep React Router searchParams in sync without pushing a new entry.
    setSearchParams(params, { replace: true });
  }, [committed, setSearchParams]);

  const explorerReturnState: ExplorerReturnState = useMemo(
    () => ({
      explorerSearch: serializeFiltersToSearchParams(filters).toString(),
    }),
    [filters],
  );

  const ignored = useMemo(
    () => collectIgnoredFilterParams(searchParams),
    [searchParams],
  );

  const availableStatuses = useMemo(() => collectPresentStatuses(allClaims), []);
  const availableAdmissibilities = useMemo(
    () => collectPresentAdmissibilities(allClaims),
    [],
  );
  const availableMechanisms = useMemo(() => collectUniqueMechanisms(allClaims), []);
  const availableOutcomes = useMemo(() => collectUniqueOutcomes(allClaims), []);
  const availableCases = useMemo(() => collectUniqueCases(allClaims), []);
  const availableLiterature = useMemo(
    () => collectUniqueLiteratureSources(allClaims),
    [],
  );

  const matched = useMemo(() => filterClaims(allClaims, filters), [filters]);
  const active = filtersAreActive(filters);

  const comparisonPath =
    selectedIds.length === 2
      ? compareHref({ a: selectedIds[0], b: selectedIds[1] })
      : null;

  function toggleSelect(claimId: string) {
    setSelectedIds((current) => {
      if (current.includes(claimId)) {
        return current.filter((id) => id !== claimId);
      }
      if (current.length >= 2) {
        return current;
      }
      return [...current, claimId];
    });
  }

  const ignoredParts = [
    ...ignored.statuses.map((v) => `status=${v}`),
    ...ignored.admissibilities.map((v) => `admissibility=${v}`),
    ...ignored.cases.map((v) => `case=${v}`),
    ...ignored.outcomes.map((v) => `outcome=${v}`),
    ...ignored.sorts.map((v) => `sort=${v}`),
  ];

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-ink">Claims Explorer</h1>
        <p className="max-w-3xl text-sm text-ink-muted">
          Evidence investigation workspace over all {allClaims.length} authentic research claims
          from the Policy Claims Atlas. Evidentiary status and policy-comparison admissibility
          remain distinct. Hypotheses are not styled as established findings. Filters sync to the
          URL for shareable research subsets.
        </p>
        {!ignoredFilterParamsAreEmpty(ignored) ? (
          <p
            className="text-sm text-warn"
            role="status"
            data-testid="ignored-filter-params"
          >
            Ignored unknown URL filter value
            {ignoredParts.length === 1 ? '' : 's'}:{' '}
            <span className="font-mono">{ignoredParts.join(', ')}</span>. Valid filters still
            apply. Unknown mechanism and literature tags are kept as exact-tag filters.
          </p>
        ) : null}
      </header>

      <ClaimFiltersPanel
        filters={filters}
        onChange={setFilters}
        onBeforeCopyLink={commitPendingSearch}
        availableStatuses={availableStatuses}
        availableAdmissibilities={availableAdmissibilities}
        availableMechanisms={availableMechanisms}
        availableOutcomes={availableOutcomes}
        availableCases={availableCases}
        availableLiterature={availableLiterature}
        matchCount={matched.length}
        totalCount={allClaims.length}
        active={active}
      />

      <ClaimsTable
        claims={matched}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        compareHref={comparisonPath}
        onClearSelection={() => setSelectedIds([])}
        explorerReturnState={explorerReturnState}
        onBeforeNavigate={commitPendingSearch}
      />
    </div>
  );
}
