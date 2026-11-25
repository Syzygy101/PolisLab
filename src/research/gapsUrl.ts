/**
 * Evidence Gaps Laboratory URL filter contract (Build 07).
 *
 * Route: `/gaps`
 * Query parameters:
 * - `case` — Case1…Case4; repeatable
 * - `mechanism` — exact mechanism tag; repeatable (exact-tag only)
 * - `mechanism_family` — family-expanded (M1…M6); repeatable
 * - `outcome` — O1…O6; repeatable
 * - `status` — original atlas evidentiary status; filters requirements that
 *   reference at least one claim with that status; repeatable
 * - `type` — research requirement type; repeatable
 * - `role` — observation role; repeatable
 * - `agenda` — research-agenda programme id (single)
 * - `claim` — atlas claim ID; requirements referencing that claim (single)
 *
 * Semantics:
 * - Metadata filters (case / mechanism / outcome / status / type / role / agenda /
 *   claim) select organisational subsets. They do not create substantive research
 *   relationships beyond those curated in the registry.
 * - `mechanism=` retains exact-tag semantics; `mechanism_family=` expands via the
 *   parent→child registry (same as Claims Explorer / Mechanisms).
 * - Within a dimension, values combine with OR; across dimensions, with AND.
 * - Invalid known-vocabulary values (case, outcome, family, status, type, role,
 *   agenda) are ignored and listed in notices; mechanism/claim values are
 *   retained and applied even if unmatched.
 * - Extra unknown query parameters are ignored (not rewritten).
 * - Clearing filters removes corresponding parameters.
 *
 * Detail route: `/gaps/:requirementId` (e.g. `/gaps/REQ-C1-03`).
 *
 * Examples:
 * - `/gaps`
 * - `/gaps?case=Case1&mechanism_family=M1`
 * - `/gaps?agenda=legal-feasibility-institutional`
 * - `/gaps?claim=ATLAS-GAP-002`
 * - `/gaps/REQ-C3-04`
 */

import {
  EMPTY_GAPS_FILTERS,
  isAgendaProgrammeId,
  isClaimStatus,
  isGapsCaseId,
  isObservationRole,
  isResearchRequirementType,
  type GapsFilterState,
  type ObservationRole,
  type ResearchAgendaProgrammeId,
  type ResearchRequirementType,
} from './gapsSchema';
import {
  isMechanismFamilyId,
  isOutcomeStageId,
  type CaseId,
  type MechanismFamilyId,
  type OutcomeStageId,
} from './taxonomy';
import type { ClaimStatus } from './constants';

export const GAPS_ROUTE = '/gaps' as const;

export const GAPS_PARAMS = {
  case: 'case',
  mechanism: 'mechanism',
  mechanismFamily: 'mechanism_family',
  outcome: 'outcome',
  status: 'status',
  type: 'type',
  role: 'role',
  agenda: 'agenda',
  claim: 'claim',
} as const;

export type GapsUrlNoticeCode =
  | 'invalid_case'
  | 'invalid_outcome'
  | 'invalid_mechanism_family'
  | 'invalid_status'
  | 'invalid_type'
  | 'invalid_role'
  | 'invalid_agenda';

export interface GapsUrlNotice {
  code: GapsUrlNoticeCode;
  raw: string;
  message: string;
}

export interface GapsUrlState {
  filters: GapsFilterState;
  notices: GapsUrlNotice[];
}

