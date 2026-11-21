import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ATLAS_SOURCE_FIELDS,
  ATLAS_SOURCE_PATH,
  EXPECTED_CLAIM_COUNT,
  ingestAtlasCsv,
  ResearchIngestError,
  sha256Hex,
} from '../../src/research/index';

const root = path.resolve(import.meta.dirname, '../..');
const atlasPath = path.join(root, ATLAS_SOURCE_PATH);
const fixtures = path.join(root, 'tests/fixtures');

function readFixture(name: string): string {
  return readFileSync(path.join(fixtures, name), 'utf8');
}

describe('atlas ingestion — published v0.1.1 dataset', () => {
  const csvText = readFileSync(atlasPath, 'utf8');
  const dataset = ingestAtlasCsv(csvText, {
    expectPublishedCount: true,
    enforceKnownMissingUrls: true,
  });

  it('contains exactly 43 unique claim IDs', () => {
    expect(dataset.claims).toHaveLength(EXPECTED_CLAIM_COUNT);
    const ids = dataset.claims.map((c) => c.claim_id);
    expect(new Set(ids).size).toBe(EXPECTED_CLAIM_COUNT);
  });

  it('has the expected 18 source fields', () => {
    expect(dataset.provenance.fields).toEqual([...ATLAS_SOURCE_FIELDS]);
    expect(dataset.provenance.fields).toHaveLength(18);
  });

  it('preserves original field values and does not silently discard rows', () => {
    const lines = csvText.trimEnd().split(/\r?\n/);
    // header + 43 data rows
    expect(lines.length).toBe(EXPECTED_CLAIM_COUNT + 1);

    const rawParsed = ingestAtlasCsv(csvText);
    expect(rawParsed.claims).toHaveLength(EXPECTED_CLAIM_COUNT);

    const hyp003 = dataset.claims.find((c) => c.claim_id === 'ATLAS-HYP-003');
    expect(hyp003).toBeDefined();
    expect(hyp003!.primary_source_url).toBe('');
    expect(hyp003!.hasPrimarySourceUrl).toBe(false);
    expect(hyp003!.status).toBe('unresolved_hypothesis');
  });

  it('keeps source URLs faithful to the original CSV', () => {
    const leg001 = dataset.claims.find((c) => c.claim_id === 'ATLAS-LEG-001');
    expect(leg001?.primary_source_url).toBe(
      'https://www.legislation.gov.au/C2004A01402',
    );
  });

  it('records reproducible provenance including checksum', () => {
    expect(dataset.provenance.sourceFile).toBe(ATLAS_SOURCE_PATH);
    expect(dataset.provenance.researchRelease).toBe('v0.1.1');
    expect(dataset.provenance.sourceContentSha256).toBe(sha256Hex(csvText));
    expect(dataset.provenance.sourceContentSha256).toBe(
      'cdb874f2637fca62c7170d5176eacd02ad2f86096f857a35b245208d9e1473af',
    );
  });

  it('parses semicolon-delimited identifiers without losing originals', () => {
    const leg003 = dataset.claims.find((c) => c.claim_id === 'ATLAS-LEG-003');
    expect(leg003?.mechanism_ids).toBe('M6a;M1a');
    expect(leg003?.mechanisms).toEqual(['M6a', 'M1a']);
    expect(leg003?.outcome_ids).toBe('O1;O2');
    expect(leg003?.outcomes).toEqual(['O1', 'O2']);
    expect(leg003?.casebook_cases).toBe('Case1;Case2');
    expect(leg003?.cases).toEqual(['Case1', 'Case2']);
  });
});

describe('atlas ingestion — negative fixtures', () => {
  it('rejects duplicate claim IDs', () => {
    expect(() => ingestAtlasCsv(readFixture('duplicate-ids.csv'))).toThrow(
      ResearchIngestError,
    );
  });

  it('rejects missing headers', () => {
    expect(() => ingestAtlasCsv(readFixture('missing-header.csv'))).toThrow(
      /Unexpected header|header/i,
    );
  });

  it('rejects unexpected headers', () => {
    expect(() => ingestAtlasCsv(readFixture('unexpected-header.csv'))).toThrow(
      /Unexpected header/i,
    );
  });

  it('rejects malformed CSV', () => {
    expect(() => ingestAtlasCsv(readFixture('malformed.csv'))).toThrow(
      ResearchIngestError,
    );
  });

  it('rejects invalid status vocabulary', () => {
    expect(() => ingestAtlasCsv(readFixture('invalid-status.csv'))).toThrow(
      ResearchIngestError,
    );
  });

  it('parses valid quoted commas and Unicode', () => {
    const dataset = ingestAtlasCsv(readFixture('valid-quoted-unicode.csv'));
    expect(dataset.claims).toHaveLength(2);
    const first = dataset.claims.find((c) => c.claim_id === 'FIX-001');
    expect(first?.exact_claim).toContain('comma, quotes "inside"');
    expect(first?.exact_claim).toContain('café');
    expect(first?.exact_claim).toContain('漢字');
    expect(first?.mechanisms).toEqual(['M1', 'M2']);
  });
});
