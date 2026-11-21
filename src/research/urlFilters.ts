/**
 * URL-based Claims Explorer filter contract (Build 02 / 02R).
 *
 * Query parameters on `/claims`:
 * - `q`         — free-text search (single string; whitespace-only ignored when matching)
 * - `status`    — claim status; repeatable (`?status=a&status=b`)
 * - `case`      — casebook case ID (Case1…Case4); repeatable
 * - `outcome`   — exact outcome tag (O1…O6); repeatable
 * - `mechanism` — exact mechanism tag (e.g. M1, M1a); repeatable
 *
 * Invalid-value semantics (predictable; documented):
 * - Unknown `status` values: **ignored** (not applied; listed in UI notice).
 * - Unknown `case` values (not Case1–Case4): **ignored**.
 * - Unknown `outcome` values (not O1–O6): **ignored**.
 * - `mechanism` values: **retained and applied** as exact-tag filters even if no
 *   claim currently carries the tag (may yield zero matches). Empty strings ignored.
 * - Duplicate values within a dimension: **deduplicated** (first occurrence wins).
 * - Invalid values are **not rewritten out of the address bar** until the user
 *   changes filters; committed filter state uses only the accepted values.
 *
 * Other semantics:
 * - Within a dimension, values combine with OR; across dimensions, with AND.
 * - Clearing filters removes corresponding parameters.
 * - Empty filters yield `/claims` with no query string.
 * - Mechanism filtering remains exact-tag (no family expansion).
 * - Claim-detail paths `/claims/:claimId` are unaffected.
 */

import type { ClaimStatus } from './constants';
import { CLAIM_STATUSES } from './constants';
import { EMPTY_FILTERS, type ClaimFilters } from './queries';
import {
  CASE_IDS,
  OUTCOME_STAGE_IDS,
  isCaseId,
  isOutcomeStageId,
} from './taxonomy';

export const URL_FILTER_PARAMS = {
  search: 'q',
  status: 'status',
  case: 'case',
  outcome: 'outcome',
  mechanism: 'mechanism',
} as const;

const STATUS_SET = new Set<string>(CLAIM_STATUSES);
const CASE_SET = new Set<string>(CASE_IDS);
const OUTCOME_SET = new Set<string>(OUTCOME_STAGE_IDS);

function isClaimStatus(value: string): value is ClaimStatus {
  return STATUS_SET.has(value);
}

function uniquePreserveOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      out.push(value);
    }
  }
  return out;
}

/**
 * Parse committed Claims Explorer filters from URLSearchParams.
 * Invalid status/case/outcome values are dropped; mechanism tags are kept as exact tags.
 */
export function parseFiltersFromSearchParams(
  params: URLSearchParams,
): ClaimFilters {
  const rawSearch = params.get(URL_FILTER_PARAMS.search) ?? '';
  const statuses = uniquePreserveOrder(
    params.getAll(URL_FILTER_PARAMS.status).filter(isClaimStatus),
  ) as ClaimStatus[];
  const cases = uniquePreserveOrder(
    params.getAll(URL_FILTER_PARAMS.case).filter(isCaseId),
  );
  const outcomes = uniquePreserveOrder(
    params.getAll(URL_FILTER_PARAMS.outcome).filter(isOutcomeStageId),
  );
  const mechanisms = uniquePreserveOrder(
    params
      .getAll(URL_FILTER_PARAMS.mechanism)
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
  );

  return {
    search: rawSearch,
    statuses,
    cases,
    outcomes,
    mechanisms,
  };
}

/** Serialise committed filters to URLSearchParams; omits empty dimensions. */
export function serializeFiltersToSearchParams(
  filters: ClaimFilters,
): URLSearchParams {
  const params = new URLSearchParams();
  const q = filters.search.trim();
  if (q) {
    params.set(URL_FILTER_PARAMS.search, filters.search);
  }
  for (const status of filters.statuses) {
    params.append(URL_FILTER_PARAMS.status, status);
  }
  for (const caseId of filters.cases) {
    params.append(URL_FILTER_PARAMS.case, caseId);
  }
  for (const outcome of filters.outcomes) {
    params.append(URL_FILTER_PARAMS.outcome, outcome);
  }
  for (const mechanism of filters.mechanisms) {
    params.append(URL_FILTER_PARAMS.mechanism, mechanism);
  }
  return params;
}

/** Build a `/claims?...` path for Overview deep-links. */
export function claimsExplorerHref(
  partial: Partial<ClaimFilters> = {},
): string {
  const filters: ClaimFilters = { ...EMPTY_FILTERS, ...partial };
  const params = serializeFiltersToSearchParams(filters);
  const qs = params.toString();
  return qs ? `/claims?${qs}` : '/claims';
}

export interface IgnoredFilterParams {
  statuses: string[];
  cases: string[];
  outcomes: string[];
}

/** Raw URL values ignored when building committed filter state. */
export function collectIgnoredFilterParams(
  params: URLSearchParams,
): IgnoredFilterParams {
  return {
    statuses: uniquePreserveOrder(
      params
        .getAll(URL_FILTER_PARAMS.status)
        .filter((value) => value.length > 0 && !isClaimStatus(value)),
    ),
    cases: uniquePreserveOrder(
      params
        .getAll(URL_FILTER_PARAMS.case)
        .filter((value) => value.length > 0 && !CASE_SET.has(value)),
    ),
    outcomes: uniquePreserveOrder(
      params
        .getAll(URL_FILTER_PARAMS.outcome)
        .filter((value) => value.length > 0 && !OUTCOME_SET.has(value)),
    ),
  };
}

/** @deprecated Prefer collectIgnoredFilterParams */
export function collectIgnoredStatusParams(params: URLSearchParams): string[] {
  return collectIgnoredFilterParams(params).statuses;
}

export function ignoredFilterParamsAreEmpty(
  ignored: IgnoredFilterParams,
): boolean {
  return (
    ignored.statuses.length === 0 &&
    ignored.cases.length === 0 &&
    ignored.outcomes.length === 0
  );
}

export function filtersEqual(a: ClaimFilters, b: ClaimFilters): boolean {
  return (
    a.search === b.search &&
    a.statuses.join('\0') === b.statuses.join('\0') &&
    a.mechanisms.join('\0') === b.mechanisms.join('\0') &&
    a.outcomes.join('\0') === b.outcomes.join('\0') &&
    a.cases.join('\0') === b.cases.join('\0')
  );
}

export function dimensionsEqualExceptSearch(
  a: ClaimFilters,
  b: ClaimFilters,
): boolean {
  return (
    a.statuses.join('\0') === b.statuses.join('\0') &&
    a.mechanisms.join('\0') === b.mechanisms.join('\0') &&
    a.outcomes.join('\0') === b.outcomes.join('\0') &&
    a.cases.join('\0') === b.cases.join('\0')
  );
}
