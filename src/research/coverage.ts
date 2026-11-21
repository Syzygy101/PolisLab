import type { Claim } from './schema';
import type { ClaimStatus } from './constants';
import { CLAIM_STATUSES } from './constants';
import {
  CASE_IDS,
  MECHANISM_FAMILIES,
  OUTCOME_STAGE_IDS,
  RESEARCH_CASES,
  type CaseId,
  type OutcomeStageId,
} from './taxonomy';
import { filterClaims, EMPTY_FILTERS } from './queries';

/** Count claims by published status, preserving canonical status order. */
export function countClaimsByStatus(
  claims: Claim[],
): Record<ClaimStatus, number> {
  const counts = Object.fromEntries(
    CLAIM_STATUSES.map((status) => [status, 0]),
  ) as Record<ClaimStatus, number>;

  for (const claim of claims) {
    counts[claim.status] += 1;
  }
  return counts;
}

/** Direct case membership: claims listing the case ID in casebook_cases. */
export function countDirectCaseMembership(
  claims: Claim[],
  caseId: CaseId,
): number {
  return filterClaims(claims, { ...EMPTY_FILTERS, cases: [caseId] }).length;
}

export function countAllDirectCaseMemberships(
  claims: Claim[],
): Record<CaseId, number> {
  return Object.fromEntries(
    CASE_IDS.map((id) => [id, countDirectCaseMembership(claims, id)]),
  ) as Record<CaseId, number>;
}

export function countClaimsByOutcome(
  claims: Claim[],
  outcomeId: OutcomeStageId,
): number {
  return filterClaims(claims, { ...EMPTY_FILTERS, outcomes: [outcomeId] }).length;
}

/**
 * Unique claim IDs appearing in any direct case membership.
 * Summing per-case memberships over-counts claims tagged to multiple cases.
 */
export function countUniqueCaseMembers(claims: Claim[]): number {
  const ids = new Set<string>();
  for (const claim of claims) {
    if (claim.cases.some((c) => (CASE_IDS as readonly string[]).includes(c))) {
      ids.add(claim.claim_id);
    }
  }
  return ids.size;
}

export function sumDirectCaseMemberships(claims: Claim[]): number {
  const byCase = countAllDirectCaseMemberships(claims);
  return CASE_IDS.reduce((sum, id) => sum + byCase[id], 0);
}

export interface ResearchCoverageMetrics {
  claimCount: number;
  caseCount: number;
  mechanismFamilyCount: number;
  outcomeStageCount: number;
  statusCounts: Record<ClaimStatus, number>;
  caseMembershipCounts: Record<CaseId, number>;
  uniqueCaseMembers: number;
  summedCaseMemberships: number;
}

export function computeResearchCoverage(claims: Claim[]): ResearchCoverageMetrics {
  return {
    claimCount: claims.length,
    caseCount: RESEARCH_CASES.length,
    mechanismFamilyCount: MECHANISM_FAMILIES.length,
    outcomeStageCount: OUTCOME_STAGE_IDS.length,
    statusCounts: countClaimsByStatus(claims),
    caseMembershipCounts: countAllDirectCaseMemberships(claims),
    uniqueCaseMembers: countUniqueCaseMembers(claims),
    summedCaseMemberships: sumDirectCaseMemberships(claims),
  };
}
