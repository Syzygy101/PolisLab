/**
 * URL-based Claims Explorer filter contract (Build 02 / 03 / 05).
 *
 * Query parameters on `/claims`:
 * - `q`           — free-text search (single string; whitespace-only ignored when matching)
 * - `status`      — evidentiary status; repeatable (`?status=a&status=b`)
 * - `admissibility` — policy-comparison admissibility (`yes`|`no`|`conditional`); repeatable
 * - `case`        — casebook case ID (Case1…Case4); repeatable
 * - `outcome`     — exact outcome tag (O1…O6); repeatable
 * - `mechanism`   — exact mechanism tag (e.g. M1, M1a); repeatable — **exact-tag only**
 * - `mechanism_family` — family-expanded mechanism (M1…M6); repeatable
 * - `literature`  — exact literature-source identifier; repeatable
 * - `source_url`  — exact primary source URL match (single value)
 * - `sort`        — `claim_id` (default) or `primary_source_title`
 *
 * Mechanism dimension combination:
 * - `mechanism=M1` retains exact-tag semantics (records tagged M1 only).
 * - `mechanism_family=M1` expands via the explicit registry to M1 ∪ M1a ∪ M1b ∪ M1c.
 * - Exact tags and family expansions within the mechanism dimension combine with OR
 *   (union of resolved tags); across dimensions (status, admissibility, case,
 *   outcome, literature, search, source URL), filters combine with AND.
 *
 * Invalid-value semantics (predictable; documented):
 * - Unknown `status` values: **ignored** (not applied; listed in UI notice).
 * - Unknown `admissibility` values: **ignored**.
 * - Unknown `case` values (not Case1–Case4): **ignored**.
 * - Unknown `outcome` values (not O1–O6): **ignored**.
 * - Unknown `mechanism_family` values (not M1–M6): **ignored**.
 * - Unknown `sort` values: **ignored** (default `claim_id`).
 * - `mechanism` / `literature` values: **retained and applied** as exact-tag
 *   filters even if no claim currently carries the tag (may yield zero matches).
 *   Empty strings ignored.
 * - Duplicate values within a dimension: **deduplicated** (first occurrence wins).
 * - Invalid values are **not rewritten out of the address bar** until the user
 *   changes filters; committed filter state uses only the accepted values.
 *
 * Other semantics:
 * - Clearing filters removes corresponding parameters.
 * - Empty filters yield `/claims` with no query string (default sort omitted).
 * - Related-evidence overlap remains exact-tag (unaffected by `mechanism_family`).
 * - Claim-detail paths `/claims/:claimId` and compare `/claims/compare` are separate.
 *
 * Admissibility is not a truth verdict and is distinct from evidentiary status.
 */

import type { AdmissibilityValue, ClaimStatus } from './constants';
import { ADMISSIBILITY_VALUES, CLAIM_STATUSES } from './constants';
import {
  EMPTY_FILTERS,
  type ClaimFilters,
  type ClaimSortKey,
} from './queries';
import {
  CASE_IDS,
  MECHANISM_FAMILY_IDS,
  OUTCOME_STAGE_IDS,
  isCaseId,
  isMechanismFamilyId,
  isOutcomeStageId,
  type MechanismFamilyId,
} from './taxonomy';

export const URL_FILTER_PARAMS = {
  search: 'q',
  status: 'status',
  admissibility: 'admissibility',
  case: 'case',
  outcome: 'outcome',
  mechanism: 'mechanism',
  mechanismFamily: 'mechanism_family',
  literature: 'literature',
  sourceUrl: 'source_url',
  sort: 'sort',
} as const;

const STATUS_SET = new Set<string>(CLAIM_STATUSES);
const ADMISSIBILITY_SET = new Set<string>(ADMISSIBILITY_VALUES);
const CASE_SET = new Set<string>(CASE_IDS);
const OUTCOME_SET = new Set<string>(OUTCOME_STAGE_IDS);
const MECHANISM_FAMILY_SET = new Set<string>(MECHANISM_FAMILY_IDS);
const SORT_VALUES = new Set<ClaimSortKey>(['claim_id', 'primary_source_title']);

function isClaimStatus(value: string): value is ClaimStatus {
  return STATUS_SET.has(value);
}

function isAdmissibilityValue(value: string): value is AdmissibilityValue {
  return ADMISSIBILITY_SET.has(value);
}

