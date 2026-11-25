import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ATLAS_SOURCE_PATH,
  CASEBOOK_SOURCE_PATH,
  findCasebookGeneratedDrift,
  findGeneratedDrift,
  ingestAtlasCsv,
  ingestCasebookMarkdown,
} from '../../src/research/index';

const root = path.resolve(import.meta.dirname, '../..');

describe('complete generated dataset validation', () => {
  const csvText = readFileSync(path.join(root, ATLAS_SOURCE_PATH), 'utf8');
  const ingested = ingestAtlasCsv(csvText, {
    expectPublishedCount: true,
    enforceKnownMissingUrls: true,
  });
  const onDiskClaims = JSON.parse(
    readFileSync(path.join(root, 'src/data/claims.generated.json'), 'utf8'),
  );
  const markdown = readFileSync(path.join(root, CASEBOOK_SOURCE_PATH), 'utf8');
  const onDiskCasebook = JSON.parse(
    readFileSync(path.join(root, 'src/data/casebook.generated.json'), 'utf8'),
  );
  const ingestedCasebook = ingestCasebookMarkdown(markdown, {});

  it('reports no drift for complete claims + casebook artefacts', () => {
    expect(findGeneratedDrift(ingested, onDiskClaims)).toEqual([]);
    expect(findCasebookGeneratedDrift(ingestedCasebook, onDiskCasebook)).toEqual([]);
  });

  it('fails when ATLAS-ADM-001.mechanisms is cleared while SHA remains valid', () => {
    const corrupted = structuredClone(onDiskClaims);
    const claim = corrupted.claims.find(
      (c: { claim_id: string }) => c.claim_id === 'ATLAS-ADM-001',
    );
    expect(claim).toBeTruthy();
    claim.mechanisms = [];
    // Keep provenance SHA so only enriched-array drift is under test.
    const drift = findGeneratedDrift(ingested, corrupted);
    expect(drift.some((d) => /ATLAS-ADM-001\.mechanisms/i.test(d))).toBe(true);
    expect(drift.every((d) => !/SHA-256/i.test(d) || /mechanisms/i.test(d))).toBe(
      true,
    );
  });

  it('fails when closingParts are cleared while source checksum remains valid', () => {
    const corrupted = structuredClone(onDiskCasebook);
    corrupted.closingParts = [];
    const drift = findCasebookGeneratedDrift(ingestedCasebook, corrupted);
    expect(drift.some((d) => /closingParts/i.test(d))).toBe(true);
    expect(
      drift.some((d) => /SHA-256 drift/i.test(d)),
    ).toBe(false);
  });

  it('rejects casebook generation metadata that differs from the content digest', () => {
    const corrupted = structuredClone(onDiskCasebook);
    const { sourceContentSha256 } = ingestedCasebook.provenance;
    expect(ingestedCasebook.provenance.generatedAt).toBe(`content-sha256:${sourceContentSha256}`);
    corrupted.provenance.generatedAt = '2026-11-22T23:58:56.651Z';
    expect(findCasebookGeneratedDrift(ingestedCasebook, corrupted)).toEqual([
      expect.stringContaining('provenance.generatedAt drift'),
    ]);
  });

  it('fails when the casebook checksum is wrong', () => {
    const corrupted = structuredClone(onDiskCasebook);
    corrupted.provenance.sourceContentSha256 = '0'.repeat(64);
    const drift = findCasebookGeneratedDrift(ingestedCasebook, corrupted);
    expect(drift.some((d) => /SHA-256/i.test(d))).toBe(true);
  });

  it('detects enriched array and citation-metadata drift', () => {
    const claimsCorrupted = structuredClone(onDiskClaims);
    claimsCorrupted.claims[0].hasPrimarySourceUrl =
      !claimsCorrupted.claims[0].hasPrimarySourceUrl;
    expect(
      findGeneratedDrift(ingested, claimsCorrupted).some((d) =>
        /hasPrimarySourceUrl/i.test(d),
      ),
    ).toBe(true);

    const casebookCorrupted = structuredClone(onDiskCasebook);
    casebookCorrupted.commonRuleClaimIds = [];
    expect(
      findCasebookGeneratedDrift(ingestedCasebook, casebookCorrupted).some((d) =>
        /commonRuleClaimIds/i.test(d),
      ),
    ).toBe(true);
  });
});
