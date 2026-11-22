import { describe, expect, it } from 'vitest';
import { EMPTY_FILTERS } from '../../src/research/queries';
import {
  claimsExplorerHref,
  collectIgnoredFilterParams,
  parseFiltersFromSearchParams,
  serializeFiltersToSearchParams,
} from '../../src/research/urlFilters';

describe('Claims Explorer URL filter contract', () => {
  it('round-trips case, status, and outcome filters', () => {
    const filters = {
      ...EMPTY_FILTERS,
      cases: ['Case1'],
      statuses: ['empirical_finding' as const],
      outcomes: ['O6'],
    };
    const params = serializeFiltersToSearchParams(filters);
    expect(params.getAll('case')).toEqual(['Case1']);
    expect(params.getAll('status')).toEqual(['empirical_finding']);
    expect(params.getAll('outcome')).toEqual(['O6']);
    expect(parseFiltersFromSearchParams(params)).toEqual(filters);
  });

  it('omits empty dimensions from the query string', () => {
    const params = serializeFiltersToSearchParams(EMPTY_FILTERS);
    expect(params.toString()).toBe('');
    expect(claimsExplorerHref()).toBe('/claims');
  });

  it('builds Overview deep-link hrefs', () => {
    expect(claimsExplorerHref({ cases: ['Case1'] })).toBe('/claims?case=Case1');
    expect(claimsExplorerHref({ statuses: ['absence_of_finding'] })).toBe(
      '/claims?status=absence_of_finding',
    );
    expect(claimsExplorerHref({ outcomes: ['O6'] })).toBe('/claims?outcome=O6');
  });

  it('ignores unknown status, case, and outcome values; deduplicates repeats', () => {
    const params = new URLSearchParams(
      'status=not_a_real_status&status=verified_legal_fact&status=verified_legal_fact&case=Case9&case=Case2&outcome=O9&outcome=O1&mechanism=M1&mechanism=M1',
    );
    const filters = parseFiltersFromSearchParams(params);
    expect(filters.statuses).toEqual(['verified_legal_fact']);
    expect(filters.cases).toEqual(['Case2']);
    expect(filters.outcomes).toEqual(['O1']);
    expect(filters.mechanisms).toEqual(['M1']);
    expect(collectIgnoredFilterParams(params)).toEqual({
      statuses: ['not_a_real_status'],
      admissibilities: [],
      cases: ['Case9'],
      outcomes: ['O9'],
      mechanismFamilies: [],
      sorts: [],
    });
  });

  it('round-trips mechanism_family and ignores unknown family values', () => {
    const filters = {
      ...EMPTY_FILTERS,
      mechanismFamilies: ['M1' as const],
      mechanisms: ['M1b'],
    };
    const params = serializeFiltersToSearchParams(filters);
    expect(params.getAll('mechanism_family')).toEqual(['M1']);
    expect(params.getAll('mechanism')).toEqual(['M1b']);
    expect(parseFiltersFromSearchParams(params)).toEqual(filters);

    const ignored = collectIgnoredFilterParams(
      new URLSearchParams('mechanism_family=M9&mechanism_family=M2'),
    );
    expect(ignored.mechanismFamilies).toEqual(['M9']);
    expect(parseFiltersFromSearchParams(
      new URLSearchParams('mechanism_family=M9&mechanism_family=M2'),
    ).mechanismFamilies).toEqual(['M2']);
  });

  it('round-trips admissibility, literature, source_url, and sort', () => {
    const filters = {
      ...EMPTY_FILTERS,
      admissibilities: ['conditional' as const],
      literatureSources: ['SRC-ACCC-INQ'],
      sourceUrl: 'https://example.test/source',
      sort: 'primary_source_title' as const,
    };
    const params = serializeFiltersToSearchParams(filters);
    expect(params.getAll('admissibility')).toEqual(['conditional']);
    expect(params.getAll('literature')).toEqual(['SRC-ACCC-INQ']);
    expect(params.get('source_url')).toBe('https://example.test/source');
    expect(params.get('sort')).toBe('primary_source_title');
    expect(parseFiltersFromSearchParams(params)).toEqual(filters);
  });

  it('ignores unknown admissibility and sort; retains unknown literature tags', () => {
    const params = new URLSearchParams(
      'admissibility=maybe&admissibility=yes&sort=by_strength&literature=SRC-UNKNOWN',
    );
    const filters = parseFiltersFromSearchParams(params);
    expect(filters.admissibilities).toEqual(['yes']);
    expect(filters.sort).toBe('claim_id');
    expect(filters.literatureSources).toEqual(['SRC-UNKNOWN']);
    expect(collectIgnoredFilterParams(params)).toEqual({
      statuses: [],
      admissibilities: ['maybe'],
      cases: [],
      outcomes: [],
      mechanismFamilies: [],
      sorts: ['by_strength'],
    });
  });


  it('retains unknown mechanism tags as exact-tag filters', () => {
    const params = new URLSearchParams('mechanism=M99z&mechanism=');
    const filters = parseFiltersFromSearchParams(params);
    expect(filters.mechanisms).toEqual(['M99z']);
  });

  it('preserves encoded search text without trimming raw committed value until match time', () => {
    const filters = {
      ...EMPTY_FILTERS,
      search: 'land banking',
      mechanisms: ['M1'],
    };
    const params = serializeFiltersToSearchParams(filters);
    expect(params.get('q')).toBe('land banking');
    expect(params.toString()).toContain('land+banking');
    expect(parseFiltersFromSearchParams(params)).toEqual(filters);
  });

  it('supports repeated multi-select parameters in order', () => {
    const filters = {
      ...EMPTY_FILTERS,
      cases: ['Case1', 'Case3'],
      statuses: ['empirical_finding' as const, 'absence_of_finding' as const],
    };
    const params = serializeFiltersToSearchParams(filters);
    expect(params.getAll('case')).toEqual(['Case1', 'Case3']);
    expect(parseFiltersFromSearchParams(params)).toEqual(filters);
  });
});