function dedupe<T>(values: T[]): T[] {
  const seen = new Set<T>();
  const out: T[] = [];
  for (const v of values) {
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function readAll(params: URLSearchParams, name: string): string[] {
  return params
    .getAll(name)
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

export function parseGapsState(params: URLSearchParams): GapsUrlState {
  const notices: GapsUrlNotice[] = [];
  const filters: GapsFilterState = { ...EMPTY_GAPS_FILTERS, cases: [], mechanisms: [], mechanismFamilies: [], outcomes: [], statuses: [], requirementTypes: [], observationRoles: [] };

  const cases: CaseId[] = [];
  for (const raw of readAll(params, GAPS_PARAMS.case)) {
    if (isGapsCaseId(raw)) cases.push(raw);
    else {
      notices.push({
        code: 'invalid_case',
        raw,
        message: `Unknown case "${raw}" was ignored.`,
      });
    }
  }
  filters.cases = dedupe(cases);

  filters.mechanisms = dedupe(readAll(params, GAPS_PARAMS.mechanism));

  const families: MechanismFamilyId[] = [];
  for (const raw of readAll(params, GAPS_PARAMS.mechanismFamily)) {
    if (isMechanismFamilyId(raw)) families.push(raw);
    else {
      notices.push({
        code: 'invalid_mechanism_family',
        raw,
        message: `Unknown mechanism_family "${raw}" was ignored.`,
      });
    }
  }
  filters.mechanismFamilies = dedupe(families);

  const outcomes: OutcomeStageId[] = [];
  for (const raw of readAll(params, GAPS_PARAMS.outcome)) {
    if (isOutcomeStageId(raw)) outcomes.push(raw);
    else {
      notices.push({
        code: 'invalid_outcome',
        raw,
        message: `Unknown outcome "${raw}" was ignored.`,
      });
    }
  }
  filters.outcomes = dedupe(outcomes);

  const statuses: ClaimStatus[] = [];
  for (const raw of readAll(params, GAPS_PARAMS.status)) {
    if (isClaimStatus(raw)) statuses.push(raw);
    else {
      notices.push({
        code: 'invalid_status',
        raw,
        message: `Unknown status "${raw}" was ignored.`,
      });
    }
  }
  filters.statuses = dedupe(statuses);

  const types: ResearchRequirementType[] = [];
  for (const raw of readAll(params, GAPS_PARAMS.type)) {
    if (isResearchRequirementType(raw)) types.push(raw);
    else {
      notices.push({
        code: 'invalid_type',
        raw,
        message: `Unknown requirement type "${raw}" was ignored.`,
      });
    }
  }
  filters.requirementTypes = dedupe(types);

  const roles: ObservationRole[] = [];
  for (const raw of readAll(params, GAPS_PARAMS.role)) {
    if (isObservationRole(raw)) roles.push(raw);
    else {
      notices.push({
        code: 'invalid_role',
        raw,
        message: `Unknown observation role "${raw}" was ignored.`,
      });
    }
  }
  filters.observationRoles = dedupe(roles);

  const agendaValues = readAll(params, GAPS_PARAMS.agenda);
  if (agendaValues.length > 0) {
    const raw = agendaValues[0];
    if (isAgendaProgrammeId(raw)) filters.agenda = raw;
    else {
      notices.push({
        code: 'invalid_agenda',
        raw,
        message: `Unknown agenda "${raw}" was ignored.`,
      });
    }
  }

  const claimValues = readAll(params, GAPS_PARAMS.claim);
  if (claimValues.length > 0) {
    filters.claimId = claimValues[0];
  }

  return { filters, notices };
}

export function serializeGapsSearchParams(
  filters: GapsFilterState,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const c of filters.cases) params.append(GAPS_PARAMS.case, c);
  for (const m of filters.mechanisms) params.append(GAPS_PARAMS.mechanism, m);
  for (const f of filters.mechanismFamilies) {
    params.append(GAPS_PARAMS.mechanismFamily, f);
  }
  for (const o of filters.outcomes) params.append(GAPS_PARAMS.outcome, o);
  for (const s of filters.statuses) params.append(GAPS_PARAMS.status, s);
  for (const t of filters.requirementTypes) params.append(GAPS_PARAMS.type, t);
  for (const r of filters.observationRoles) params.append(GAPS_PARAMS.role, r);
  if (filters.agenda) params.set(GAPS_PARAMS.agenda, filters.agenda);
  if (filters.claimId) params.set(GAPS_PARAMS.claim, filters.claimId);
  return params;
}

export function gapsHref(partial: Partial<GapsFilterState> = {}): string {
  const filters: GapsFilterState = {
    ...EMPTY_GAPS_FILTERS,
    ...partial,
    cases: partial.cases ?? [],
    mechanisms: partial.mechanisms ?? [],
    mechanismFamilies: partial.mechanismFamilies ?? [],
    outcomes: partial.outcomes ?? [],
    statuses: partial.statuses ?? [],
    requirementTypes: partial.requirementTypes ?? [],
    observationRoles: partial.observationRoles ?? [],
    agenda: partial.agenda ?? null,
    claimId: partial.claimId ?? null,
  };
  const qs = serializeGapsSearchParams(filters).toString();
  return qs ? `${GAPS_ROUTE}?${qs}` : GAPS_ROUTE;
}

export function gapsRequirementHref(
  requirementId: string,
  returnSearch?: string,
): string {
  const base = `${GAPS_ROUTE}/${requirementId}`;
  if (!returnSearch) return base;
  return `${base}?from=${encodeURIComponent(returnSearch)}`;
}

/** Build a return path to the gaps overview with current filters. */
export function gapsOverviewReturnHref(search: string): string {
  return search ? `${GAPS_ROUTE}?${search}` : GAPS_ROUTE;
}

export type { ResearchAgendaProgrammeId };
