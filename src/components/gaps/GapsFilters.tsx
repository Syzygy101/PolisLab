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

export function GapsFilters({
  filters,
  onChange,
}: {
  filters: GapsFilterState;
  onChange: (next: GapsFilterState) => void;
}) {
  return (
    <form
      className="space-y-4 border border-line bg-paper-raised p-4"
      data-testid="gaps-filters"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink">Filter research requirements</h2>
        <p className="text-[11px] text-ink-subtle">
          Metadata filters select organisational subsets — they do not invent research relationships.
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          Case
        </legend>
        <div className="flex flex-wrap gap-2">
          {CASE_IDS.map((caseId) => (
            <label key={caseId} className="flex items-center gap-1.5 text-sm text-ink">
              <input
                type="checkbox"
                checked={filters.cases.includes(caseId)}
                onChange={() =>
                  onChange({
                    ...filters,
                    cases: toggleInList(filters.cases, caseId as CaseId),
                  })
                }
              />
              <span className="font-mono text-xs">{caseId}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          Mechanism family
        </legend>
        <div className="flex flex-wrap gap-2">
          {MECHANISM_FAMILY_IDS.map((familyId) => (
            <label key={familyId} className="flex items-center gap-1.5 text-sm text-ink">
              <input
                type="checkbox"
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
              />
              <span className="font-mono text-xs">{familyId}</span>
            </label>
          ))}
        </div>
        <p className="text-[11px] text-ink-subtle">
          Family filters expand via the registry (e.g. M1 → M1∪M1a∪M1b∪M1c). Exact-tag{' '}
          <span className="font-mono">mechanism=</span> URLs remain available.
        </p>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          Outcome
        </legend>
        <div className="flex flex-wrap gap-2">
          {OUTCOME_STAGE_IDS.map((outcomeId) => (
            <label key={outcomeId} className="flex items-center gap-1.5 text-sm text-ink">
              <input
                type="checkbox"
                checked={filters.outcomes.includes(outcomeId)}
                onChange={() =>
                  onChange({
                    ...filters,
                    outcomes: toggleInList(filters.outcomes, outcomeId as OutcomeStageId),
                  })
                }
              />
              <span className="font-mono text-xs">{outcomeId}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          Referenced claim status
        </legend>
        <div className="flex flex-wrap gap-2">
          {CLAIM_STATUSES.map((status) => (
            <label key={status} className="flex items-center gap-1.5 text-sm text-ink">
              <input
                type="checkbox"
                checked={filters.statuses.includes(status)}
                onChange={() =>
                  onChange({
                    ...filters,
                    statuses: toggleInList(filters.statuses, status as ClaimStatus),
                  })
                }
              />
              <span className="font-mono text-[11px]">{status}</span>
            </label>
          ))}
        </div>
        <p className="text-[11px] text-ink-subtle">
          Status is the original atlas field — never derived from claim ID prefixes.
        </p>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          Requirement type
        </legend>
        <div className="flex flex-wrap gap-2">
          {RESEARCH_REQUIREMENT_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-1.5 text-sm text-ink">
              <input
                type="checkbox"
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
              />
              <span className="text-xs">{RESEARCH_REQUIREMENT_TYPE_LABELS[type]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          Observation role
        </legend>
        <div className="flex flex-wrap gap-2">
          {OBSERVATION_ROLES.map((role) => (
            <label key={role} className="flex items-center gap-1.5 text-sm text-ink">
              <input
                type="checkbox"
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
              />
              <span className="text-xs">{OBSERVATION_ROLE_LABELS[role]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-1">
        <label htmlFor="gaps-agenda" className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          Research agenda programme
        </label>
        <select
          id="gaps-agenda"
          className="w-full max-w-md border border-line bg-paper px-2 py-1.5 text-sm"
          value={filters.agenda ?? ''}
          onChange={(e) =>
            onChange({
              ...filters,
              agenda: e.target.value
                ? (e.target.value as ResearchAgendaProgrammeId)
                : null,
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
        <p className="text-[11px] text-ink-subtle">
          Agenda programmes are organisational groupings, not newly published findings.
        </p>
      </div>

      {filters.claimId || filters.mechanisms.length > 0 ? (
        <p className="text-xs text-ink-muted" data-testid="gaps-active-special-filters">
          Active special filters:{' '}
          {filters.claimId ? (
            <span className="font-mono">claim={filters.claimId}</span>
          ) : null}
          {filters.claimId && filters.mechanisms.length > 0 ? ' · ' : null}
          {filters.mechanisms.length > 0 ? (
            <span className="font-mono">mechanism={filters.mechanisms.join(',')}</span>
          ) : null}
        </p>
      ) : null}

      <button
        type="button"
        className="border border-line px-3 py-1.5 text-sm text-ink hover:bg-neutral-soft"
        onClick={() =>
          onChange({
            cases: [],
            mechanisms: [],
            mechanismFamilies: [],
            outcomes: [],
            statuses: [],
            requirementTypes: [],
            observationRoles: [],
            agenda: null,
            claimId: null,
          })
        }
      >
        Clear filters
      </button>
    </form>
  );
}
