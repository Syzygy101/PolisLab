import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { allClaims } from '../../src/data/researchDataset';
import {
  EMPTY_FILTERS,
  filterClaims,
} from '../../src/research/queries';
import {
  MECHANISM_CONTEXTUAL_SUBDIVISIONS,
  MECHANISM_FAMILIES,
  MECHANISM_FAMILY_CHILDREN,
  MECHANISM_FAMILY_IDS,
  MECHANISM_SUBMECHANISM_IDS,
  expandMechanismFamilyTags,
  isMechanismId,
} from '../../src/research/taxonomy';
import {
  computeMechanismFamilyCoverage,
  computeMechanismOutcomeMatrix,
  countExactMechanism,
  countMechanismFamily,
  exactMechanismClaimIds,
  familyMechanismClaimIds,
  listAllNavigableMechanismIds,
} from '../../src/research/mechanismQueries';
import {
  V011_EXPECTED_EXACT_MECHANISM_COUNTS,
  V011_EXPECTED_FAMILY_MECHANISM_COUNTS,
  V011_EXPECTED_MECHANISM_OUTCOME_MATRIX,
  V011_EXPECTED_NAVIGABLE_MECHANISM_IDS,
  V011_EXPECTED_OUTCOME_COUNTS,
} from '../../src/research/referenceExpectations';
import {
  parseFiltersFromSearchParams,
  serializeFiltersToSearchParams,
  claimsExplorerHref,
} from '../../src/research/urlFilters';
import { countClaimsByOutcome } from '../../src/research/coverage';
import { getMechanismProfileContent } from '../../src/research/mechanismProfiles';
import { MECHANISM_EXPLANATIONS } from '../../src/research/mechanismExplanations';
import { findClaimById } from '../../src/data/researchDataset';
import { splitTextWithMechanismIds } from '../../src/research/mechanismCitations';

const fixture = JSON.parse(
  readFileSync(
    resolve(__dirname, '../fixtures/v011_mechanism_coverage.json'),
    'utf8',
  ),
) as {
  exactCounts: Record<string, number>;
  familyCounts: Record<string, number>;
  outcomeCounts: Record<string, number>;
  matrixCounts: Record<string, Record<string, number>>;
};

describe('mechanism taxonomy', () => {
  it('registers six families and twelve exact submechanisms with explicit hierarchy', () => {
    expect(MECHANISM_FAMILY_IDS).toEqual(['M1', 'M2', 'M3', 'M4', 'M5', 'M6']);
    expect(MECHANISM_SUBMECHANISM_IDS).toHaveLength(12);
    expect(MECHANISM_FAMILIES).toHaveLength(6);
    for (const family of MECHANISM_FAMILIES) {
      expect(MECHANISM_FAMILY_CHILDREN[family.id]).toEqual(family.childIds);
      for (const child of family.childIds) {
        expect(isMechanismId(child)).toBe(true);
      }
    }
    expect(listAllNavigableMechanismIds()).toEqual([
      ...V011_EXPECTED_NAVIGABLE_MECHANISM_IDS,
    ]);
  });

  it('treats M5a-1/M5a-2 as contextual subdivisions, not atlas tags', () => {
    expect(MECHANISM_CONTEXTUAL_SUBDIVISIONS.map((item) => item.id)).toEqual([
      'M5a-1',
      'M5a-2',
    ]);
    expect(isMechanismId('M5a-1')).toBe(false);
    expect(isMechanismId('M5a-2')).toBe(false);
    expect(allClaims.some((c) => c.mechanisms.includes('M5a-1'))).toBe(false);
    expect(allClaims.some((c) => c.mechanisms.includes('M5a-2'))).toBe(false);
  });

  it('expands families via registry, not substring matching', () => {
    expect(expandMechanismFamilyTags('M1')).toEqual(['M1', 'M1a', 'M1b', 'M1c']);
    expect(expandMechanismFamilyTags('M1')).not.toContain('M10');
  });
});

