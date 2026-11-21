import { describe, expect, it } from 'vitest';
import { allClaims } from '../../src/data/researchDataset';
import {
  explainRelatedOverlaps,
  findClaimsSharingSourceUrl,
  findRelatedEvidence,
} from '../../src/research/relatedEvidence';

function claim(id: string) {
  const found = allClaims.find((c) => c.claim_id === id);
  if (!found) {
    throw new Error(`Missing claim ${id}`);
  }
  return found;
}

describe('related evidence (metadata association)', () => {
  it('links EMP-001 to EMP-002 via exact shared identifiers and explains inclusion', () => {
    const related = findRelatedEvidence(claim('ATLAS-EMP-001'), allClaims);
    const emp002 = related.find((item) => item.claim.claim_id === 'ATLAS-EMP-002');
    expect(emp002).toBeDefined();
    expect(emp002?.overlaps.some((o) => o.dimension === 'mechanism' && o.sharedIds.includes('M1c'))).toBe(
      true,
    );
    expect(emp002?.overlaps.some((o) => o.dimension === 'case' && o.sharedIds.includes('Case1'))).toBe(
      true,
    );
    expect(
      emp002?.overlaps.some(
        (o) => o.dimension === 'literature' && o.sharedIds.includes('SRC-ACCC-INQ'),
      ),
    ).toBe(true);
    expect(emp002?.explanation).toMatch(/Shares mechanism/);
    expect(emp002?.explanation).toMatch(/M1c/);
    expect(emp002?.explanation).toMatch(/Case1/);
    expect(emp002?.explanation).not.toMatch(/causal|corroborat|contradict/i);
  });

  it('excludes the inspected claim and deduplicates by claim_id', () => {
    const related = findRelatedEvidence(claim('ATLAS-EMP-001'), allClaims);
    const ids = related.map((item) => item.claim.claim_id);
    expect(ids).not.toContain('ATLAS-EMP-001');
    expect(ids).toEqual([...new Set(ids)]);
    expect(ids).toEqual([...ids].sort((a, b) => a.localeCompare(b)));
  });

  it('supports multiple shared dimensions without inventing causal language', () => {
    const explanation = explainRelatedOverlaps([
      { dimension: 'mechanism', sharedIds: ['M1c'] },
      { dimension: 'case', sharedIds: ['Case1'] },
    ]);
    expect(explanation).toBe('Shares mechanism M1c and case Case1.');
    expect(explanation).not.toMatch(/support|prove|contradict|causal/i);
  });

  it('returns empty relationship state when identifiers do not overlap', () => {
    const isolated = {
      ...claim('ATLAS-EMP-001'),
      claim_id: 'ATLAS-TEST-ISOLATED',
      mechanisms: ['M99-isolated'],
      outcomes: ['O99-isolated'],
      cases: ['Case99'],
      literatureSources: ['SRC-ISOLATED'],
    };
    expect(findRelatedEvidence(isolated, allClaims)).toEqual([]);
  });

  it('finds exact source-URL peers without merging on title similarity alone', () => {
    const emp001 = claim('ATLAS-EMP-001');
    const peers = findClaimsSharingSourceUrl(emp001, allClaims);
    expect(peers.map((c) => c.claim_id)).toEqual(
      [
        'ATLAS-EMP-002',
        'ATLAS-EMP-003',
        'ATLAS-EMP-004',
        'ATLAS-GAP-001',
        'ATLAS-POL-004',
      ].sort(),
    );
    expect(peers.every((c) => c.primary_source_url === emp001.primary_source_url)).toBe(true);
    expect(peers.some((c) => c.claim_id === 'ATLAS-EMP-001')).toBe(false);
  });

  it('returns no URL peers for ATLAS-HYP-003 (missing public URL)', () => {
    expect(findClaimsSharingSourceUrl(claim('ATLAS-HYP-003'), allClaims)).toEqual([]);
  });

  it('ASM-002 associates widely but never self-references or fabricates causality', () => {
    const related = findRelatedEvidence(claim('ATLAS-ASM-002'), allClaims);
    expect(related.length).toBe(42);
    expect(related.some((item) => item.claim.claim_id === 'ATLAS-ASM-002')).toBe(false);
    expect(related.map((item) => item.claim.claim_id)).toEqual(
      [...new Set(related.map((item) => item.claim.claim_id))],
    );
    expect(related.every((item) => !/causal|corroborat|citation relationship/i.test(item.explanation))).toBe(
      true,
    );
  });

  it('empty identifier lists do not create association matches', () => {
    const bare = {
      ...claim('ATLAS-EMP-001'),
      claim_id: 'ATLAS-TEST-EMPTY-IDS',
      mechanisms: [],
      outcomes: [],
      cases: [],
      literatureSources: [],
    };
    expect(findRelatedEvidence(bare, allClaims)).toEqual([]);
  });
});
