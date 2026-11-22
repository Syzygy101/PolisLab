import type { AdmissibilityValue, ClaimStatus } from './constants';
import { ADMISSIBILITY_VALUES, CLAIM_STATUSES } from './constants';
import type { Claim } from './schema';
import {
  expandMechanismFamilyTags,
  type MechanismFamilyId,
} from './taxonomy';

/**
 * Free-text search fields (case-insensitive substring match after trim).
 *
 * Primary evidence fields (Build 03 contract):
 * - claim_id
 * - exact_claim
 * - primary_source_title
 * - what_source_establishes
 * - limitations_external_validity
 * - competing_mechanism_or_contrary_evidence
 * - admissibility_conditions
 * - literature_src_ids (raw source string; also matches parsed literature IDs)
 *
 * Additional discoverability fields retained from Build 01/02:
 * - observation_that_would_alter_assessment
 * - pinpoint
 * - institutional_geographic_scope
 * - mechanism_ids / outcome_ids / casebook_cases (raw identifier strings)
 * - primary_source_url (exact URL substring; for source-reference investigation)
 *
 * Matching behaviour:
 * - Case-insensitive `includes` over each field independently (OR across fields).
 * - Whitespace-only queries are ignored (treated as no search).
 * - Exact claim IDs remain retrievable because `claim_id` is searched.
 * - No fuzzy, semantic, or AI-powered matching.
 */
export const CLAIM_SEARCH_FIELDS = [
  'claim_id',
  'exact_claim',
  'primary_source_title',
  'what_source_establishes',
  'limitations_external_validity',
  'competing_mechanism_or_contrary_evidence',
  'admissibility_conditions',
  'literature_src_ids',
  'observation_that_would_alter_assessment',
  'pinpoint',
  'institutional_geographic_scope',
  'mechanism_ids',
  'outcome_ids',
  'casebook_cases',
  'primary_source_url',
] as const;

export type ClaimSortKey = 'claim_id' | 'primary_source_title';

export interface ClaimFilters {
  search: string;
  statuses: ClaimStatus[];
  /** Policy-comparison admissibility vocabulary: yes | no | conditional. */
  admissibilities: AdmissibilityValue[];
  /**
   * Exact mechanism tags (e.g. M1, M1b). Selecting M1 matches only records
   * tagged M1 — not M1a/M1b/M1c. Backward-compatible with `mechanism=` URLs.
   */
  mechanisms: string[];
  /**
   * Family-expanded mechanism filters (e.g. M1 → unique records tagged
   * M1, M1a, M1b, or M1c via the explicit parent-child registry).
   * Distinct from `mechanisms` exact-tag semantics (`mechanism_family=` URL).
   */
  mechanismFamilies: MechanismFamilyId[];
  outcomes: string[];
  cases: string[];
  /** Exact literature-source identifiers (parsed tags). */
  literatureSources: string[];
  /**
   * Exact primary source URL match (trimmed; case-sensitive against stored URL).
   * Empty string means no URL filter.
   */
  sourceUrl: string;
  sort: ClaimSortKey;
}

export const EMPTY_FILTERS: ClaimFilters = {
  search: '',
  statuses: [],
  admissibilities: [],
  mechanisms: [],
  mechanismFamilies: [],
  outcomes: [],
  cases: [],
  literatureSources: [],
  sourceUrl: '',
  sort: 'claim_id',
};

/**
 * Union of exact mechanism tags and family-expanded tags for the mechanism
 * dimension. Within the dimension (exact ∪ family), match is OR; across
 * dimensions, filters remain AND.
 */
export function resolveMechanismFilterTags(filters: ClaimFilters): string[] {
  const tags = new Set<string>();
  for (const tag of filters.mechanisms) {
    const trimmed = tag.trim();
    if (trimmed) {
      tags.add(trimmed);
    }
  }
  for (const family of filters.mechanismFamilies) {
    for (const tag of expandMechanismFamilyTags(family)) {
      tags.add(tag);
    }
  }
  return [...tags];
}

