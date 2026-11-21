import { describe, expect, it } from 'vitest';
import { findClaimById } from '../../src/data/researchDataset';
import {
  compareHref,
  parseCompareState,
  serializeCompareSearchParams,
} from '../../src/research/compareUrl';

describe('two-claim comparison URL contract', () => {
  it('resolves two distinct valid claim IDs', () => {
    const state = parseCompareState(
      new URLSearchParams('a=ATLAS-EMP-001&b=ATLAS-EMP-002'),
      findClaimById,
    );
    expect(state.isCompleteDistinctPair).toBe(true);
    expect(state.slotA.claim?.claim_id).toBe('ATLAS-EMP-001');
    expect(state.slotB.claim?.claim_id).toBe('ATLAS-EMP-002');
    expect(state.slotA.claim?.exact_claim).toContain('undeveloped/unused sites');
    expect(state.slotB.claim?.exact_claim).toMatch(/land banking/i);
  });

  it('handles identical IDs predictably', () => {
    const state = parseCompareState(
      new URLSearchParams('a=ATLAS-LEG-001&b=ATLAS-LEG-001'),
      findClaimById,
    );
    expect(state.identicalIds).toBe(true);
    expect(state.isCompleteDistinctPair).toBe(false);
    expect(state.slotA.status).toBe('duplicate');
    expect(state.slotB.status).toBe('duplicate');
    expect(state.slotA.claim?.claim_id).toBe('ATLAS-LEG-001');
  });

  it('handles invalid first or second ID and missing IDs', () => {
    const invalidA = parseCompareState(
      new URLSearchParams('a=ATLAS-NOPE&b=ATLAS-EMP-005'),
      findClaimById,
    );
    expect(invalidA.slotA.status).toBe('invalid');
    expect(invalidA.slotB.status).toBe('valid');
    expect(invalidA.slotB.claim?.claim_id).toBe('ATLAS-EMP-005');

    const missing = parseCompareState(new URLSearchParams(''), findClaimById);
    expect(missing.slotA.status).toBe('empty');
    expect(missing.slotB.status).toBe('empty');

    const whitespace = parseCompareState(new URLSearchParams('a=%20%20&b='), findClaimById);
    expect(whitespace.slotA.status).toBe('empty');
    expect(whitespace.slotB.status).toBe('empty');
  });

  it('serialises replace/remove updates and builds hrefs', () => {
    expect(serializeCompareSearchParams({ a: 'ATLAS-HYP-001', b: 'ATLAS-POL-001' }).toString()).toBe(
      'a=ATLAS-HYP-001&b=ATLAS-POL-001',
    );
    expect(serializeCompareSearchParams({ a: 'ATLAS-HYP-001', b: null }).toString()).toBe(
      'a=ATLAS-HYP-001',
    );
    expect(compareHref({ a: 'ATLAS-EMP-005', b: 'ATLAS-HYP-004' })).toBe(
      '/claims/compare?a=ATLAS-EMP-005&b=ATLAS-HYP-004',
    );
    expect(compareHref({})).toBe('/claims/compare');
  });

  it('preserves source fields including missing URL for curated pairs', () => {
    const emp005 = parseCompareState(
      new URLSearchParams('a=ATLAS-EMP-005&b=ATLAS-HYP-004'),
      findClaimById,
    );
    expect(emp005.slotA.claim?.primary_source_url).toContain('ALDI');
    expect(emp005.slotB.claim?.status).toBe('absence_of_finding');

    const hyp003 = parseCompareState(
      new URLSearchParams('a=ATLAS-HYP-003&b=ATLAS-CON-003'),
      findClaimById,
    );
    expect(hyp003.slotA.claim?.primary_source_url).toBe('');
    expect(hyp003.slotB.claim?.exact_claim).toMatch(/Inferring consumer welfare/i);
  });
});
