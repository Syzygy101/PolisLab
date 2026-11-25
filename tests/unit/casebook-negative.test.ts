import { describe, expect, it } from 'vitest';
import {
  ResearchIngestError,
  ingestCasebookMarkdown,
  isSafeHttpUrl,
} from '../../src/research/index.ts';

const MINIMAL_FRONT = `# Policy Assessment Casebook

## How to use this casebook

**Hard rules** (**ATLAS-ASM-002**; **ATLAS-CON-003** — all cases)

1. Access ≠ capacity.
`;

function caseBlock(n: number, title: string, opts?: { skipSection?: number; extraCaseId?: string }) {
  const sections = Array.from({ length: 10 }, (_, i) => {
    const num = i + 1;
    if (opts?.skipSection === num) return '';
    return `### ${num}. Section ${num} title\n\nBody for section ${num} with ATLAS-EMP-00${Math.min(num, 7)}.\n\n`;
  }).join('\n');
  const heading = opts?.extraCaseId
    ? `## Case ${opts.extraCaseId} — ${title}`
    : `## Case ${n} — ${title}`;
  return `${heading}\n\n${sections}`;
}

const TITLES = [
  'Undeveloped supermarket sites',
  'Foreign greenfield grocery investment',
  'Differentiated entry and scale-up',
  'Supermarket acquisition oversight',
];

function fullValidish(): string {
  return (
    MINIMAL_FRONT +
    '\n---\n\n' +
    TITLES.map((t, i) => caseBlock(i + 1, t)).join('\n---\n\n') +
    '\n## Four-case comparison table\n\n| A | B |\n| --- | --- |\n| x | y |\n'
  );
}

describe('casebook negative fixtures', () => {
  it('fails on missing case heading', () => {
    const md =
      MINIMAL_FRONT +
      '\n---\n\n' +
      TITLES.slice(0, 3)
        .map((t, i) => caseBlock(i + 1, t))
        .join('\n---\n\n');
    expect(() => ingestCasebookMarkdown(md)).toThrow(ResearchIngestError);
    expect(() => ingestCasebookMarkdown(md)).toThrow(/Expected 4 case headings/);
  });

  it('fails on missing numbered section', () => {
    const md =
      MINIMAL_FRONT +
      '\n---\n\n' +
      TITLES.map((t, i) =>
        caseBlock(i + 1, t, i === 0 ? { skipSection: 7 } : undefined),
      ).join('\n---\n\n');
    expect(() => ingestCasebookMarkdown(md)).toThrow(/expected 10 numbered sections/);
  });

  it('fails on duplicate case ID', () => {
    const md =
      MINIMAL_FRONT +
      '\n---\n\n' +
      caseBlock(1, TITLES[0]) +
      '\n---\n\n' +
      caseBlock(1, TITLES[0]) +
      '\n---\n\n' +
      caseBlock(2, TITLES[1]) +
      '\n---\n\n' +
      caseBlock(3, TITLES[2]);
    expect(() => ingestCasebookMarkdown(md)).toThrow(/Duplicate case heading/);
  });

  it('fails on unknown atlas ID when knownClaimIds provided', () => {
    const md = fullValidish().replace('ATLAS-EMP-001', 'ATLAS-FAKE-999');
    expect(() =>
      ingestCasebookMarkdown(md, {
        knownClaimIds: new Set(['ATLAS-ASM-002', 'ATLAS-CON-003', 'ATLAS-EMP-001']),
      }),
    ).toThrow(/unknown atlas ID/i);
  });

  it('fails on citation-membership discrepancy', () => {
    const md = fullValidish();
    const fakeMembership = new Map([
      ['Case1', new Set(['ATLAS-EMP-001'])],
      ['Case2', new Set(['ATLAS-EMP-001'])],
      ['Case3', new Set(['ATLAS-EMP-001'])],
      ['Case4', new Set(['ATLAS-EMP-001'])],
    ]);
    expect(() =>
      ingestCasebookMarkdown(md, {
        knownClaimIds: new Set(
          Array.from({ length: 20 }, (_, i) => `ATLAS-EMP-${String(i + 1).padStart(3, '0')}`).concat([
            'ATLAS-ASM-002',
            'ATLAS-CON-003',
          ]),
        ),
        atlasMembershipByCase: fakeMembership as Map<
          'Case1' | 'Case2' | 'Case3' | 'Case4',
          Set<string>
        >,
      }),
    ).toThrow(/citation-membership discrepancy/);
  });

  it('fails on unsupported embedded HTML', () => {
    const md = fullValidish().replace(
      'Body for section 1',
      'Body for section 1 <script>alert(1)</script>',
    );
    expect(() => ingestCasebookMarkdown(md)).toThrow(/embedded HTML/i);
  });

  it('rejects unsafe javascript: links at render-time via safeUrl (source may still parse)', () => {
    // Parsing itself allows markdown links; rendering must not make them clickable.
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpUrl('https://example.gov.au/x')).toBe(true);
  });

  it('does not silently accept a malformed table-free but structure-broken casebook', () => {
    const md = '# Only a title\n\nNo cases here.\n';
    expect(() => ingestCasebookMarkdown(md)).toThrow(ResearchIngestError);
  });
});
