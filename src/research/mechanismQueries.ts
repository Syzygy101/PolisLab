/**
 * Mechanism coverage and family-expanded query helpers (Build 05).
 *
 * Counts are research-coverage metrics (unique co-tagged claims), not causal
 * importance, policy effectiveness, evidence strength, or effect size.
 */

import type { Claim } from './schema';
import {
  EMPTY_FILTERS,
  filterClaims,
  type ClaimFilters,
} from './queries';
import {
  MECHANISM_FAMILIES,
  MECHANISM_FAMILY_IDS,
  MECHANISM_SUBMECHANISM_IDS,
  OUTCOME_STAGE_IDS,
  expandMechanismFamilyTags,
  type MechanismFamilyId,
  type MechanismId,
  type MechanismSubmechanismId,
  type OutcomeStageId,
  isMechanismFamilyId,
  isMechanismSubmechanismId,
} from './taxonomy';
import { claimsExplorerHref } from './urlFilters';

/** Resolve the exact-tag set used by the mechanism dimension after family expansion. */
export function resolveMechanismExactTags(filters: ClaimFilters): string[] {
  const tags = new Set<string>();
  for (const tag of filters.mechanisms) {
    if (tag.trim()) {
      tags.add(tag.trim());
    }
  }
  for (const family of filters.mechanismFamilies) {
    for (const tag of expandMechanismFamilyTags(family)) {
      tags.add(tag);
    }
  }
  return [...tags];
}

export function claimMatchesMechanismDimension(
  claim: Claim,
  filters: ClaimFilters,
): boolean {
  const tags = resolveMechanismExactTags(filters);
  if (tags.length === 0) {
    return true;
  }
  return tags.some((tag) => claim.mechanisms.includes(tag));
}

/** Unique claims with the exact atlas tag. */
export function claimsWithExactMechanism(
  claims: Claim[],
  tag: string,
): Claim[] {
  return filterClaims(claims, { ...EMPTY_FILTERS, mechanisms: [tag] });
}

/** Unique claims matching family-expanded tags for a published family. */
export function claimsWithMechanismFamily(
  claims: Claim[],
  familyId: MechanismFamilyId,
): Claim[] {
  return filterClaims(claims, {
    ...EMPTY_FILTERS,
    mechanismFamilies: [familyId],
  });
}

export function countExactMechanism(claims: Claim[], tag: string): number {
  return claimsWithExactMechanism(claims, tag).length;
}

export function countMechanismFamily(
  claims: Claim[],
  familyId: MechanismFamilyId,
): number {
  return claimsWithMechanismFamily(claims, familyId).length;
}

export function exactMechanismClaimIds(
  claims: Claim[],
  tag: string,
): string[] {
  return claimsWithExactMechanism(claims, tag).map((c) => c.claim_id);
}

export function familyMechanismClaimIds(
  claims: Claim[],
  familyId: MechanismFamilyId,
): string[] {
  return claimsWithMechanismFamily(claims, familyId).map((c) => c.claim_id);
}

/**
 * Unique claims satisfying family-expanded mechanism AND exact outcome tag.
 * Do not sum matrix cells and present the total as distinct claims.
 */
export function claimsForMechanismOutcomeCell(
  claims: Claim[],
  familyId: MechanismFamilyId,
  outcomeId: OutcomeStageId,
): Claim[] {
  return filterClaims(claims, {
    ...EMPTY_FILTERS,
    mechanismFamilies: [familyId],
    outcomes: [outcomeId],
  });
}

export function countMechanismOutcomeCell(
  claims: Claim[],
  familyId: MechanismFamilyId,
  outcomeId: OutcomeStageId,
): number {
  return claimsForMechanismOutcomeCell(claims, familyId, outcomeId).length;
}

export type MechanismOutcomeMatrix = Record<
  MechanismFamilyId,
  Record<OutcomeStageId, number>
>;

export function computeMechanismOutcomeMatrix(
  claims: Claim[],
): MechanismOutcomeMatrix {
  const matrix = {} as MechanismOutcomeMatrix;
  for (const familyId of MECHANISM_FAMILY_IDS) {
    matrix[familyId] = {} as Record<OutcomeStageId, number>;
    for (const outcomeId of OUTCOME_STAGE_IDS) {
      matrix[familyId][outcomeId] = countMechanismOutcomeCell(
        claims,
        familyId,
        outcomeId,
      );
    }
  }
  return matrix;
}

export interface MechanismCoverageRow {
  id: MechanismFamilyId;
  label: string;
  childIds: readonly MechanismSubmechanismId[];
  exactCount: number;
  familyCount: number;
  childExactCounts: Record<string, number>;
}

export function computeMechanismFamilyCoverage(
  claims: Claim[],
): MechanismCoverageRow[] {
  return MECHANISM_FAMILIES.map((family) => ({
    id: family.id,
    label: family.label,
    childIds: family.childIds,
    exactCount: countExactMechanism(claims, family.id),
    familyCount: countMechanismFamily(claims, family.id),
    childExactCounts: Object.fromEntries(
      family.childIds.map((childId) => [
        childId,
        countExactMechanism(claims, childId),
      ]),
    ),
  }));
}

export function claimsExplorerHrefForMechanism(
  id: MechanismId,
  extra: Partial<ClaimFilters> = {},
): string {
  if (isMechanismFamilyId(id)) {
    return claimsExplorerHref({
      ...extra,
      mechanismFamilies: [id],
      mechanisms: extra.mechanisms ?? [],
    });
  }
  return claimsExplorerHref({
    ...extra,
    mechanisms: [id],
  });
}

export function claimsExplorerHrefForMatrixCell(
  familyId: MechanismFamilyId,
  outcomeId: OutcomeStageId,
): string {
  return claimsExplorerHref({
    mechanismFamilies: [familyId],
    outcomes: [outcomeId],
  });
}

export function listAllNavigableMechanismIds(): MechanismId[] {
  return [...MECHANISM_FAMILY_IDS, ...MECHANISM_SUBMECHANISM_IDS];
}

export function isNavigableMechanismId(value: string): value is MechanismId {
  return isMechanismFamilyId(value) || isMechanismSubmechanismId(value);
}
