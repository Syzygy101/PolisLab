/**
 * Fixed v0.1.1 release reference expectations for independent integrity tests.
 * These are verification anchors — presentation values must still be computed
 * dynamically from the loaded dataset / taxonomies.
 */

import type { ClaimStatus } from './constants';
import type { CaseId } from './taxonomy';

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
