import { describe, expect, it } from 'vitest';
import {
  comparisonHref,
  parseComparisonState,
  serializeComparisonSearchParams,
} from '../../src/research/comparisonUrl';

describe('policy comparison URL contract', () => {
  it('resolves two distinct valid variant IDs', () => {
    const state = parseComparisonState(
      new URLSearchParams('a=C1-VAR-R&b=C1-VAR-E'),
    );
    expect(state.isCompleteDistinctPair).toBe(true);
    expect(state.slotA.variantId).toBe('C1-VAR-R');
    expect(state.slotB.variantId).toBe('C1-VAR-E');
    expect(state.slotA.status).toBe('valid');
    expect(state.notices).toEqual([]);
  });

  it('handles identical IDs with duplicate notice while preserving both slots', () => {
    const state = parseComparisonState(
      new URLSearchParams('a=C2-VAR-CF-A&b=C2-VAR-CF-A'),
    );
    expect(state.identicalIds).toBe(true);
    expect(state.isCompleteDistinctPair).toBe(false);
    expect(state.slotA.status).toBe('duplicate');
    expect(state.slotB.variantId).toBe('C2-VAR-CF-A');
    expect(state.notices.some((n) => n.code === 'duplicate_variants')).toBe(true);
  });

  it('ignores invalid IDs and leaves empty for missing/whitespace', () => {
    const invalid = parseComparisonState(
      new URLSearchParams('a=C9-VAR-NOPE&b=C4-VAR-B0'),
    );
    expect(invalid.slotA.status).toBe('empty');
    expect(invalid.slotA.variantId).toBeNull();
    expect(invalid.slotB.variantId).toBe('C4-VAR-B0');
    expect(invalid.notices.some((n) => n.code === 'invalid_variant')).toBe(true);

    const missing = parseComparisonState(new URLSearchParams(''));
    expect(missing.slotA.status).toBe('empty');
    expect(missing.slotB.status).toBe('empty');

    const whitespace = parseComparisonState(new URLSearchParams('a=%20%20&b='));
    expect(whitespace.slotA.status).toBe('empty');
    expect(whitespace.slotB.status).toBe('empty');
  });

  it('records repeated_param and uses the first value', () => {
    const params = new URLSearchParams();
    params.append('a', 'C1-VAR-R');
    params.append('a', 'C1-VAR-E');
    params.set('b', 'C1-VAR-E');
    const state = parseComparisonState(params);
    expect(state.slotA.variantId).toBe('C1-VAR-R');
    expect(state.notices.some((n) => n.code === 'repeated_param' && n.param === 'a')).toBe(
      true,
    );
  });

  it('serialises selection and builds hrefs', () => {
    expect(
      serializeComparisonSearchParams({ a: 'C1-VAR-R', b: 'C1-VAR-E' }).toString(),
    ).toBe('a=C1-VAR-R&b=C1-VAR-E');
    expect(serializeComparisonSearchParams({ a: 'C4-VAR-B0', b: null }).toString()).toBe(
      'a=C4-VAR-B0',
    );
    expect(comparisonHref({ a: 'C3-VAR-SITE-FDI', b: 'C3-VAR-FDI-ONLY' })).toBe(
      '/comparison?a=C3-VAR-SITE-FDI&b=C3-VAR-FDI-ONLY',
    );
    expect(comparisonHref({})).toBe('/comparison');
  });
});
