import { describe, expect, it } from 'vitest';
import { allClaims } from '../../src/data/researchDataset';
import {
  computeResearchCoverage,
  countAllDirectCaseMemberships,
  countClaimsByStatus,
  countUniqueCaseMembers,
  sumDirectCaseMemberships,
} from '../../src/research/coverage';
import {
  V011_EXPECTED_CASE_MEMBERSHIP,
  V011_EXPECTED_CASE_TITLES,
  V011_EXPECTED_STATUS_COUNTS,
  V011_EXPECTED_TOTAL_CLAIMS,
} from '../../src/research/referenceExpectations';
import {
  CASE_IDS,
  MECHANISM_FAMILIES,
  OUTCOME_STAGES,
  RESEARCH_CASES,
} from '../../src/research/taxonomy';
import { CLAIM_STATUSES } from '../../src/research/constants';
import { allCuratedClaimIds } from '../../src/research/overviewContent';
import { ATLAS_SOURCE_FIELDS } from '../../src/research/constants';

describe('v0.1.1 coverage integrity (fixed reference vs dynamic counts)', () => {
  it('seven evidence-status counts match the release distribution and sum to 43', () => {
    const counts = countClaimsByStatus(allClaims);
    expect(counts).toEqual(V011_EXPECTED_STATUS_COUNTS);
    const total = CLAIM_STATUSES.reduce((sum, status) => sum + counts[status], 0);
    expect(total).toBe(V011_EXPECTED_TOTAL_CLAIMS);
    expect(allClaims).toHaveLength(V011_EXPECTED_TOTAL_CLAIMS);
  });

  it('direct case membership counts equal 20, 17, 14, 12 for Cases 1–4', () => {
    const byCase = countAllDirectCaseMemberships(allClaims);
    expect(byCase).toEqual(V011_EXPECTED_CASE_MEMBERSHIP);
  });

  it('overlapping case memberships are not treated as unique claims', () => {
    const summed = sumDirectCaseMemberships(allClaims);
    const unique = countUniqueCaseMembers(allClaims);
    expect(summed).toBe(
      V011_EXPECTED_CASE_MEMBERSHIP.Case1 +
        V011_EXPECTED_CASE_MEMBERSHIP.Case2 +
        V011_EXPECTED_CASE_MEMBERSHIP.Case3 +
        V011_EXPECTED_CASE_MEMBERSHIP.Case4,
    );
    expect(summed).toBeGreaterThan(unique);
    expect(unique).toBeLessThanOrEqual(V011_EXPECTED_TOTAL_CLAIMS);
  });

  it('four case titles match the authoritative casebook', () => {
    for (const id of CASE_IDS) {
      const researchCase = RESEARCH_CASES.find((c) => c.id === id);
      expect(researchCase?.title).toBe(V011_EXPECTED_CASE_TITLES[id]);
      expect(researchCase?.casebookHeading).toContain(researchCase?.title ?? '');
    }
  });

  it('six outcome stages and six mechanism families are represented', () => {
    expect(OUTCOME_STAGES).toHaveLength(6);
    expect(OUTCOME_STAGES.map((s) => s.id)).toEqual(['O1', 'O2', 'O3', 'O4', 'O5', 'O6']);
    expect(MECHANISM_FAMILIES).toHaveLength(6);
    expect(MECHANISM_FAMILIES.map((m) => m.id)).toEqual([
      'M1',
      'M2',
      'M3',
      'M4',
      'M5',
      'M6',
    ]);

    const coverage = computeResearchCoverage(allClaims);
    expect(coverage.outcomeStageCount).toBe(6);
    expect(coverage.mechanismFamilyCount).toBe(6);
    expect(coverage.caseCount).toBe(4);
  });

  it('all curated Overview claim references resolve against the atlas', () => {
    const curated = allCuratedClaimIds();
    expect(curated.length).toBeGreaterThan(10);
    for (const id of curated) {
      expect(
        allClaims.some((c) => c.claim_id === id),
        `missing curated claim ${id}`,
      ).toBe(true);
    }
  });

  it('does not invent evidence classifications beyond the published vocabulary', () => {
    for (const claim of allClaims) {
      expect(CLAIM_STATUSES).toContain(claim.status);
    }
  });

  it('preserves all 18 raw source fields without modification', () => {
    expect(ATLAS_SOURCE_FIELDS).toHaveLength(18);
    for (const claim of allClaims) {
      for (const field of ATLAS_SOURCE_FIELDS) {
        expect(claim).toHaveProperty(field);
        expect(typeof claim[field]).toBe('string');
      }
    }
  });
});
