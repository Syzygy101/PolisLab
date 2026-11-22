import {
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import {
  PINNED_ATLAS_SHA256,
  checkPinnedReleaseSources,
  ingestAtlasCsv,
  runReleaseValidation,
  sha256Buffer,
} from '../../src/research/index';

const root = path.resolve(import.meta.dirname, '../..');
const tempRoots: string[] = [];

afterEach(() => {
  while (tempRoots.length > 0) {
    const dir = tempRoots.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

function clonePinnedTree(): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'polislab-release-'));
  tempRoots.push(dir);
  mkdirSync(path.join(dir, 'research'), { recursive: true });
  mkdirSync(path.join(dir, 'src/data'), { recursive: true });
  copyFileSync(
    path.join(root, 'research/10_policy_claims_atlas.csv'),
    path.join(dir, 'research/10_policy_claims_atlas.csv'),
  );
  copyFileSync(
    path.join(root, 'research/10_policy_assessment_casebook.md'),
    path.join(dir, 'research/10_policy_assessment_casebook.md'),
  );
  copyFileSync(path.join(root, 'LICENSE'), path.join(dir, 'LICENSE'));
  copyFileSync(
    path.join(root, 'src/data/claims.generated.json'),
    path.join(dir, 'src/data/claims.generated.json'),
  );
  copyFileSync(
    path.join(root, 'src/data/casebook.generated.json'),
    path.join(dir, 'src/data/casebook.generated.json'),
  );
  return dir;
}

describe('release gate pins published artefacts before regeneration', () => {
  it('passes against the pinned v0.1.1 working tree', () => {
    expect(runReleaseValidation(root)).toEqual([]);
    const out = execFileSync('npm', ['run', 'validate:release'], {
      cwd: root,
      encoding: 'utf8',
    });
    expect(out).toMatch(/Release validation passed/);
    expect(out).toContain(PINNED_ATLAS_SHA256.slice(0, 12));
  });

  it('rejects a benign atlas edit in an isolated tree even after regenerating generated JSON', () => {
    const dir = clonePinnedTree();
    const atlasPath = path.join(dir, 'research/10_policy_claims_atlas.csv');
    const original = readFileSync(atlasPath, 'utf8');
    const edited = `${original.trimEnd()}\n\n`;
    writeFileSync(atlasPath, edited, 'utf8');
    expect(sha256Buffer(edited)).not.toBe(PINNED_ATLAS_SHA256);

    // Ordinary source→generated validation can still pass after regenerating.
    const dataset = ingestAtlasCsv(edited, {
      expectPublishedCount: true,
      enforceKnownMissingUrls: true,
      sourceFile: 'research/10_policy_claims_atlas.csv',
    });
    writeFileSync(
      path.join(dir, 'src/data/claims.generated.json'),
      `${JSON.stringify(dataset, null, 2)}\n`,
      'utf8',
    );

    // Pin check alone fails — release gate must not accept the edited source.
    const pinIssues = checkPinnedReleaseSources(dir);
    expect(pinIssues.some((issue) => /Atlas SHA/i.test(issue))).toBe(true);

    const releaseIssues = runReleaseValidation(dir);
    expect(releaseIssues.some((issue) => /Atlas SHA/i.test(issue))).toBe(true);
  });
});
