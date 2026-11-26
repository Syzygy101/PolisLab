import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { allClaims } from '@/data/researchDataset';
import { ClaimFiltersPanel } from '@/components/claims/ClaimFilters';
import {
  ClaimsTable,
  CompareBar,
  type ExplorerReturnState,
} from '@/components/claims/ClaimsTable';
import { ClaimInspector } from '@/components/claims/ClaimInspector';
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
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useMediaMin } from '@/hooks/useMediaMin';

const SEARCH_URL_DEBOUNCE_MS = 200;

/** Viewport width at which the master-detail inspector layout is used. */
const INSPECTOR_MIN_WIDTH_PX = 1100;

/** Stable key for the non-search filter location that owns a pending search draft. */
function dimensionScopeKey(filters: ClaimFilters): string {
  return [
    filters.statuses.join('\0'),
    filters.admissibilities.join('\0'),
    filters.mechanisms.join('\0'),
    filters.mechanismFamilies.join('\0'),
    filters.outcomes.join('\0'),
    filters.cases.join('\0'),
    filters.literatureSources.join('\0'),
    filters.sourceUrl,
    filters.sort,
  ].join('|');
}

/**
 * Committed filter state is the URL. A local search draft keeps typing responsive;
 * non-search dimensions always read from and write to the query string immediately.
 *
 * Pending search drafts and debounce timers are scoped to the dimension location
 * that created them. Navigating Back/Forward to a different subset abandons the
 * draft so a late debounce cannot overwrite the restored URL.
 */
