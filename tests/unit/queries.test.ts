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
    // Literal (substring) matches: all still returned, case-folded.
    const literal = mixed.filter((c) => /land banking/i.test(JSON.stringify(c)));
    expect(literal.map((c) => c.claim_id).sort()).toEqual(
      ['ATLAS-ADM-002', 'ATLAS-EMP-001', 'ATLAS-EMP-002'].sort(),
    );
    // Build 08P whole-word fallback adds same-field word matches (CSV-derived):
    // the words "land" and "banking" occur non-adjacently in one field.
    expect(
      mixed
        .filter((c) => !/land banking/i.test(JSON.stringify(c)))
        .map((c) => c.claim_id)
        .sort(),
    ).toEqual(['ATLAS-HYP-001', 'ATLAS-LEG-003']);
    expect(
      filterClaims(allClaims, { ...EMPTY_FILTERS, search: 'land banking' }).map(
        (c) => c.claim_id,
      ),
    ).toEqual(mixed.map((c) => c.claim_id));
  });

  it('whitespace-only search is treated as inactive and returns the full set', () => {
    const results = filterClaims(allClaims, {
      ...EMPTY_FILTERS,
      search: '   \t  ',
    });
    expect(results).toHaveLength(allClaims.length);
    expect(filtersAreActive({ ...EMPTY_FILTERS, search: '   \t  ' })).toBe(false);
  });

  describe('deterministic search: substring + same-field whole-word fallback', () => {
    const ids = (search: string) =>
      filterClaims(allClaims, { ...EMPTY_FILTERS, search }).map((c) => c.claim_id);

    it('multiword query "undeveloped sites" retrieves EMP-001 and EMP-002 (CSV-derived)', () => {
      // CSV: EMP-001 exact_claim "undeveloped/unused sites ..." (words not adjacent);
      // EMP-002 exact_claim "... whether undeveloped sites constituted ...".
      const emp1 = allClaims.find((c) => c.claim_id === 'ATLAS-EMP-001')!;
      const emp2 = allClaims.find((c) => c.claim_id === 'ATLAS-EMP-002')!;
      expect(emp1.exact_claim.toLowerCase()).toContain('undeveloped/unused sites');
      expect(emp2.exact_claim.toLowerCase()).toContain('undeveloped sites');

      expect(ids('undeveloped sites').sort()).toEqual(['ATLAS-EMP-001', 'ATLAS-EMP-002']);
    });

    it('whole-word fallback is order-independent and case-insensitive', () => {
      expect(ids('sites undeveloped').sort()).toEqual(['ATLAS-EMP-001', 'ATLAS-EMP-002']);
      expect(ids('UNDEVELOPED   Sites').sort()).toEqual(['ATLAS-EMP-001', 'ATLAS-EMP-002']);
    });

    it('duplicated query words still match when the field has the word once', () => {
      expect(ids('undeveloped undeveloped sites').sort()).toEqual([
        'ATLAS-EMP-001',
        'ATLAS-EMP-002',
      ]);
    });

    it('punctuated query "undeveloped/unused sites" is literal-only and retrieves EMP-001', () => {
      // The slash disables whole-word mode; EMP-001 matches by literal substring only.
      expect(ids('undeveloped/unused sites')).toEqual(['ATLAS-EMP-001']);
      // Punctuation between words blocks the fallback (EMP-002 has both words
      // but not the literal phrase).
      expect(ids('undeveloped, sites')).toEqual([]);
      expect(ids('sites, undeveloped')).toEqual([]);
    });

    it('misspellings are not corrected and do not match EMP-001/EMP-002', () => {
      const result = ids('undevelopped sites');
      expect(result).toEqual([]);
      expect(result).not.toContain('ATLAS-EMP-001');
      expect(result).not.toContain('ATLAS-EMP-002');
    });

    it('does not satisfy a query with words scattered across different fields', () => {
      // CSV: "emp" appears as a whole word only in EMP-001's claim_id
      // (ATLAS-EMP-001); "undeveloped" appears in its exact_claim. No single
      // field contains both, so there must be no match.
      const emp1 = allClaims.find((c) => c.claim_id === 'ATLAS-EMP-001')!;
      expect(emp1.claim_id.toLowerCase()).toContain('emp');
      expect(emp1.exact_claim.toLowerCase()).toContain('undeveloped');
      expect(emp1.exact_claim.toLowerCase().match(/[\p{L}\p{N}]+/gu)).not.toContain('emp');

      expect(ids('emp undeveloped')).toEqual([]);
      expect(ids('undeveloped emp')).toEqual([]);
      expect(ids('atlas emp undeveloped')).toEqual([]);
    });

    it('same-field whole-word matching works within claim_id tokens', () => {
      // Both words occur in the single claim_id field "ATLAS-EMP-001".
      expect(ids('atlas emp 001')).toEqual(['ATLAS-EMP-001']);
    });

    it('exact ATLAS identifiers remain searchable via substring on claim_id', () => {
      expect(ids('ATLAS-EMP-001')).toEqual(['ATLAS-EMP-001']);
      expect(ids('atlas-emp-002')).toEqual(['ATLAS-EMP-002']);
      expect(ids('ATLAS-EMP-003')).toEqual(['ATLAS-EMP-003']);
      // HYP-002 is also cross-referenced from other records' text (CSV): POL-001/002.
      expect(ids('ATLAS-HYP-002')).toEqual(['ATLAS-HYP-002', 'ATLAS-POL-001', 'ATLAS-POL-002']);
    });

    it('existing literal substring matches remain valid', () => {
      const literal = ids('land banking');
      // Every previous literal match is still returned.
      const literalBefore = allClaims
        .filter((c) =>
          [c.claim_id, c.exact_claim, c.primary_source_title, c.what_source_establishes,
            c.limitations_external_validity, c.competing_mechanism_or_contrary_evidence,
            c.admissibility_conditions, c.literature_src_ids,
            c.observation_that_would_alter_assessment, c.pinpoint,
            c.institutional_geographic_scope, c.mechanism_ids, c.outcome_ids,
            c.casebook_cases, c.primary_source_url].some((v) =>
            v.toLowerCase().includes('land banking'),
          ),
        )
        .map((c) => c.claim_id);
      expect(literalBefore.length).toBeGreaterThan(0);
      for (const id of literalBefore) {
        expect(literal).toContain(id);
      }
      expect(ids('labelled qualitative caution')).toEqual(['ATLAS-HYP-002']);
      expect(ids('src-accc-inq').length).toBe(6);
    });

    it('whitespace-only search stays inactive and single words stay substring-only', () => {
      expect(ids('   ')).toHaveLength(allClaims.length);
      expect(ids('\n\t ')).toHaveLength(allClaims.length);
      // Single word: substring semantic (partial word still matches).
      expect(ids('undevelop')).toContain('ATLAS-EMP-001');
      expect(ids('undevelop')).toContain('ATLAS-EMP-002');
    });

    it('partial words do not satisfy whole-word fallback for multiword queries', () => {
      // "undevelop sites" is not a literal substring; "undevelop" is not a whole word.
      expect(ids('undevelop sites')).toEqual([]);
    });
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
