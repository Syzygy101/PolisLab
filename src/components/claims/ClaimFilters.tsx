import { useState } from 'react';
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
    <section
      aria-label="Claim filters"
      className="space-y-4 border border-line bg-paper-raised p-4"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-[16rem] flex-1">
          <label htmlFor="claim-search" className="block text-xs font-medium text-ink-muted">
            Search
          </label>
          <input
            id="claim-search"
            type="search"
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            placeholder="Claim ID, claim text, source title, limitations, literature IDs…"
            className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-subtle"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="claim-sort" className="text-xs font-medium text-ink-muted">
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
            className="border border-line bg-paper px-2 py-2 text-sm text-ink"
          >
            <option value="claim_id">Claim ID</option>
            <option value="primary_source_title">Source title</option>
          </select>
        </div>
        <div
          className="text-sm text-ink-muted"
          data-testid="match-count"
          aria-live="polite"
        >
          <span className="font-medium text-ink">{matchCount}</span> of {totalCount} claims
          {active ? ' match filters' : ' shown'}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copyShareableLink()}
            className="border border-line px-3 py-2 text-sm text-ink-muted hover:bg-neutral-soft"
            data-testid="copy-filter-link"
          >
            Copy link
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...EMPTY_FILTERS, sort: filters.sort })}
            disabled={!active}
            className="border border-line px-3 py-2 text-sm text-ink-muted enabled:hover:bg-neutral-soft disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reset filters
          </button>
        </div>
      </div>

      <p
        className="text-xs text-ink-subtle"
        role="status"
        aria-live="polite"
        data-testid="copy-link-feedback"
      >
        {copyState === 'copied'
          ? 'Link copied to clipboard.'
          : copyState === 'failed'
            ? 'Could not copy automatically — copy the address bar URL instead.'
            : 'Search is case-insensitive substring match across claim ID, exact claim, source title, what the source establishes, limitations, competing mechanisms, admissibility conditions, literature IDs, and related discoverability fields. No fuzzy or semantic search.'}
      </p>

      {chips.length > 0 ? (
        <div
          className="flex flex-wrap items-center gap-2"
          aria-label="Active filters"
          data-testid="active-filters"
        >
          <span className="text-xs font-medium text-ink-muted">Active:</span>
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => onChange(chip.remove(filters))}
              className="inline-flex max-w-full items-center gap-1 rounded border border-accent/40 bg-accent-soft px-2 py-1 text-left text-[11px] text-accent hover:bg-accent-soft/80"
              aria-label={`Remove active filter ${chip.label}`}
            >
              <span className="truncate">{chip.label}</span>
              <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
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
        <div className="space-y-2">
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
          <p className="text-xs text-ink-subtle">
            Admissibility is not a truth verdict. <span className="font-medium">yes</span> does
            not mean established fact; <span className="font-medium">no</span> does not mean
            falsity. Conditions remain on each claim record.
          </p>
        </div>
      </div>

      <p className="text-xs text-ink-subtle">
        <span className="font-medium text-ink-muted">Mechanism (exact tag)</span> keeps{' '}
        <span className="font-mono">mechanism=M1</span> semantics — records tagged{' '}
        <span className="font-mono">M1</span> only.{" "}
        <span className="font-medium text-ink-muted">Mechanism family</span> uses{" "}
        <span className="font-mono">mechanism_family=M1</span> and expands via the explicit
        registry to unique records tagged M1, M1a, M1b, or M1c. Exact and family selections
        within the mechanism dimension combine with OR; with status, admissibility, case,
        outcome, literature, search, and source URL they combine with AND. Related-evidence
        overlap remains exact-tag. Outcome, case, and literature controls stay exact-tag.
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
    <fieldset>
      <legend className="text-xs font-medium text-ink-muted">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {values.map((value) => {
          const isOn = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              aria-pressed={isOn}
              onClick={() => onToggle(value)}
              className={[
                'rounded border px-2 py-1 font-mono text-[11px]',
                isOn
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-line bg-paper text-ink-muted hover:bg-neutral-soft',
              ].join(' ')}
            >
              {formatLabel(value)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
