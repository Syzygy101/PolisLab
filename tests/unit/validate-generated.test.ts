import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ATLAS_SOURCE_PATH,
  findGeneratedDrift,
  ingestAtlasCsv,
  isSafeHttpUrl,
} from '../../src/research/index';

const root = path.resolve(import.meta.dirname, '../..');
const atlasPath = path.join(root, ATLAS_SOURCE_PATH);
const generatedPath = path.join(root, 'src/data/claims.generated.json');

describe('generated dataset drift detection', () => {
  const csvText = readFileSync(atlasPath, 'utf8');
  const ingested = ingestAtlasCsv(csvText, {
    expectPublishedCount: true,
    enforceKnownMissingUrls: true,
  });
  const onDisk = JSON.parse(readFileSync(generatedPath, 'utf8'));

  it('reports no drift for the current generated artefact', () => {
    expect(findGeneratedDrift(ingested, onDisk)).toEqual([]);
  });

  it('detects corrupted claim text and count in a synthetic fixture', () => {
    const corrupted = structuredClone(onDisk);
    corrupted.claims[0].exact_claim = 'CORRUPTED BY AUDIT FIXTURE';
    corrupted.claims[0].status = 'unresolved_hypothesis';
    corrupted.claims = corrupted.claims.slice(0, 10);
    corrupted.provenance.claimCount = 10;
    corrupted.provenance.sourceContentSha256 = 'deadbeef';

    const drift = findGeneratedDrift(ingested, corrupted);
    expect(drift.length).toBeGreaterThan(0);
    expect(drift.some((issue) => /claim count/i.test(issue))).toBe(true);
    expect(drift.some((issue) => /sourceContentSha256|SHA-256/i.test(issue))).toBe(
      true,
    );
    expect(drift.some((issue) => /exact_claim/i.test(issue))).toBe(true);
  });

  it('regenerating from unchanged CSV yields identical original fields', () => {
    const again = ingestAtlasCsv(csvText, {
      expectPublishedCount: true,
      enforceKnownMissingUrls: true,
      generatedAt: '1970-01-01T00:00:00.000Z',
    });
    // Compare substantive claim payloads, ignoring generatedAt.
    expect(
      again.claims.map((c) => ({
        claim_id: c.claim_id,
        exact_claim: c.exact_claim,
        status: c.status,
        primary_source_url: c.primary_source_url,
        admissible_in_policy_comparison: c.admissible_in_policy_comparison,
      })),
    ).toEqual(
      ingested.claims.map((c) => ({
        claim_id: c.claim_id,
        exact_claim: c.exact_claim,
        status: c.status,
        primary_source_url: c.primary_source_url,
        admissible_in_policy_comparison: c.admissible_in_policy_comparison,
      })),
    );
    expect(again.provenance.sourceContentSha256).toBe(
      ingested.provenance.sourceContentSha256,
    );
  });
});

describe('safe external URL schemes', () => {
  it('accepts http(s) and rejects dangerous schemes', () => {
    expect(isSafeHttpUrl('https://example.gov.au/path')).toBe(true);
    expect(isSafeHttpUrl('http://example.gov.au/path')).toBe(true);
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpUrl('data:text/html,hi')).toBe(false);
    expect(isSafeHttpUrl('')).toBe(false);
    expect(isSafeHttpUrl('not a url')).toBe(false);
  });
});
