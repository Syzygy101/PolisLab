import { describe, expect, it } from 'vitest';
import {
  gapsHref,
  parseGapsState,
  serializeGapsSearchParams,
} from '../../src/research/gapsUrl';
import { EMPTY_GAPS_FILTERS } from '../../src/research/gapsQueries';

describe('gaps URL contract', () => {
  it('round-trips filters', () => {
    const filters = {
      ...EMPTY_GAPS_FILTERS,
      cases: ['Case1', 'Case3'] as const,
      mechanismFamilies: ['M1'] as const,
      outcomes: ['O1'] as const,
      statuses: ['absence_of_finding'] as const,
      agenda: 'sites-planning-holding' as const,
      claimId: 'ATLAS-GAP-001',
    };
    const params = serializeGapsSearchParams({
      ...filters,
      cases: [...filters.cases],
      mechanismFamilies: [...filters.mechanismFamilies],
      outcomes: [...filters.outcomes],
      statuses: [...filters.statuses],
    });
    const parsed = parseGapsState(params);
    expect(parsed.filters.cases).toEqual(['Case1', 'Case3']);
    expect(parsed.filters.mechanismFamilies).toEqual(['M1']);
    expect(parsed.filters.outcomes).toEqual(['O1']);
    expect(parsed.filters.statuses).toEqual(['absence_of_finding']);
    expect(parsed.filters.agenda).toBe('sites-planning-holding');
    expect(parsed.filters.claimId).toBe('ATLAS-GAP-001');
    expect(parsed.notices).toEqual([]);
  });

  it('ignores invalid vocabulary values with notices', () => {
    const params = new URLSearchParams(
      'case=Case9&outcome=O9&mechanism_family=M9&status=made_up&type=invented&role=nope&agenda=fake',
    );
    const parsed = parseGapsState(params);
    expect(parsed.filters.cases).toEqual([]);
    expect(parsed.filters.outcomes).toEqual([]);
    expect(parsed.filters.mechanismFamilies).toEqual([]);
    expect(parsed.filters.statuses).toEqual([]);
    expect(parsed.filters.requirementTypes).toEqual([]);
    expect(parsed.filters.observationRoles).toEqual([]);
    expect(parsed.filters.agenda).toBeNull();
    expect(parsed.notices.length).toBeGreaterThanOrEqual(6);
  });

  it('retains unknown exact mechanism tags', () => {
    const params = new URLSearchParams('mechanism=M99');
    const parsed = parseGapsState(params);
    expect(parsed.filters.mechanisms).toEqual(['M99']);
  });

  it('builds shareable hrefs', () => {
    expect(gapsHref()).toBe('/gaps');
    expect(gapsHref({ cases: ['Case2'] })).toBe('/gaps?case=Case2');
    expect(gapsHref({ claimId: 'ATLAS-GAP-002' })).toBe(
      '/gaps?claim=ATLAS-GAP-002',
    );
  });
});
