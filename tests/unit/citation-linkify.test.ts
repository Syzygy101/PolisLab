import { describe, expect, it } from 'vitest';
import {
  expandClaimIdRanges,
  splitTextWithClaimIds,
} from '../../src/research/casebookCitations';
import {
  splitTextWithClaimsAndMechanisms,
  splitTextWithMechanismIds,
} from '../../src/research/mechanismCitations';

describe('unified citation parsing', () => {
  it('preserves compact range wording while expanding both claim targets', () => {
    const parts = splitTextWithClaimIds('see ATLAS-LEG-001–002 for pathways');
    const range = parts.find((part) => part.type === 'claim_range');
    expect(range).toMatchObject({
      type: 'claim_range',
      display: 'ATLAS-LEG-001–002',
      ids: ['ATLAS-LEG-001', 'ATLAS-LEG-002'],
    });
    expect(expandClaimIdRanges('ATLAS-LEG-001–002')).toEqual([
      'ATLAS-LEG-001',
      'ATLAS-LEG-002',
    ]);
  });

  it('rejects partial claim and mechanism matches', () => {
    const claims = splitTextWithClaimIds('ATLAS-LEG-0010 is not a claim id');
    expect(claims.every((part) => part.type === 'text')).toBe(true);

    const mechanisms = splitTextWithMechanismIds('M5a-3 is not a published tag');
    expect(mechanisms.every((part) => part.type === 'text')).toBe(true);
    expect(splitTextWithMechanismIds('M5a').some((p) => p.type === 'mechanism')).toBe(
      true,
    );
  });

  it('preserves grouped mechanism IDs and contextual subdivisions', () => {
    const parts = splitTextWithMechanismIds('M1a/M1b/M1c and M5a-1 vs M5a-2');
    expect(parts.filter((p) => p.type === 'mechanism').map((p) => p.id)).toEqual([
      'M1a',
      'M1b',
      'M1c',
    ]);
    expect(
      parts.filter((p) => p.type === 'contextual').map((p) => p.id),
    ).toEqual(['M5a-1', 'M5a-2']);
  });

  it('handles mixed claim ranges and mechanisms in one leaf', () => {
    const parts = splitTextWithClaimsAndMechanisms(
      'M6a frictions (ATLAS-LEG-001–002) and M5a-1',
    );
    expect(parts.some((p) => p.type === 'mechanism' && p.id === 'M6a')).toBe(true);
    expect(
      parts.some(
        (p) =>
          p.type === 'claim_range' &&
          p.display.includes('ATLAS-LEG-001') &&
          p.ids.includes('ATLAS-LEG-002'),
      ),
    ).toBe(true);
    expect(parts.some((p) => p.type === 'contextual' && p.id === 'M5a-1')).toBe(true);
  });
});
