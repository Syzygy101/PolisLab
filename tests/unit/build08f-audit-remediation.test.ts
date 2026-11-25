/**
 * Targeted Build 08F regressions from the independent 08A audit findings.
 * Passing an older suite is not sufficient — these assert the corrected behaviours.
 */
import {
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  expandClaimIdRanges,
  splitTextWithClaimIds,
} from '../../src/research/casebookCitations';
import { COMPARISON_DATASET } from '../../src/research/comparisonDataset';
import {
  isPermittedPublishedCitation,
  loadPinnedPublishedCorpus,
  runArtifactSafetyCheck,
} from '../../scripts/check-artifact-safety';

const root = path.resolve(import.meta.dirname, '../..');
const tempRoots: string[] = [];

afterEach(() => {
  while (tempRoots.length > 0) {
    const dir = tempRoots.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe('08F · release-scoped absence wording', () => {
  it('Case 3 GAP-002 evidence uses registered / release-scoped language', () => {
    const evid = COMPARISON_DATASET.evidenceUses.find(
      (e) => e.id === 'C3-EVID-GAP-002',
    )!;
    expect(evid.supportsProposition).toMatch(/registered in the published release/i);
    expect(evid.supportsProposition).toMatch(/ATLAS-GAP-002/);
    expect(evid.supportsProposition).not.toMatch(
      /No Australian diversion ratios between majors and hard-discount or specialty formats exist\./,
    );
    expect(evid.supportsProposition).toMatch(/absence-of-finding/i);
  });

  it('Case 4 GAP-003 evidence uses registered / qualifying language', () => {
    const evid = COMPARISON_DATASET.evidenceUses.find(
      (e) => e.id === 'C4-EVID-GAP-003',
    )!;
    expect(evid.supportsProposition).toMatch(/registered in the published release/i);
    expect(evid.supportsProposition).toMatch(/ATLAS-GAP-003/);
    expect(evid.supportsProposition).not.toMatch(
      /No causal evaluation of Part 3 on foreclosure or prices exists/,
    );
  });

  it('Case 1–4 outcome limitations avoid universal non-existence phrasing', () => {
    const targets = [
      'C1-OUT-O5',
      'C1-OUT-O6',
      'C2-OUT-O5',
      'C3-OUT-O5',
      'C4-OUT-O5',
    ] as const;
    for (const id of targets) {
      const row = COMPARISON_DATASET.outcomeAssessments.find((o) => o.id === id)!;
      const text = `${row.judgment} ${row.limitations}`;
      expect(text).not.toMatch(
        /there are no Australian diversion ratios\.|No Australian diversion ratios between majors and hard-discount or specialty formats;|No causal evaluation of Part 3 on foreclosure or prices exists;/,
      );
      expect(text.toLowerCase()).toMatch(
        /registered|unidentified|not assessable|not identified|not measured/,
      );
    }
  });
});

describe('08F · Case 3 Sadun pathway uses LIT-003 not LIT-002', () => {
  it('C3-PATH-UNFAV-1 names ATLAS-LIT-003 comparatively and never presents LIT-002 as Sadun support', () => {
    const pathRow = COMPARISON_DATASET.pathways.find((p) => p.id === 'C3-PATH-UNFAV-1')!;
    expect(pathRow.summary).toMatch(/Sadun/i);
    expect(pathRow.summary).toMatch(/ATLAS-LIT-003/);
    expect(pathRow.summary).toMatch(/comparative UK|Case 1 atlas membership/i);
    expect(pathRow.summary).toMatch(/not Australian parameters|UK effect sizes/i);
    const claimIds = pathRow.sources
      .filter((s) => s.kind === 'claim')
      .map((s) => ('id' in s ? s.id : ''));
    // LIT-003 stays Case1 membership; must not be attached as a Case3 claim source.
    expect(claimIds).not.toContain('ATLAS-LIT-003');
    expect(claimIds).not.toContain('ATLAS-LIT-002');
    expect(
      pathRow.sources.some(
        (s) => s.kind === 'case_section' && s.caseId === 'Case3' && s.section === 6,
      ),
    ).toBe(true);
    expect(pathRow.summary).toMatch(/Warehouse-club.*ATLAS-LIT-002|ATLAS-LIT-002.*not cited as Sadun/i);
  });
});

describe('08F · citation token boundaries (audit reproductions)', () => {
  it('rejects embedded identifiers with leading or trailing alphanumerics', () => {
    expect(splitTextWithClaimIds('XATLAS-LEG-001')).toEqual([
      { type: 'text', value: 'XATLAS-LEG-001' },
    ]);
    expect(splitTextWithClaimIds('ATLAS-LEG-001ABC')).toEqual([
      { type: 'text', value: 'ATLAS-LEG-001ABC' },
    ]);
    expect(splitTextWithClaimIds('ATLAS-LEG-0010')).toEqual([
      { type: 'text', value: 'ATLAS-LEG-0010' },
    ]);
  });

  it('preserves standalone IDs, punctuation adjacency, and compact ranges', () => {
    expect(splitTextWithClaimIds('see ATLAS-LEG-001.')).toEqual([
      { type: 'text', value: 'see ' },
      { type: 'claim', id: 'ATLAS-LEG-001' },
      { type: 'text', value: '.' },
    ]);
    expect(splitTextWithClaimIds('(ATLAS-LEG-001)')).toEqual([
      { type: 'text', value: '(' },
      { type: 'claim', id: 'ATLAS-LEG-001' },
      { type: 'text', value: ')' },
    ]);
    const range = splitTextWithClaimIds('ATLAS-LEG-001–003');
    expect(range).toEqual([
      {
        type: 'claim_range',
        display: 'ATLAS-LEG-001–003',
        ids: ['ATLAS-LEG-001', 'ATLAS-LEG-002', 'ATLAS-LEG-003'],
      },
    ]);
    expect(expandClaimIdRanges('ATLAS-LEG-001–003')).toEqual([
      'ATLAS-LEG-001',
      'ATLAS-LEG-002',
      'ATLAS-LEG-003',
    ]);
  });
});

describe('08F · artifact safety gate', () => {
  it('allows pinned published citation strings (positive fixture)', () => {
    const corpus = loadPinnedPublishedCorpus(root);
    expect(isPermittedPublishedCitation('research/04_pilot_sample.csv', corpus)).toBe(true);
    expect(
      isPermittedPublishedCitation('research/04_empirical_pilot_findings.md', corpus),
    ).toBe(true);
    expect(isPermittedPublishedCitation('World Economic Policy', corpus)).toBe(true);

    const dir = mkdtempSync(path.join(tmpdir(), 'polislab-art-pos-'));
    tempRoots.push(dir);
    for (const rel of [
      'research/10_policy_claims_atlas.csv',
      'research/10_policy_assessment_casebook.md',
      'LICENSE',
    ]) {
      mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
      copyFileSync(path.join(root, rel), path.join(dir, rel));
    }
    mkdirSync(path.join(dir, 'dist/assets'), { recursive: true });
    writeFileSync(
      path.join(dir, 'dist/assets/bundle.js'),
      [
        'const note = "public register URLs are recorded in research/04_pilot_sample.csv',
        ' and research/04_empirical_pilot_findings.md.";',
        'const framing = "World Economic Policy";',
      ].join(''),
      'utf8',
    );
    expect(runArtifactSafetyCheck(dir)).toEqual([]);
  });

  it('rejects a forbidden unpublished file in dist (negative fixture)', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'polislab-art-neg-file-'));
    tempRoots.push(dir);
    for (const rel of [
      'research/10_policy_claims_atlas.csv',
      'research/10_policy_assessment_casebook.md',
      'LICENSE',
    ]) {
      mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
      copyFileSync(path.join(root, rel), path.join(dir, rel));
    }
    mkdirSync(path.join(dir, 'dist'), { recursive: true });
    writeFileSync(
      path.join(dir, 'dist/04_empirical_pilot_findings.md'),
      '# synthetic unpublished stub — not real research\n',
      'utf8',
    );
    const issues = runArtifactSafetyCheck(dir);
    expect(issues.some((i) => i.code === 'dist_forbidden_file')).toBe(true);
  });

  it('rejects an unapproved embedded unpublished path token (negative fixture)', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'polislab-art-neg-token-'));
    tempRoots.push(dir);
    for (const rel of [
      'research/10_policy_claims_atlas.csv',
      'research/10_policy_assessment_casebook.md',
      'LICENSE',
    ]) {
      mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
      copyFileSync(path.join(root, rel), path.join(dir, rel));
    }
    mkdirSync(path.join(dir, 'dist/assets'), { recursive: true });
    // Synthetic path that must NOT appear in the pinned published corpus.
    writeFileSync(
      path.join(dir, 'dist/assets/leak.js'),
      'export const leak = "copied from research/03_unpublished_synthetic_fixture_08f.md";\n',
      'utf8',
    );
    const issues = runArtifactSafetyCheck(dir);
    expect(issues.some((i) => i.code === 'embedded_unpublished_token')).toBe(true);
    expect(
      issues.some((i) => i.detail.includes('research/03_unpublished_synthetic_fixture_08f.md')),
    ).toBe(true);
  });
});
