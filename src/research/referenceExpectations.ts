/**
 * Fixed v0.1.1 release reference expectations for independent integrity tests.
 * These are verification anchors — presentation values must still be computed
 * dynamically from the loaded dataset / taxonomies.
 */

import type { ClaimStatus } from './constants';
import type {
  CaseId,
  MechanismFamilyId,
  MechanismId,
  OutcomeStageId,
} from './taxonomy';

export const V011_EXPECTED_STATUS_COUNTS: Record<ClaimStatus, number> = {
  verified_legal_fact: 9,
  empirical_finding: 14,
  administrative_determination: 2,
  absence_of_finding: 6,
  maintained_assumption: 5,
  unresolved_hypothesis: 4,
  contested_claim: 3,
};

export const V011_EXPECTED_TOTAL_CLAIMS = 43 as const;

export const V011_EXPECTED_CASE_MEMBERSHIP: Record<CaseId, number> = {
  Case1: 20,
  Case2: 17,
  Case3: 14,
  Case4: 12,
};

export const V011_EXPECTED_CASE_TITLES: Record<CaseId, string> = {
  Case1: 'Undeveloped supermarket sites',
  Case2: 'Foreign greenfield grocery investment',
  Case3: 'Differentiated entry and scale-up',
  Case4: 'Supermarket acquisition oversight',
};

/** Exact-tag claim counts (research coverage, not causal importance). */
export const V011_EXPECTED_EXACT_MECHANISM_COUNTS: Record<string, number> = {
  M1: 2,
  M1a: 5,
  M1b: 6,
  M1c: 17,
  M2: 2,
  M2a: 3,
  M2b: 2,
  M3: 2,
  M3a: 2,
  M3b: 4,
  M4: 2,
  M4a: 5,
  M4b: 10,
  M5: 2,
  M5a: 2,
  M6: 1,
  M6a: 12,
  M6b: 3,
};

/** Family-expanded unique claim counts. */
export const V011_EXPECTED_FAMILY_MECHANISM_COUNTS: Record<
  MechanismFamilyId,
  number
> = {
  M1: 24,
  M2: 5,
  M3: 7,
  M4: 17,
  M5: 4,
  M6: 14,
};

export const V011_EXPECTED_OUTCOME_COUNTS: Record<OutcomeStageId, number> = {
  O1: 31,
  O2: 16,
  O3: 4,
  O4: 6,
  O5: 16,
  O6: 11,
};

/** Family × exact-outcome unique co-tag counts (6×6). */
export const V011_EXPECTED_MECHANISM_OUTCOME_MATRIX: Record<
  MechanismFamilyId,
  Record<OutcomeStageId, number>
> = {
  M1: { O1: 23, O2: 11, O3: 2, O4: 3, O5: 7, O6: 5 },
  M2: { O1: 3, O2: 5, O3: 2, O4: 2, O5: 1, O6: 1 },
  M3: { O1: 1, O2: 2, O3: 3, O4: 2, O5: 6, O6: 6 },
  M4: { O1: 10, O2: 5, O3: 2, O4: 4, O5: 10, O6: 7 },
  M5: { O1: 3, O2: 4, O3: 2, O4: 1, O5: 1, O6: 1 },
  M6: { O1: 12, O2: 5, O3: 1, O4: 1, O5: 4, O6: 2 },
};

/** Families first, then exact submechanisms — matches listAllNavigableMechanismIds(). */
export const V011_EXPECTED_NAVIGABLE_MECHANISM_IDS: readonly MechanismId[] = [
  'M1',
  'M2',
  'M3',
  'M4',
  'M5',
  'M6',
  'M1a',
  'M1b',
  'M1c',
  'M2a',
  'M2b',
  'M3a',
  'M3b',
  'M4a',
  'M4b',
  'M5a',
  'M6a',
  'M6b',
] as const;
