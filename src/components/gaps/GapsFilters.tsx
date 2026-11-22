import { useState, type ReactNode } from 'react';
import { CASE_IDS, MECHANISM_FAMILY_IDS, OUTCOME_STAGE_IDS } from '@/research/taxonomy';
import { CLAIM_STATUSES } from '@/research/constants';
import {
  RESEARCH_AGENDA_PROGRAMMES,
} from '@/research/gapsRequirements';
import {
  OBSERVATION_ROLE_LABELS,
  OBSERVATION_ROLES,
  RESEARCH_REQUIREMENT_TYPE_LABELS,
  RESEARCH_REQUIREMENT_TYPES,
  type ObservationRole,
  type ResearchRequirementType,
} from '@/research/gapsSchema';
import type { GapsFilterState } from '@/research/gapsQueries';
import type { ClaimStatus } from '@/research/constants';
import type { CaseId, MechanismFamilyId, OutcomeStageId } from '@/research/taxonomy';
import type { ResearchAgendaProgrammeId } from '@/research/gapsSchema';

function toggleInList<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

const EMPTY_FILTERS: GapsFilterState = {
  cases: [],
  mechanisms: [],
  mechanismFamilies: [],
  outcomes: [],
  statuses: [],
  requirementTypes: [],
  observationRoles: [],
  agenda: null,
  claimId: null,
};

function activeFilterCount(filters: GapsFilterState): number {
  return (
    filters.cases.length +
    filters.mechanisms.length +
    filters.mechanismFamilies.length +
    filters.outcomes.length +
    filters.statuses.length +
    filters.requirementTypes.length +
    filters.observationRoles.length +
    (filters.agenda ? 1 : 0) +
    (filters.claimId ? 1 : 0)
  );
}

/** Filters start expanded except on narrow viewports, where the list should come first. */
function initialFiltersOpen(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
  return window.matchMedia('(min-width: 900px)').matches;
}

function CheckPill({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label className="check-pill">
      <input type="checkbox" checked={checked} onChange={onChange} />
      {children}
    </label>
  );
}

