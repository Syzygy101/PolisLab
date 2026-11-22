import { useEffect, useState } from 'react';
import type { AdmissibilityValue, ClaimStatus } from '@/research/constants';
import {
  EMPTY_FILTERS,
  type ClaimFilters as Filters,
  type ClaimSortKey,
} from '@/research/queries';
import { serializeFiltersToSearchParams } from '@/research/urlFilters';
import {
  MECHANISM_FAMILY_IDS,
  type MechanismFamilyId,
} from '@/research/taxonomy';

interface ClaimFiltersProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  /** Commit pending search into the URL before copying the shareable link. */
  onBeforeCopyLink?: () => void;
  availableStatuses: ClaimStatus[];
  availableAdmissibilities: AdmissibilityValue[];
  availableMechanisms: string[];
  availableOutcomes: string[];
  availableCases: string[];
  availableLiterature: string[];
  matchCount: number;
  totalCount: number;
  active: boolean;
}

function toggleValue<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

type ActiveChip =
  | { key: string; label: string; remove: (filters: Filters) => Filters };

function buildActiveChips(filters: Filters): ActiveChip[] {
  const chips: ActiveChip[] = [];
  if (filters.search.trim()) {
    chips.push({
      key: 'q',
      label: `Search: ${filters.search.trim()}`,
      remove: (f) => ({ ...f, search: '' }),
    });
  }
  for (const status of filters.statuses) {
    chips.push({
      key: `status:${status}`,
      label: `Status: ${status.replaceAll('_', ' ')}`,
      remove: (f) => ({
        ...f,
        statuses: f.statuses.filter((s) => s !== status),
      }),
    });
  }
  for (const value of filters.admissibilities) {
    chips.push({
      key: `adm:${value}`,
      label: `Admissibility: ${value}`,
      remove: (f) => ({
        ...f,
        admissibilities: f.admissibilities.filter((a) => a !== value),
      }),
    });
  }
  for (const mechanism of filters.mechanisms) {
    chips.push({
      key: `mech:${mechanism}`,
      label: `Mechanism (exact): ${mechanism}`,
      remove: (f) => ({
        ...f,
        mechanisms: f.mechanisms.filter((m) => m !== mechanism),
      }),
    });
  }
  for (const family of filters.mechanismFamilies) {
    chips.push({
      key: `mechfam:${family}`,
      label: `Mechanism family: ${family}`,
      remove: (f) => ({
        ...f,
        mechanismFamilies: f.mechanismFamilies.filter((m) => m !== family),
      }),
    });
  }
  for (const outcome of filters.outcomes) {
    chips.push({
      key: `out:${outcome}`,
      label: `Outcome: ${outcome}`,
      remove: (f) => ({
        ...f,
        outcomes: f.outcomes.filter((o) => o !== outcome),
      }),
    });
  }
  for (const caseId of filters.cases) {
    chips.push({
      key: `case:${caseId}`,
      label: `Case: ${caseId}`,
      remove: (f) => ({
        ...f,
        cases: f.cases.filter((c) => c !== caseId),
      }),
    });
  }
  for (const literature of filters.literatureSources) {
    chips.push({
      key: `lit:${literature}`,
      label: `Literature: ${literature}`,
      remove: (f) => ({
        ...f,
        literatureSources: f.literatureSources.filter((l) => l !== literature),
      }),
    });
  }
  if (filters.sourceUrl.trim()) {
    chips.push({
      key: 'source_url',
      label: `Source URL: ${filters.sourceUrl.trim()}`,
      remove: (f) => ({ ...f, sourceUrl: '' }),
    });
  }
  return chips;
}