export function ClaimsPage() {
  useDocumentTitle('Evidence library');

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [inspectId, setInspectId] = useState<string | null>(null);
  const wide = useMediaMin(INSPECTOR_MIN_WIDTH_PX);
  const mountedRef = useRef(true);

  const committed = useMemo(
    () => parseFiltersFromSearchParams(searchParams),
    [searchParams],
  );

  const [searchDraft, setSearchDraft] = useState(committed.search);
  const searchDraftRef = useRef(searchDraft);
  searchDraftRef.current = searchDraft;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftScopeRef = useRef(dimensionScopeKey(committed));

  const clearPendingSearchTimer = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearPendingSearchTimer();
    };
  }, [clearPendingSearchTimer]);

  useEffect(() => {
    const nextScope = dimensionScopeKey(committed);
    if (nextScope !== draftScopeRef.current) {
      // Location that owned the draft changed (Back/Forward, filter chip, etc.).
      clearPendingSearchTimer();
      draftScopeRef.current = nextScope;
      setSearchDraft(committed.search);
      return;
    }
    // Same dimension scope: sync draft when committed search changes externally
    // and no timer is pending (e.g. Reset filters clearing q).
    if (!debounceRef.current) {
      setSearchDraft(committed.search);
    }
  }, [committed, clearPendingSearchTimer]);

  const committedScope = dimensionScopeKey(committed);
  const searchBelongsToLocation = committedScope === draftScopeRef.current;
  const effectiveSearch = searchBelongsToLocation ? searchDraft : committed.search;

  const filters: ClaimFilters = useMemo(
    () => ({ ...committed, search: effectiveSearch }),
    [committed, effectiveSearch],
  );

  const setFilters = useCallback(
    (next: ClaimFilters) => {
      setSearchDraft(next.search);

      const dimsUnchanged = dimensionsEqualExceptSearch(committed, next);
      if (dimsUnchanged) {
        clearPendingSearchTimer();
        const committedSnapshot = committed;
        const scopeAtSchedule = dimensionScopeKey(committedSnapshot);
        draftScopeRef.current = scopeAtSchedule;
        debounceRef.current = setTimeout(() => {
          debounceRef.current = null;
          if (!mountedRef.current) {
            return;
          }
          const live = parseFiltersFromSearchParams(
            new URLSearchParams(window.location.search),
          );
          // Abandon if the browser location no longer matches the drafting scope.
          if (dimensionScopeKey(live) !== scopeAtSchedule) {
            return;
          }
          setSearchParams(
            serializeFiltersToSearchParams({
              ...live,
              search: searchDraftRef.current,
            }),
            { replace: true },
          );
        }, SEARCH_URL_DEBOUNCE_MS);
        return;
      }

      clearPendingSearchTimer();
      draftScopeRef.current = dimensionScopeKey(next);
      setSearchParams(serializeFiltersToSearchParams(next), { replace: false });
    },
    [committed, setSearchParams, clearPendingSearchTimer],
  );

  /**
   * Synchronously commit the search draft into the current history entry so
   * delayed debounce callbacks cannot overwrite a later route, and so browser
   * back / copy-link see the intended research subset.
   */
  const commitPendingSearch = useCallback(() => {
    clearPendingSearchTimer();
    const live = parseFiltersFromSearchParams(
      new URLSearchParams(window.location.search),
    );
    const next: ClaimFilters = {
      ...live,
      search: searchDraftRef.current,
    };
    // Only commit into the location that owns this draft.
    if (dimensionScopeKey(live) !== draftScopeRef.current) {
      setSearchDraft(live.search);
      return;
    }
    if (filtersEqual(next, live)) {
      return;
    }
    const params = serializeFiltersToSearchParams(next);
    const qs = params.toString();
    const target = qs ? `/claims?${qs}` : '/claims';
    const current = `${window.location.pathname}${window.location.search}`;
    if (current !== target) {
      window.history.replaceState(window.history.state, '', target);
    }
    setSearchParams(params, { replace: true });
  }, [setSearchParams, clearPendingSearchTimer]);

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

  // Inspector shows the explicitly inspected record, else the first visible result.
  const inspected =
    matched.find((claim) => claim.claim_id === inspectId) ?? matched[0] ?? null;

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
    ...ignored.mechanismFamilies.map((v) => `mechanism_family=${v}`),
    ...ignored.sorts.map((v) => `sort=${v}`),
  ];

  return (
    <div className="research-module space-y-4" data-testid="claims-page">
      <header className="research-module-header">
        <p className="page-kicker">Evidence</p>
        <h1 className="page-title">Evidence library</h1>
        <p className="lede" style={{ maxWidth: '60rem' }}>
          Search {allClaims.length} published claims, inspect the underlying evidence, or select two
          records to compare.
        </p>
        <details className="guide-disclosure">
          <summary>How to read a claim</summary>
          <p>Read the research status and the permitted use separately. An unresolved hypothesis
            remains open even if it is relevant to a policy comparison. Filters sync to the URL.</p>
        </details>
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

      <CompareBar
        selectedIds={selectedIds}
        compareHref={comparisonPath}
        onClearSelection={() => setSelectedIds([])}
        explorerReturnState={explorerReturnState}
        onBeforeNavigate={commitPendingSearch}
      />

      <p className="meta-line">
        Row text is a preview, not a summary.{' '}
        {wide
          ? 'Select a row to inspect the complete record; each ID opens its stable page.'
          : 'Open a record for the complete claim and all 18 source fields.'}
      </p>

      <div className={`claims-layout${wide ? ' claims-layout--split' : ''}`}>
        <ClaimsTable
          claims={matched}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          explorerReturnState={explorerReturnState}
          onBeforeNavigate={commitPendingSearch}
          wide={wide}
          inspectedId={inspected?.claim_id ?? null}
          onInspect={setInspectId}
        />

        {wide ? (
          <aside className="inspector" aria-label="Record inspector" data-testid="inspector">
            {inspected ? (
              <ClaimInspector
                claim={inspected}
                explorerReturnState={explorerReturnState}
                onBeforeNavigate={commitPendingSearch}
              />
            ) : (
              <p className="inspector-empty">
                No record to inspect. Adjust the filters to see matching claims.
              </p>
            )}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