function isClaimSortKey(value: string): value is ClaimSortKey {
  return SORT_VALUES.has(value as ClaimSortKey);
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
 * Invalid status/admissibility/case/outcome/sort/mechanism_family values are dropped;
 * mechanism and literature tags are kept as exact tags.
 */
export function parseFiltersFromSearchParams(
  params: URLSearchParams,
): ClaimFilters {
  const rawSearch = params.get(URL_FILTER_PARAMS.search) ?? '';
  const statuses = uniquePreserveOrder(
    params.getAll(URL_FILTER_PARAMS.status).filter(isClaimStatus),
  ) as ClaimStatus[];
  const admissibilities = uniquePreserveOrder(
    params.getAll(URL_FILTER_PARAMS.admissibility).filter(isAdmissibilityValue),
  ) as AdmissibilityValue[];
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
  const mechanismFamilies = uniquePreserveOrder(
    params
      .getAll(URL_FILTER_PARAMS.mechanismFamily)
      .map((value) => value.trim())
      .filter(isMechanismFamilyId),
  ) as MechanismFamilyId[];
  const literatureSources = uniquePreserveOrder(
    params
      .getAll(URL_FILTER_PARAMS.literature)
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
  );
  const sourceUrl = (params.get(URL_FILTER_PARAMS.sourceUrl) ?? '').trim();
  const sortRaw = params.get(URL_FILTER_PARAMS.sort);
  const sort: ClaimSortKey =
    sortRaw && isClaimSortKey(sortRaw) ? sortRaw : 'claim_id';

  return {
    search: rawSearch,
    statuses,
    admissibilities,
    cases,
    outcomes,
    mechanisms,
    mechanismFamilies,
    literatureSources,
    sourceUrl,
    sort,
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
  for (const value of filters.admissibilities) {
    params.append(URL_FILTER_PARAMS.admissibility, value);
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
  for (const family of filters.mechanismFamilies) {
    params.append(URL_FILTER_PARAMS.mechanismFamily, family);
  }
  for (const literature of filters.literatureSources) {
    params.append(URL_FILTER_PARAMS.literature, literature);
  }
  if (filters.sourceUrl.trim()) {
    params.set(URL_FILTER_PARAMS.sourceUrl, filters.sourceUrl.trim());
  }
  if (filters.sort !== 'claim_id') {
    params.set(URL_FILTER_PARAMS.sort, filters.sort);
  }
  return params;
}

/** Build a `/claims?...` path for Overview deep-links and related navigation. */
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
  admissibilities: string[];
  cases: string[];
  outcomes: string[];
  mechanismFamilies: string[];
  sorts: string[];
}

/** Raw URL values ignored when building committed filter state. */
export function collectIgnoredFilterParams(
  params: URLSearchParams,
): IgnoredFilterParams {
  const sortRaw = params.get(URL_FILTER_PARAMS.sort);
  return {
    statuses: uniquePreserveOrder(
      params
        .getAll(URL_FILTER_PARAMS.status)
        .filter((value) => value.length > 0 && !isClaimStatus(value)),
    ),
    admissibilities: uniquePreserveOrder(
      params
        .getAll(URL_FILTER_PARAMS.admissibility)
        .filter((value) => value.length > 0 && !isAdmissibilityValue(value)),
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
    mechanismFamilies: uniquePreserveOrder(
      params
        .getAll(URL_FILTER_PARAMS.mechanismFamily)
        .map((value) => value.trim())
        .filter(
          (value) => value.length > 0 && !MECHANISM_FAMILY_SET.has(value),
        ),
    ),
    sorts:
      sortRaw && sortRaw.length > 0 && !isClaimSortKey(sortRaw) ? [sortRaw] : [],
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
    ignored.admissibilities.length === 0 &&
    ignored.cases.length === 0 &&
    ignored.outcomes.length === 0 &&
    ignored.mechanismFamilies.length === 0 &&
    ignored.sorts.length === 0
  );
}

export function filtersEqual(a: ClaimFilters, b: ClaimFilters): boolean {
  return (
    a.search === b.search &&
    a.statuses.join('\0') === b.statuses.join('\0') &&
    a.admissibilities.join('\0') === b.admissibilities.join('\0') &&
    a.mechanisms.join('\0') === b.mechanisms.join('\0') &&
    a.mechanismFamilies.join('\0') === b.mechanismFamilies.join('\0') &&
    a.outcomes.join('\0') === b.outcomes.join('\0') &&
    a.cases.join('\0') === b.cases.join('\0') &&
    a.literatureSources.join('\0') === b.literatureSources.join('\0') &&
    a.sourceUrl === b.sourceUrl &&
    a.sort === b.sort
  );
}

export function dimensionsEqualExceptSearch(
  a: ClaimFilters,
  b: ClaimFilters,
): boolean {
  return (
    a.statuses.join('\0') === b.statuses.join('\0') &&
    a.admissibilities.join('\0') === b.admissibilities.join('\0') &&
    a.mechanisms.join('\0') === b.mechanisms.join('\0') &&
    a.mechanismFamilies.join('\0') === b.mechanismFamilies.join('\0') &&
    a.outcomes.join('\0') === b.outcomes.join('\0') &&
    a.cases.join('\0') === b.cases.join('\0') &&
    a.literatureSources.join('\0') === b.literatureSources.join('\0') &&
    a.sourceUrl === b.sourceUrl &&
    a.sort === b.sort
  );
}