export function ClaimFiltersPanel({
  filters,
  onChange,
  onBeforeCopyLink,
  availableStatuses,
  availableAdmissibilities,
  availableMechanisms,
  availableOutcomes,
  availableCases,
  availableLiterature,
  matchCount,
  totalCount,
  active,
}: ClaimFiltersProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const chips = buildActiveChips(filters);

  // Mechanism, family, and literature filters live behind progressive disclosure.
  const advancedActiveCount =
    filters.mechanisms.length +
    filters.mechanismFamilies.length +
    filters.literatureSources.length;
  const [advancedOpen, setAdvancedOpen] = useState(advancedActiveCount > 0);
  useEffect(() => {
    // Never hide an active filter: open when a URL / chip / history change activates one.
    if (advancedActiveCount > 0) {
      setAdvancedOpen(true);
    }
  }, [advancedActiveCount]);

  async function copyShareableLink() {
    onBeforeCopyLink?.();
    const params = serializeFiltersToSearchParams(filters);
    const qs = params.toString();
    const path = qs ? `/claims?${qs}` : '/claims';
    const url = `${window.location.origin}${path}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setCopyState('copied');
      } else {
        setCopyState('failed');
      }
    } catch {
      setCopyState('failed');
    }
    window.setTimeout(() => setCopyState('idle'), 2500);
  }

  return (
    <section aria-label="Claim filters" className="toolbar">
      <div className="toolbar-row" style={{ alignItems: 'flex-end' }}>
        <div className="search-field" style={{ flexBasis: '24rem' }}>
          <label htmlFor="claim-search" className="block text-sm font-semibold text-ink">
            Search
          </label>
          <input
            id="claim-search"
            type="search"
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            placeholder="Claim ID, claim text, source title, limitations, literature IDs…"
            className="control-input mt-1 w-full"
            style={{ minHeight: '2.75rem', fontSize: '1rem' }}
            data-testid="claims-search"
            aria-describedby="claim-search-help"
          />
        </div>
        <div>
          <label htmlFor="claim-sort" className="block text-xs font-medium text-ink-muted">
            Sort
          </label>
          <select
            id="claim-sort"
            value={filters.sort}
            onChange={(event) =>
              onChange({
                ...filters,
                sort: event.target.value as ClaimSortKey,
              })
            }
            className="control-select mt-1"
            style={{ minHeight: '2.75rem' }}
          >
            <option value="claim_id">Claim ID</option>
            <option value="primary_source_title">Source title</option>
          </select>
        </div>
      </div>

      <div className="toolbar-row">
        <div
          className="result-count"
          data-testid="match-count"
          aria-live="polite"
        >
          <span>{matchCount}</span> of {totalCount} claims
          {active ? ' match filters' : ' shown'}
        </div>
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => void copyShareableLink()}
          className="btn btn--secondary"
          data-testid="copy-filter-link"
        >
          Copy link
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...EMPTY_FILTERS, sort: filters.sort })}
          disabled={!active}
          className="btn btn--ghost"
        >
          Reset filters
        </button>
      </div>

      <p
        id="claim-search-help"
        className="meta-line"
        role="status"
        aria-live="polite"
        data-testid="copy-link-feedback"
      >
        {copyState === 'copied'
          ? 'Link copied to clipboard.'
          : copyState === 'failed'
            ? 'Could not copy automatically — copy the address bar URL instead.'
            : 'Case-insensitive phrase match across claim ID, claim text, source fields, limitations, conditions, and literature IDs; plain multi-word searches also match words in the same field. No fuzzy or semantic search.'}
      </p>

      <div className="claims-filter-grid">
        <FilterGroup
          legend="Evidentiary status"
          values={availableStatuses}
          selected={filters.statuses}
          onToggle={(value) =>
            onChange({
              ...filters,
              statuses: toggleValue(filters.statuses, value as ClaimStatus),
            })
          }
          formatLabel={(value) => value.replaceAll('_', ' ')}
        />
        <div>
          <FilterGroup
            legend="Admissibility in policy comparison"
            values={availableAdmissibilities}
            selected={filters.admissibilities}
            onToggle={(value) =>
              onChange({
                ...filters,
                admissibilities: toggleValue(
                  filters.admissibilities,
                  value as AdmissibilityValue,
                ),
              })
            }
          />
          <p className="meta-line mt-1">
            Admissibility is not a truth verdict; status and admissibility stay distinct.
          </p>
        </div>
        <FilterGroup
          legend="Case (exact tag)"
          values={availableCases}
          selected={filters.cases}
          onToggle={(value) =>
            onChange({
              ...filters,
              cases: toggleValue(filters.cases, value),
            })
          }
        />
        <FilterGroup
          legend="Outcome (exact tag)"
          values={availableOutcomes}
          selected={filters.outcomes}
          onToggle={(value) =>
            onChange({
              ...filters,
              outcomes: toggleValue(filters.outcomes, value),
            })
          }
        />
      </div>

      <details
        className="advanced-filters"
        open={advancedOpen}
        onToggle={(event) => setAdvancedOpen(event.currentTarget.open)}
        data-testid="advanced-filters"
      >
        <summary>
          Advanced filters: mechanism, family, literature
          {advancedActiveCount > 0 ? ` (${advancedActiveCount} active)` : ''}
        </summary>
        <div className="mt-3 space-y-3">
          <p className="meta-line">
            <span className="font-medium text-ink-muted">Mechanism (exact tag)</span> keeps{' '}
            <span className="mono">mechanism=M1</span> semantics — records tagged{' '}
            <span className="mono">M1</span> only.{' '}
            <span className="font-medium text-ink-muted">Mechanism family</span> uses{' '}
            <span className="mono">mechanism_family=M1</span> and expands via the explicit
            registry to unique records tagged M1, M1a, M1b, or M1c. Exact and family selections
            within the mechanism dimension combine with OR; with status, admissibility, case,
            outcome, literature, search, and source URL they combine with AND. Related-evidence
            overlap remains exact-tag. Outcome, case, and literature controls stay exact-tag.
          </p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <FilterGroup
              legend="Mechanism (exact tag)"
              values={availableMechanisms}
              selected={filters.mechanisms}
              onToggle={(value) =>
                onChange({
                  ...filters,
                  mechanisms: toggleValue(filters.mechanisms, value),
                })
              }
            />
            <FilterGroup
              legend="Mechanism family"
              values={[...MECHANISM_FAMILY_IDS]}
              selected={filters.mechanismFamilies}
              onToggle={(value) =>
                onChange({
                  ...filters,
                  mechanismFamilies: toggleValue(
                    filters.mechanismFamilies,
                    value as MechanismFamilyId,
                  ),
                })
              }
              formatLabel={(value) => `${value} family`}
            />
            <FilterGroup
              legend="Literature source (exact tag)"
              values={availableLiterature}
              selected={filters.literatureSources}
              onToggle={(value) =>
                onChange({
                  ...filters,
                  literatureSources: toggleValue(filters.literatureSources, value),
                })
              }
            />
          </div>
        </div>
      </details>

      {chips.length > 0 ? (
        <div
          className="active-filters"
          aria-label="Active filters"
          role="group"
          data-testid="active-filters"
        >
          <span className="font-semibold text-ink">Active filters:</span>
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => onChange(chip.remove(filters))}
              className="filter-chip is-active"
              aria-label={`Remove active filter ${chip.label}`}
            >
              <span className="truncate">{chip.label}</span>
              <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function FilterGroup({
  legend,
  values,
  selected,
  onToggle,
  formatLabel = (v) => v,
}: {
  legend: string;
  values: string[];
  selected: string[];
  onToggle: (value: string) => void;
  formatLabel?: (value: string) => string;
}) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="text-xs font-medium text-ink-muted">{legend}</legend>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {values.map((value) => {
          const isOn = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              aria-pressed={isOn}
              onClick={() => onToggle(value)}
              className={`filter-chip${isOn ? ' is-active' : ''}`}
            >
              {formatLabel(value)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
