/**
 * Casebook source constants and independent membership expectations for v0.1.1.
 * Membership sets are verification anchors derived from the published atlas CSV —
 * not from the application parser under test.
 */

import type { CaseId } from './taxonomy';

export const CASEBOOK_SOURCE_PATH =
  'research/10_policy_assessment_casebook.md' as const;

export const EXPECTED_CASE_COUNT = 4 as const;
export const EXPECTED_SECTIONS_PER_CASE = 10 as const;
export const EXPECTED_TOTAL_SECTIONS = 40 as const;

/** Common hard-rule claim IDs stated in casebook front matter for all four cases. */
export const COMMON_ALL_CASE_RULE_IDS = [
  'ATLAS-ASM-002',
  'ATLAS-CON-003',
] as const;

/**
 * Exact direct-citation membership from research/10_policy_claims_atlas.csv
 * (casebook_cases field). Verified independently of the Markdown parser.
 */
export const V011_EXPECTED_CASE_MEMBERSHIP_SETS: Record<
  CaseId,
  readonly string[]
> = {
  Case1: [
    'ATLAS-ADM-002',
    'ATLAS-ASM-001',
    'ATLAS-ASM-002',
    'ATLAS-CON-003',
    'ATLAS-EMP-001',
    'ATLAS-EMP-002',
    'ATLAS-EMP-003',
    'ATLAS-GAP-001',
    'ATLAS-GAP-004',
    'ATLAS-HYP-001',
    'ATLAS-HYP-002',
    'ATLAS-LEG-003',
    'ATLAS-LEG-006',
    'ATLAS-LEG-007',
    'ATLAS-LIT-003',
    'ATLAS-LIT-004',
    'ATLAS-LIT-006',
    'ATLAS-POL-001',
    'ATLAS-POL-002',
    'ATLAS-POL-004',
  ],
  Case2: [
    'ATLAS-ADM-001',
    'ATLAS-ASM-001',
    'ATLAS-ASM-002',
    'ATLAS-CON-001',
    'ATLAS-CON-002',
    'ATLAS-CON-003',
    'ATLAS-EMP-003',
    'ATLAS-GAP-002',
    'ATLAS-HYP-003',
    'ATLAS-LEG-001',
    'ATLAS-LEG-002',
    'ATLAS-LEG-003',
    'ATLAS-LEG-004',
    'ATLAS-LEG-005',
    'ATLAS-LEG-006',
    'ATLAS-LIT-005',
    'ATLAS-POL-003',
  ],
  Case3: [
    'ATLAS-ASM-001',
    'ATLAS-ASM-002',
    'ATLAS-CON-003',
    'ATLAS-EMP-003',
    'ATLAS-EMP-004',
    'ATLAS-EMP-005',
    'ATLAS-EMP-006',
    'ATLAS-GAP-002',
    'ATLAS-HYP-004',
    'ATLAS-LEG-009',
    'ATLAS-LIT-001',
    'ATLAS-LIT-002',
    'ATLAS-LIT-005',
    'ATLAS-PILOT-001',
  ],
  Case4: [
    'ATLAS-ADM-002',
    'ATLAS-ADM-003',
    'ATLAS-ASM-001',
    'ATLAS-ASM-002',
    'ATLAS-CON-003',
    'ATLAS-EMP-007',
    'ATLAS-GAP-002',
    'ATLAS-GAP-003',
    'ATLAS-LEG-005',
    'ATLAS-LEG-006',
    'ATLAS-LEG-007',
    'ATLAS-LEG-008',
  ],
};

/**
 * Body-explicit claim IDs (excluding common front-matter-only additions).
 * Used to verify the documented body + common-rule composition.
 *
 * Case1: CON-003 already in body → +ASM-002 only
 * Case2: neither ASM-002 nor CON-003 in body → +both
 * Case3: CON-003 already in body → +ASM-002 only
 * Case4: neither in body → +both
 */
export const V011_EXPECTED_BODY_CLAIM_SETS: Record<CaseId, readonly string[]> = {
  Case1: [
    'ATLAS-ADM-002',
    'ATLAS-ASM-001',
    'ATLAS-CON-003',
    'ATLAS-EMP-001',
    'ATLAS-EMP-002',
    'ATLAS-EMP-003',
    'ATLAS-GAP-001',
    'ATLAS-GAP-004',
    'ATLAS-HYP-001',
    'ATLAS-HYP-002',
    'ATLAS-LEG-003',
    'ATLAS-LEG-006',
    'ATLAS-LEG-007',
    'ATLAS-LIT-003',
    'ATLAS-LIT-004',
    'ATLAS-LIT-006',
    'ATLAS-POL-001',
    'ATLAS-POL-002',
    'ATLAS-POL-004',
  ],
  Case2: [
    'ATLAS-ADM-001',
    'ATLAS-ASM-001',
    'ATLAS-CON-001',
    'ATLAS-CON-002',
    'ATLAS-EMP-003',
    'ATLAS-GAP-002',
    'ATLAS-HYP-003',
    'ATLAS-LEG-001',
    'ATLAS-LEG-002',
    'ATLAS-LEG-003',
    'ATLAS-LEG-004',
    'ATLAS-LEG-005',
    'ATLAS-LEG-006',
    'ATLAS-LIT-005',
    'ATLAS-POL-003',
  ],
  Case3: [
    'ATLAS-ASM-001',
    'ATLAS-CON-003',
    'ATLAS-EMP-003',
    'ATLAS-EMP-004',
    'ATLAS-EMP-005',
    'ATLAS-EMP-006',
    'ATLAS-GAP-002',
    'ATLAS-HYP-004',
    'ATLAS-LEG-009',
    'ATLAS-LIT-001',
    'ATLAS-LIT-002',
    'ATLAS-LIT-005',
    'ATLAS-PILOT-001',
  ],
  Case4: [
    'ATLAS-ADM-002',
    'ATLAS-ADM-003',
    'ATLAS-ASM-001',
    'ATLAS-EMP-007',
    'ATLAS-GAP-002',
    'ATLAS-GAP-003',
    'ATLAS-LEG-005',
    'ATLAS-LEG-006',
    'ATLAS-LEG-007',
    'ATLAS-LEG-008',
  ],
};

/** Stable section numbers present in every published case. */
export const CASE_SECTION_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export type CaseSectionNumber = (typeof CASE_SECTION_NUMBERS)[number];

export function caseSectionAnchor(section: CaseSectionNumber | number): string {
  return `section-${section}`;
}
