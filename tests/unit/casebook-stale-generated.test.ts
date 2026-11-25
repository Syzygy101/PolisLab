import { copyFileSync, readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import {
  findCasebookGeneratedDrift,
  ingestCasebookMarkdown,
  CASEBOOK_SOURCE_PATH,
} from '../../src/research/index.ts';
import { casebookDataset } from '../../src/data/casebookDataset.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const generatedPath = path.join(root, 'src/data/casebook.generated.json');
const backupPath = path.join(root, 'src/data/casebook.generated.json.bak-test');

afterEach(() => {
  if (existsSync(backupPath)) {
    copyFileSync(backupPath, generatedPath);
    unlinkSync(backupPath);
  }
});

describe('stale / corrupted generated casebook fails validation', () => {
  it('detects SHA drift without regenerating', () => {
    const markdown = readFileSync(path.join(root, CASEBOOK_SOURCE_PATH), 'utf8');
    const fresh = ingestCasebookMarkdown(markdown, {});
    const corrupted = structuredClone(casebookDataset);
    corrupted.provenance.sourceContentSha256 = '0'.repeat(64);
    const drift = findCasebookGeneratedDrift(fresh, corrupted);
    expect(drift.some((d) => /SHA-256 drift/i.test(d))).toBe(true);
  });

  it('detects case-body corruption without regenerating', () => {
    const markdown = readFileSync(path.join(root, CASEBOOK_SOURCE_PATH), 'utf8');
    const fresh = ingestCasebookMarkdown(markdown, {});
    const corrupted = structuredClone(casebookDataset);
    corrupted.cases[0].sections[0].markdown = 'CORRUPTED BODY — not the published text.\n';
    const drift = findCasebookGeneratedDrift(fresh, corrupted);
    expect(drift.some((d) => /cases drift/i.test(d))).toBe(true);
  });

  it('on-disk validate fails when generated SHA is corrupted (before ingest repair)', () => {
    copyFileSync(generatedPath, backupPath);
    const raw = JSON.parse(readFileSync(generatedPath, 'utf8')) as {
      provenance: { sourceContentSha256: string };
    };
    raw.provenance.sourceContentSha256 = 'deadbeef'.repeat(8);
    writeFileSync(generatedPath, `${JSON.stringify(raw, null, 2)}\n`, 'utf8');

    // Import validate logic via drift against a fresh ingest of the published source.
    const markdown = readFileSync(path.join(root, CASEBOOK_SOURCE_PATH), 'utf8');
    const fresh = ingestCasebookMarkdown(markdown, {});
    const onDisk = JSON.parse(readFileSync(generatedPath, 'utf8'));
    const drift = findCasebookGeneratedDrift(fresh, onDisk);
    expect(drift.length).toBeGreaterThan(0);
  });
});
