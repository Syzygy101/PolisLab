import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { allClaims } from '../../src/data/researchDataset';
import {
  exactMechanismClaimIds,
  familyMechanismClaimIds,
  claimsForMechanismOutcomeCell,
} from '../../src/research/mechanismQueries';
import {
  MECHANISM_FAMILY_IDS,
  MECHANISM_SUBMECHANISM_IDS,
  expandMechanismFamilyTags,
} from '../../src/research/taxonomy';
import { OUTCOME_STAGE_IDS } from '../../src/research/taxonomy';

const fixture = JSON.parse(
  readFileSync(
    path.resolve(import.meta.dirname, '../fixtures/v011_mechanism_id_sets.json'),
    'utf8',
  ),
) as {
  exact: Record<string, string[]>;
  family: Record<string, string[]>;
  matrix: Record<string, Record<string, string[]>>;
};

describe('mechanism membership by claim ID', () => {
  it('matches independent exact, family, and matrix ID sets from query results', () => {
    for (const [tag, expected] of Object.entries(fixture.exact)) {
      expect(exactMechanismClaimIds(allClaims, tag)).toEqual(expected);
    }
    for (const familyId of MECHANISM_FAMILY_IDS) {
      expect(familyMechanismClaimIds(allClaims, familyId)).toEqual(
        fixture.family[familyId],
      );
    }
    for (const familyId of MECHANISM_FAMILY_IDS) {
      for (const outcomeId of OUTCOME_STAGE_IDS) {
        const actual = claimsForMechanismOutcomeCell(
          allClaims,
          familyId,
          outcomeId,
        ).map((c) => c.claim_id);
        expect(actual).toEqual(fixture.matrix[familyId][outcomeId]);
      }
    }
  });

  it('rejects unexpected tags from the registry expansion contract', () => {
    const allowed = new Set<string>();
    for (const familyId of MECHANISM_FAMILY_IDS) {
      for (const tag of expandMechanismFamilyTags(familyId)) {
        allowed.add(tag);
      }
    }
    expect(allowed.has('M99')).toBe(false);
    expect(MECHANISM_SUBMECHANISM_IDS.includes('M5a-1' as never)).toBe(false);
    const observed = new Set(allClaims.flatMap((c) => c.mechanisms));
    expect(observed.has('M99')).toBe(false);
    for (const tag of observed) {
      expect(allowed.has(tag), `unexpected tag ${tag}`).toBe(true);
    }
  });
});