export function GapsFilters({
  filters,
  onChange,
}: {
  filters: GapsFilterState;
  onChange: (next: GapsFilterState) => void;
}) {
  const [open, setOpen] = useState(initialFiltersOpen);
  const activeCount = activeFilterCount(filters);

  return (
    <details
      className="toolbar"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      data-testid="gaps-filters-panel"
    >
      <summary
        style={{ cursor: 'pointer', fontWeight: 600, minHeight: '2.25rem', display: 'flex', alignItems: 'center' }}
      >
        Filter research requirements
        {activeCount > 0 ? ` · ${activeCount} active` : ''}
      </summary>
      <form
        className="stack"
        style={{ marginTop: '0.75rem' }}
        data-testid="gaps-filters"
        onSubmit={(e) => e.preventDefault()}
      >
        <p className="small-note small-note--subtle">
          Metadata filters select organisational subsets — they do not invent research
          relationships.
        </p>

        <div className="gaps-filter-grid">
          <fieldset className="filter-group">
            <legend>Case</legend>
            <div className="check-grid">
              {CASE_IDS.map((caseId) => (
                <CheckPill
                  key={caseId}
                  checked={filters.cases.includes(caseId)}
                  onChange={() =>
                    onChange({
                      ...filters,
                      cases: toggleInList(filters.cases, caseId as CaseId),
                    })
                  }
                >
                  <span className="mono">{caseId}</span>
                </CheckPill>
              ))}
            </div>
          </fieldset>

          <fieldset className="filter-group">
            <legend>Outcome</legend>
            <div className="check-grid">
              {OUTCOME_STAGE_IDS.map((outcomeId) => (
                <CheckPill
                  key={outcomeId}
                  checked={filters.outcomes.includes(outcomeId)}
                  onChange={() =>
                    onChange({
                      ...filters,
                      outcomes: toggleInList(filters.outcomes, outcomeId as OutcomeStageId),
                    })
                  }
                >
                  <span className="mono">{outcomeId}</span>
                </CheckPill>
              ))}
            </div>
          </fieldset>

          <fieldset className="filter-group">
            <legend>Mechanism family</legend>
            <div className="check-grid">
              {MECHANISM_FAMILY_IDS.map((familyId) => (
                <CheckPill
                  key={familyId}
                  checked={filters.mechanismFamilies.includes(familyId)}
                  onChange={() =>
                    onChange({
                      ...filters,
                      mechanismFamilies: toggleInList(
                        filters.mechanismFamilies,
                        familyId as MechanismFamilyId,
                      ),
                    })
                  }
                >
                  <span className="mono">{familyId}</span>
                </CheckPill>
              ))}
            </div>
            <p className="small-note small-note--subtle">
              Family filters expand via the registry (e.g. M1 → M1∪M1a∪M1b∪M1c). Exact-tag{' '}
              <span className="mono">mechanism=</span> URLs remain available.
            </p>
          </fieldset>

          <fieldset className="filter-group">
            <legend>Referenced claim status</legend>
            <div className="check-grid">
              {CLAIM_STATUSES.map((status) => (
                <CheckPill
                  key={status}
                  checked={filters.statuses.includes(status)}
                  onChange={() =>
                    onChange({
                      ...filters,
                      statuses: toggleInList(filters.statuses, status as ClaimStatus),
                    })
                  }
                >
                  <span className="mono" style={{ fontSize: 'var(--c-fs-xs)' }}>
                    {status}
                  </span>
                </CheckPill>
              ))}
            </div>
            <p className="small-note small-note--subtle">
              Status is the original atlas field — never derived from claim ID prefixes.
            </p>
          </fieldset>

          <fieldset className="filter-group">
            <legend>Requirement type</legend>
            <div className="check-grid">
              {RESEARCH_REQUIREMENT_TYPES.map((type) => (
                <CheckPill
                  key={type}
                  checked={filters.requirementTypes.includes(type)}
                  onChange={() =>
                    onChange({
                      ...filters,
                      requirementTypes: toggleInList(
                        filters.requirementTypes,
                        type as ResearchRequirementType,
                      ),
                    })
                  }
                >
                  {RESEARCH_REQUIREMENT_TYPE_LABELS[type]}
                </CheckPill>
              ))}
            </div>
          </fieldset>

          <fieldset className="filter-group">
            <legend>Observation role</legend>
            <div className="check-grid">
              {OBSERVATION_ROLES.map((role) => (
                <CheckPill
                  key={role}
                  checked={filters.observationRoles.includes(role)}
                  onChange={() =>
                    onChange({
                      ...filters,
                      observationRoles: toggleInList(
                        filters.observationRoles,
                        role as ObservationRole,
                      ),
                    })
                  }
                >
                  {OBSERVATION_ROLE_LABELS[role]}
                </CheckPill>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="filter-group" style={{ maxWidth: '28rem' }}>
          <label
            htmlFor="gaps-agenda"
            style={{
              fontSize: 'var(--c-fs-xs)',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'var(--color-ink-muted)',
            }}
          >
            Research agenda programme
          </label>
          <select
            id="gaps-agenda"
            className="control-select"
            value={filters.agenda ?? ''}
            onChange={(e) =>
              onChange({
                ...filters,
                agenda: e.target.value ? (e.target.value as ResearchAgendaProgrammeId) : null,
              })
            }
          >
            <option value="">All programmes</option>
            {RESEARCH_AGENDA_PROGRAMMES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <p className="small-note small-note--subtle">
            Agenda programmes are organisational groupings, not newly published findings.
          </p>
        </div>

        {filters.claimId || filters.mechanisms.length > 0 ? (
          <p className="small-note" data-testid="gaps-active-special-filters">
            Active special filters:{' '}
            {filters.claimId ? <span className="mono">claim={filters.claimId}</span> : null}
            {filters.claimId && filters.mechanisms.length > 0 ? ' · ' : null}
            {filters.mechanisms.length > 0 ? (
              <span className="mono">mechanism={filters.mechanisms.join(',')}</span>
            ) : null}
          </p>
        ) : null}

        <div className="action-row">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => onChange(EMPTY_FILTERS)}
          >
            Clear filters
          </button>
        </div>
      </form>
    </details>
  );
}