describe('mechanism query semantics', () => {
  it('exact M1 returns 2 claims and excludes family-only records', () => {
    const results = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      mechanisms: ['M1'],
    });
    expect(results).toHaveLength(2);
    expect(results.map((c) => c.claim_id).sort()).toEqual(
      ['ATLAS-ASM-002', 'ATLAS-HYP-004'].sort(),
    );
    expect(results.every((c) => c.mechanisms.includes('M1'))).toBe(true);
  });

  it('family M1 returns 24 unique claims without duplicates', () => {
    const results = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      mechanismFamilies: ['M1'],
    });
    expect(results).toHaveLength(24);
    const ids = results.map((c) => c.claim_id);
    expect(new Set(ids).size).toBe(24);
    expect(ids.sort()).toEqual(familyMechanismClaimIds(allClaims, 'M1'));
  });

  it('exact M1c returns 17 claims; exact M1b excludes family-only records', () => {
    expect(countExactMechanism(allClaims, 'M1c')).toBe(17);
    expect(exactMechanismClaimIds(allClaims, 'M1c')).toHaveLength(17);
    const m1b = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      mechanisms: ['M1b'],
    });
    expect(m1b).toHaveLength(6);
    expect(m1b.every((c) => c.mechanisms.includes('M1b'))).toBe(true);
    expect(m1b.some((c) => c.claim_id === 'ATLAS-ASM-002')).toBe(false);
  });

  it('mechanism=M1 URLs retain exact-tag meaning', () => {
    const filters = parseFiltersFromSearchParams(
      new URLSearchParams('mechanism=M1'),
    );
    expect(filters.mechanisms).toEqual(['M1']);
    expect(filters.mechanismFamilies).toEqual([]);
    expect(filterClaims(allClaims, filters)).toHaveLength(2);
    expect(serializeFiltersToSearchParams(filters).toString()).toBe('mechanism=M1');
  });

  it('mechanism_family=M1 expands and combines with other dimensions', () => {
    const href = claimsExplorerHref({
      mechanismFamilies: ['M1'],
      outcomes: ['O1'],
      cases: ['Case1'],
    });
    expect(href).toContain('mechanism_family=M1');
    expect(href).toContain('outcome=O1');
    expect(href).toContain('case=Case1');
    expect(href).not.toContain('mechanism=M1');

    const filters = parseFiltersFromSearchParams(
      new URLSearchParams(href.split('?')[1] ?? ''),
    );
    const results = filterClaims(allClaims, filters);
    expect(
      results.every(
        (c) =>
          c.outcomes.includes('O1') &&
          c.cases.includes('Case1') &&
          c.mechanisms.some((m) => ['M1', 'M1a', 'M1b', 'M1c'].includes(m)),
      ),
    ).toBe(true);
  });

  it('exact and family selections OR within the mechanism dimension', () => {
    const results = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      mechanisms: ['M6'],
      mechanismFamilies: ['M1'],
    });
    // Union of exact M6 (1) and family M1 (24); ASM-002 is in both.
    expect(results.length).toBeGreaterThanOrEqual(24);
    expect(results.some((c) => c.claim_id === 'ATLAS-ASM-002')).toBe(true);
  });
});

