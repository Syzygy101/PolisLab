import type { ClaimStatus } from '@/research/constants';
import {
  EMPTY_FILTERS,
  type ClaimFilters as Filters,
} from '@/research/queries';

interface ClaimFiltersProps {
  filters: Filters;
  onChange: (next: Filters) => void;
  availableStatuses: ClaimStatus[];
  availableMechanisms: string[];
  availableOutcomes: string[];
  availableCases: string[];
  matchCount: number;
  totalCount: number;
  active: boolean;
}

function toggleValue<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function ClaimFiltersPanel({
  filters,
  onChange,
  availableStatuses,
  availableMechanisms,
  availableOutcomes,
  availableCases,
  matchCount,
  totalCount,
  active,
}: ClaimFiltersProps) {
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
            placeholder="Claim ID, text, source title, limitations…"
            className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-subtle"
          />
        </div>
        <div
          className="text-sm text-ink-muted"
          data-testid="match-count"
          aria-live="polite"
        >
          <span className="font-medium text-ink">{matchCount}</span> of {totalCount} claims
          {active ? ' match filters' : ' shown'}
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...EMPTY_FILTERS })}
          disabled={!active}
          className="border border-line px-3 py-2 text-sm text-ink-muted enabled:hover:bg-neutral-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear filters
        </button>
      </div>

      <FilterGroup
        legend="Status"
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

      <p className="text-xs text-ink-subtle">
        Mechanism, outcome, and case controls are exact-tag filters (parsed identifiers). Selecting{' '}
        <span className="font-mono">M1</span> matches records tagged <span className="font-mono">M1</span>{' '}
        only — not every <span className="font-mono">M1*</span> submechanism. Within a dimension,
        selections combine with OR; across dimensions, filters combine with AND.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
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
