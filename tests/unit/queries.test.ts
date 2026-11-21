import { describe, expect, it } from 'vitest';
import { allClaims } from '../../src/data/researchDataset';
import {
  EMPTY_FILTERS,
  filterClaims,
  filtersAreActive,
} from '../../src/research/queries';

describe('claim filtering', () => {
  it('search by known claim ID returns the correct claim', () => {
    const results = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      search: 'ATLAS-CON-001',
    });
    expect(results).toHaveLength(1);
    expect(results[0]?.claim_id).toBe('ATLAS-CON-001');
  });

  it('search is case-insensitive', () => {
    const upper = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      search: 'atlas-emp-002',
    });
    const mixed = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      search: 'LaNd BaNkInG',
    });
    expect(upper.some((c) => c.claim_id === 'ATLAS-EMP-002')).toBe(true);
    expect(mixed.length).toBeGreaterThan(0);
    expect(mixed.every((c) => /land banking/i.test(JSON.stringify(c)))).toBe(true);
  });

  it('whitespace-only search is treated as inactive and returns the full set', () => {
    const results = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      search: '   \t  ',
    });
    expect(results).toHaveLength(allClaims.length);
    expect(filtersAreActive({ ...EMPTY_FILTERS, search: '   \t  ' })).toBe(false);
  });

  it('status filter returns only matching records', () => {
    const results = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      statuses: ['unresolved_hypothesis'],
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((c) => c.status === 'unresolved_hypothesis')).toBe(true);
    expect(results.map((c) => c.claim_id).sort()).toEqual(
      ['ATLAS-HYP-001', 'ATLAS-HYP-002', 'ATLAS-HYP-003', 'ATLAS-POL-004'].sort(),
    );
  });

  it('mechanism exact-tag filter does not use substring or family expansion', () => {
    const exactM1 = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      mechanisms: ['M1'],
    });
    expect(exactM1.map((c) => c.claim_id).sort()).toEqual(
      ['ATLAS-ASM-002', 'ATLAS-HYP-004'].sort(),
    );
    expect(exactM1.every((c) => c.mechanisms.includes('M1'))).toBe(true);
    // Family members tagged only as M1a/M1b/M1c must not match exact M1.
    expect(exactM1.some((c) => c.claim_id === 'ATLAS-EMP-002')).toBe(false);

    const exactM1b = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      mechanisms: ['M1b'],
    });
    expect(exactM1b.length).toBe(6);
    expect(exactM1b.every((c) => c.mechanisms.includes('M1b'))).toBe(true);
    expect(exactM1b.some((c) => c.claim_id === 'ATLAS-ASM-002')).toBe(false);
  });

  it('mechanism and outcome filters combine with AND across dimensions', () => {
    const results = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      mechanisms: ['M6a'],
      outcomes: ['O1'],
    });
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every((c) => c.mechanisms.includes('M6a') && c.outcomes.includes('O1')),
    ).toBe(true);
    expect(results.map((c) => c.claim_id).sort()).toEqual(
      [
        'ATLAS-ADM-001',
        'ATLAS-ASM-001',
        'ATLAS-CON-001',
        'ATLAS-CON-002',
        'ATLAS-LEG-001',
        'ATLAS-LEG-002',
        'ATLAS-LEG-003',
        'ATLAS-LEG-004',
        'ATLAS-LEG-005',
        'ATLAS-POL-001',
        'ATLAS-POL-003',
      ].sort(),
    );
  });

  it('case filter returns only matching records', () => {
    const results = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      cases: ['Case4'],
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((c) => c.cases.includes('Case4'))).toBe(true);
  });

  it('reset restores the complete collection', () => {
    const filtered = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      search: 'FIRB',
      statuses: ['contested_claim'],
    });
    expect(filtered.length).toBeLessThan(allClaims.length);
    expect(filtersAreActive({ ...EMPTY_FILTERS, search: 'FIRB' })).toBe(true);

    const reset = filterClaims(allClaims, EMPTY_FILTERS);
    expect(reset).toHaveLength(allClaims.length);
    expect(filtersAreActive(EMPTY_FILTERS)).toBe(false);
  });

  it('handles no-results states', () => {
    const results = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      search: 'zzznomatch-polislab-xyz',
    });
    expect(results).toHaveLength(0);
  });

  it('sorts deterministically by claim_id', () => {
    const results = filterClaims(allClaims, EMPTY_FILTERS);
    const ids = results.map((c) => c.claim_id);
    expect(ids).toEqual([...ids].sort((a, b) => a.localeCompare(b)));
  });

  it('searches newly supported evidence fields including literature identifiers', () => {
    const byLit = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      search: 'src-accc-inq',
    });
    expect(byLit.map((c) => c.claim_id).sort()).toEqual(
      [
        'ATLAS-EMP-001',
        'ATLAS-EMP-002',
        'ATLAS-EMP-003',
        'ATLAS-EMP-004',
        'ATLAS-EMP-005',
        'ATLAS-HYP-001',
      ].sort(),
    );

    const byConditions = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      search: 'labelled qualitative caution',
    });
    expect(byConditions.map((c) => c.claim_id)).toEqual(['ATLAS-HYP-002']);
  });

  it('filters by actual admissibility vocabulary without treating it as truth', () => {
    const none = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      admissibilities: ['no'],
    });
    expect(none.map((c) => c.claim_id).sort()).toEqual(
      ['ATLAS-HYP-002', 'ATLAS-HYP-003'].sort(),
    );
    expect(none.every((c) => c.admissible_in_policy_comparison === 'no')).toBe(true);

    const conditional = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      admissibilities: ['conditional'],
    });
    expect(conditional.map((c) => c.claim_id).sort()).toEqual(
      ['ATLAS-HYP-001', 'ATLAS-POL-001', 'ATLAS-POL-002', 'ATLAS-POL-004'].sort(),
    );
  });

  it('combines status, admissibility, case, outcome, and mechanism with AND/OR semantics', () => {
    const results = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      statuses: ['unresolved_hypothesis'],
      admissibilities: ['no'],
      cases: ['Case1', 'Case2'],
      outcomes: ['O1', 'O5'],
      mechanisms: ['M1c', 'M6a'],
    });
    // Within dimensions OR; across AND. Independent CSV expectation:
    expect(results.map((c) => c.claim_id).sort()).toEqual(
      ['ATLAS-HYP-002', 'ATLAS-HYP-003'].sort(),
    );
  });

  it('filters by exact literature tag and exact source URL', () => {
    const byLit = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      literatureSources: ['SRC-BASELINE'],
    });
    expect(byLit.length).toBe(16);
    expect(byLit.every((c) => c.literatureSources.includes('SRC-BASELINE'))).toBe(true);

    const url = allClaims.find((c) => c.claim_id === 'ATLAS-EMP-001')!.primary_source_url;
    const byUrl = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      sourceUrl: url,
    });
    expect(byUrl.map((c) => c.claim_id).sort()).toEqual(
      [
        'ATLAS-EMP-001',
        'ATLAS-EMP-002',
        'ATLAS-EMP-003',
        'ATLAS-EMP-004',
        'ATLAS-GAP-001',
        'ATLAS-POL-004',
      ].sort(),
    );
  });

  it('sorts by primary source title with claim_id tie-break', () => {
    const results = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      sort: 'primary_source_title',
    });
    for (let i = 1; i < results.length; i += 1) {
      const prev = results[i - 1]!;
      const curr = results[i]!;
      const cmp = prev.primary_source_title.localeCompare(curr.primary_source_title);
      if (cmp === 0) {
        expect(prev.claim_id.localeCompare(curr.claim_id)).toBeLessThanOrEqual(0);
      } else {
        expect(cmp).toBeLessThanOrEqual(0);
      }
    }
  });
});
