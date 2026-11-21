import type { Claim } from './schema';
import type { ClaimStatus } from './constants';
import { CLAIM_STATUSES } from './constants';

export interface ClaimFilters {
  search: string;
  statuses: ClaimStatus[];
  mechanisms: string[];
  outcomes: string[];
  cases: string[];
}

export const EMPTY_FILTERS: ClaimFilters = {
  search: '',
  statuses: [],
  mechanisms: [],
  outcomes: [],
  cases: [],
};

function includesIgnoreCase(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function claimMatchesSearch(claim: Claim, search: string): boolean {
  const q = search.trim();
  if (!q) {
    return true;
  }

  const fields = [
    claim.claim_id,
    claim.exact_claim,
    claim.primary_source_title,
    claim.what_source_establishes,
    claim.limitations_external_validity,
    claim.competing_mechanism_or_contrary_evidence,
    claim.observation_that_would_alter_assessment,
    claim.pinpoint,
    claim.institutional_geographic_scope,
    claim.admissibility_conditions,
    claim.mechanism_ids,
    claim.outcome_ids,
    claim.casebook_cases,
    claim.literature_src_ids,
  ];

  return fields.some((field) => includesIgnoreCase(field, q));
}

/**
 * Filter claims for the Claims Explorer.
 * Within each multi-select dimension, match if the claim includes at least one
 * selected value (OR). Across dimensions, filters combine with AND.
 * Results are sorted deterministically by claim_id.
 */
export function filterClaims(claims: Claim[], filters: ClaimFilters): Claim[] {
  const statusSet = new Set(filters.statuses);

  return claims
    .filter((claim) => {
      if (!claimMatchesSearch(claim, filters.search)) {
        return false;
      }
      if (statusSet.size > 0 && !statusSet.has(claim.status)) {
        return false;
      }
      if (
        filters.mechanisms.length > 0 &&
        !filters.mechanisms.some((m) => claim.mechanisms.includes(m))
      ) {
        return false;
      }
      if (
        filters.outcomes.length > 0 &&
        !filters.outcomes.some((o) => claim.outcomes.includes(o))
      ) {
        return false;
      }
      if (filters.cases.length > 0 && !filters.cases.some((c) => claim.cases.includes(c))) {
        return false;
      }
      return true;
    })
    .slice()
    .sort((a, b) => a.claim_id.localeCompare(b.claim_id));
}

export function collectUniqueMechanisms(claims: Claim[]): string[] {
  return [...new Set(claims.flatMap((c) => c.mechanisms))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function collectUniqueOutcomes(claims: Claim[]): string[] {
  return [...new Set(claims.flatMap((c) => c.outcomes))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function collectUniqueCases(claims: Claim[]): string[] {
  return [...new Set(claims.flatMap((c) => c.cases))].sort((a, b) => a.localeCompare(b));
}

export function collectPresentStatuses(claims: Claim[]): ClaimStatus[] {
  const present = new Set(claims.map((c) => c.status));
  return CLAIM_STATUSES.filter((status) => present.has(status));
}

export function filtersAreActive(filters: ClaimFilters): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.statuses.length > 0 ||
    filters.mechanisms.length > 0 ||
    filters.outcomes.length > 0 ||
    filters.cases.length > 0
  );
}