describe('mechanism coverage vs independent expectations', () => {
  it('matches exact, family, outcome, and matrix counts including ID sets', () => {
    for (const [tag, expected] of Object.entries(
      V011_EXPECTED_EXACT_MECHANISM_COUNTS,
    )) {
      expect(countExactMechanism(allClaims, tag)).toBe(expected);
      expect(countExactMechanism(allClaims, tag)).toBe(fixture.exactCounts[tag]);
    }
    for (const familyId of MECHANISM_FAMILY_IDS) {
      expect(countMechanismFamily(allClaims, familyId)).toBe(
        V011_EXPECTED_FAMILY_MECHANISM_COUNTS[familyId],
      );
      expect(countMechanismFamily(allClaims, familyId)).toBe(
        fixture.familyCounts[familyId],
      );
    }
    for (const [outcomeId, expected] of Object.entries(
      V011_EXPECTED_OUTCOME_COUNTS,
    )) {
      expect(
        countClaimsByOutcome(
          allClaims,
          outcomeId as keyof typeof V011_EXPECTED_OUTCOME_COUNTS,
        ),
      ).toBe(expected);
    }
    const matrix = computeMechanismOutcomeMatrix(allClaims);
    for (const familyId of MECHANISM_FAMILY_IDS) {
      for (const outcomeId of Object.keys(
        V011_EXPECTED_MECHANISM_OUTCOME_MATRIX[familyId],
      ) as Array<keyof (typeof V011_EXPECTED_MECHANISM_OUTCOME_MATRIX)['M1']>) {
        expect(matrix[familyId][outcomeId]).toBe(
          V011_EXPECTED_MECHANISM_OUTCOME_MATRIX[familyId][outcomeId],
        );
        expect(matrix[familyId][outcomeId]).toBe(
          fixture.matrixCounts[familyId][outcomeId],
        );
      }
    }
    const coverage = computeMechanismFamilyCoverage(allClaims);
    expect(coverage.map((row) => row.familyCount)).toEqual([24, 5, 7, 17, 4, 14]);
  });
});

describe('mechanism research integrity', () => {
  it('every curated claim and case reference resolves', () => {
    for (const id of listAllNavigableMechanismIds()) {
      const profile = getMechanismProfileContent(id);
      for (const block of profile.alternativeExplanations) {
        for (const source of block.sources) {
          if (source.kind === 'claim') {
            expect(findClaimById(source.id), source.id).toBeTruthy();
          }
        }
      }
      for (const note of profile.outcomeNotes) {
        for (const source of note.sources) {
          if (source.kind === 'claim') {
            expect(findClaimById(source.id), source.id).toBeTruthy();
          }
        }
      }
    }
    for (const explanation of MECHANISM_EXPLANATIONS) {
      for (const source of explanation.sources) {
        if (source.kind === 'claim') {
          expect(findClaimById(source.id), source.id).toBeTruthy();
        }
      }
    }
  });

  it('preserves competing M1 explanations and ALDI/FDI limitations in curated copy', () => {
    const m1 = getMechanismProfileContent('M1');
    expect(
      m1.alternativeExplanations.some((item) =>
        /scarcity|planning|foreclosure/i.test(item.text),
      ),
    ).toBe(true);
    const m2 = getMechanismProfileContent('M2');
    expect(
      m2.alternativeExplanations.some((item) =>
        /binding constraint|chronology/i.test(item.text),
      ),
    ).toBe(true);
    const m6 = getMechanismProfileContent('M6');
    expect(
      m6.limitations.some((item) => /transaction-specific/i.test(item)),
    ).toBe(true);
    expect(
      MECHANISM_EXPLANATIONS.every(
        (item) =>
          item.inferentialLimitations.length > 0 &&
          !/effect size|causal weight|policy ranking/i.test(
            JSON.stringify(item),
          ),
      ),
    ).toBe(true);
  });

  it('linkifies grouped mechanisms and contextual subdivisions without collapsing M5a-1 into M5a', () => {
    const parts = splitTextWithMechanismIds('M1a/M1b/M1c and M5a-1 vs M5a-2 and M5a');
    const kinds = parts.map((part) =>
      part.type === 'text' ? part.value : `${part.type}:${part.id}`,
    );
    expect(kinds).toContain('mechanism:M1a');
    expect(kinds).toContain('mechanism:M1b');
    expect(kinds).toContain('mechanism:M1c');
    expect(kinds).toContain('contextual:M5a-1');
    expect(kinds).toContain('contextual:M5a-2');
    expect(kinds).toContain('mechanism:M5a');
    const contextual = parts.find(
      (part) => part.type === 'contextual' && part.id === 'M5a-1',
    );
    expect(contextual && contextual.type === 'contextual' && contextual.href).toBe(
      '/mechanisms/M5a#contextual-subdivisions',
    );
  });
});