function includesIgnoreCase(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function claimMatchesSearch(claim: Claim, search: string): boolean {
  const q = search.trim();
  if (!q) {
    return true;
  }

  return CLAIM_SEARCH_FIELDS.some((field) => includesIgnoreCase(claim[field], q));
}

function compareClaims(a: Claim, b: Claim, sort: ClaimSortKey): number {
  if (sort === 'primary_source_title') {
    const byTitle = a.primary_source_title.localeCompare(b.primary_source_title);
    if (byTitle !== 0) {
      return byTitle;
    }
  }
  return a.claim_id.localeCompare(b.claim_id);
}

/**
 * Filter claims for the Claims Explorer.
 *
 * Semantics:
 * - Within each multi-select dimension, match if the claim includes at least one
 *   selected value (OR).
 * - Across dimensions (and with search / source URL), filters combine with AND.
 * - `mechanisms` remains exact-tag (M1 ≠ M1a/M1b/M1c).
 * - `mechanismFamilies` expands via the explicit parent-child registry
 *   (family M1 → M1 ∪ M1a ∪ M1b ∪ M1c), then OR with any exact tags.
 * - Outcome / case / literature filters remain exact-tag over parsed IDs.
 * - Related-evidence overlap stays exact-match and is unaffected by family params.
 * - `sourceUrl` requires an exact trim match against `primary_source_url`.
 * - Results are sorted deterministically by `sort` (default claim_id), with
 *   claim_id as a stable tie-breaker for title sort.
 *
 * Admissibility is distinct from evidentiary status and is not a truth score.
 */
export function filterClaims(claims: Claim[], filters: ClaimFilters): Claim[] {
  const statusSet = new Set(filters.statuses);
  const admissibilitySet = new Set(filters.admissibilities);
  const mechanismTags = resolveMechanismFilterTags(filters);
  const sourceUrl = filters.sourceUrl.trim();

  return claims
    .filter((claim) => {
      if (!claimMatchesSearch(claim, filters.search)) {
        return false;
      }
      if (statusSet.size > 0 && !statusSet.has(claim.status)) {
        return false;
      }
      if (
        admissibilitySet.size > 0 &&
        !admissibilitySet.has(claim.admissible_in_policy_comparison)
      ) {
        return false;
      }
      if (
        mechanismTags.length > 0 &&
        !mechanismTags.some((m) => claim.mechanisms.includes(m))
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
      if (
        filters.literatureSources.length > 0 &&
        !filters.literatureSources.some((id) => claim.literatureSources.includes(id))
      ) {
        return false;
      }
      if (sourceUrl.length > 0 && claim.primary_source_url.trim() !== sourceUrl) {
        return false;
      }
      return true;
    })
    .slice()
    .sort((a, b) => compareClaims(a, b, filters.sort));
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

export function collectUniqueLiteratureSources(claims: Claim[]): string[] {
  return [...new Set(claims.flatMap((c) => c.literatureSources))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function collectPresentStatuses(claims: Claim[]): ClaimStatus[] {
  const present = new Set(claims.map((c) => c.status));
  return CLAIM_STATUSES.filter((status) => present.has(status));
}

export function collectPresentAdmissibilities(
  claims: Claim[],
): AdmissibilityValue[] {
  const present = new Set(claims.map((c) => c.admissible_in_policy_comparison));
  return ADMISSIBILITY_VALUES.filter((value) => present.has(value));
}

export function filtersAreActive(filters: ClaimFilters): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.statuses.length > 0 ||
    filters.admissibilities.length > 0 ||
    filters.mechanisms.length > 0 ||
    filters.mechanismFamilies.length > 0 ||
    filters.outcomes.length > 0 ||
    filters.cases.length > 0 ||
    filters.literatureSources.length > 0 ||
    filters.sourceUrl.trim() !== ''
  );
}
