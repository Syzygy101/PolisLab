/**
 * Deterministic structural parse of the published Policy Assessment Casebook.
 * Preserves original Markdown; does not reinterpret research content.
 */

import { CASE_IDS, type CaseId, RESEARCH_CASES } from './taxonomy';
import { V011_EXPECTED_CASE_TITLES } from './referenceExpectations';
import {
  CASEBOOK_SOURCE_PATH,
  COMMON_ALL_CASE_RULE_IDS,
  EXPECTED_CASE_COUNT,
  EXPECTED_SECTIONS_PER_CASE,
  caseSectionAnchor,
} from './casebookConstants';
import { extractClaimIdsFromMarkdown } from './casebookCitations';
import {
  CasebookDatasetSchema,
  type CasebookDataset,
  type CasebookDocumentPart,
  type CaseSection,
  type ParsedCase,
} from './casebookSchema';
import {
  RESEARCH_CORRECTION_PASS,
  RESEARCH_CUTOFF,
  RESEARCH_RELEASE,
} from './constants';
import { ResearchIngestError, sha256Hex } from './ingest';

const CASE_HEADING_RE = /^## Case ([1-4]) — (.+)$/;
const SECTION_HEADING_RE = /^### (\d+)\.\s+(.+)$/;
const CLOSING_H2_RE = /^## (.+)$/;

export interface CasebookParseOptions {
  sourceFile?: string;
  researchRelease?: string;
  researchCutoff?: string;
  correctionPass?: string;
  generatedAt?: string;
  /**
   * When provided, every extracted claim ID must resolve against this set.
   * Unknown IDs fail ingest.
   */
  knownClaimIds?: ReadonlySet<string>;
  /**
   * When provided, membershipClaimIds for each case must equal this atlas
   * membership (exact set comparison).
   */
  atlasMembershipByCase?: ReadonlyMap<CaseId, ReadonlySet<string>>;
}

function splitLinesPreserve(markdown: string): string[] {
  // Normalise to LF for line parsing; original content is rejoined with \n.
  return markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
}

function joinLines(lines: string[]): string {
  return lines.join('\n').replace(/^\n+/, '').replace(/\n+$/, '') + (lines.length ? '\n' : '');
}

function findCaseStarts(lines: string[]): Array<{ index: number; caseNum: number; title: string }> {
  const starts: Array<{ index: number; caseNum: number; title: string }> = [];
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(CASE_HEADING_RE);
    if (match) {
      starts.push({
        index: i,
        caseNum: Number(match[1]),
        title: match[2].trim(),
      });
    }
  }
  return starts;
}

function parseSections(
  caseLines: string[],
  caseId: CaseId,
): { sections: CaseSection[]; bodyMarkdown: string } {
  // Skip the case heading line (index 0).
  const bodyLines = caseLines.slice(1);
  const sectionStarts: Array<{ index: number; number: number; title: string; heading: string }> =
    [];

  for (let i = 0; i < bodyLines.length; i += 1) {
    const match = bodyLines[i].match(SECTION_HEADING_RE);
    if (match) {
      sectionStarts.push({
        index: i,
        number: Number(match[1]),
        title: match[2].trim(),
        heading: `${match[1]}. ${match[2].trim()}`,
      });
    }
  }

  if (sectionStarts.length !== EXPECTED_SECTIONS_PER_CASE) {
    throw new ResearchIngestError(
      `${caseId}: expected ${EXPECTED_SECTIONS_PER_CASE} numbered sections, found ${sectionStarts.length}`,
    );
  }

  for (let i = 0; i < EXPECTED_SECTIONS_PER_CASE; i += 1) {
    if (sectionStarts[i].number !== i + 1) {
      throw new ResearchIngestError(
        `${caseId}: section order broken at position ${i + 1}; got ${sectionStarts[i].number}`,
      );
    }
  }

  const sections: CaseSection[] = [];
  for (let i = 0; i < sectionStarts.length; i += 1) {
    const start = sectionStarts[i];
    const end =
      i + 1 < sectionStarts.length ? sectionStarts[i + 1].index : bodyLines.length;
    const markdownLines = bodyLines.slice(start.index + 1, end);
    // Drop trailing horizontal rule / blank padding between sections.
    while (
      markdownLines.length > 0 &&
      (markdownLines[markdownLines.length - 1].trim() === '' ||
        markdownLines[markdownLines.length - 1].trim() === '---')
    ) {
      markdownLines.pop();
    }
    const markdown = markdownLines.join('\n').replace(/^\n+/, '').replace(/\n+$/, '');
    sections.push({
      number: start.number,
      title: start.title,
      heading: start.heading,
      anchor: caseSectionAnchor(start.number),
      markdown: markdown.length ? `${markdown}\n` : '',
      explicitClaimIds: extractClaimIdsFromMarkdown(markdown),
    });
  }

  return {
    sections,
    bodyMarkdown: bodyLines.join('\n'),
  };
}

function parseClosingParts(lines: string[]): CasebookDocumentPart[] {
  const parts: CasebookDocumentPart[] = [];
  let current: { title: string; id: string; lines: string[] } | null = null;

  const flush = () => {
    if (!current) return;
    parts.push({
      id: current.id,
      title: current.title,
      markdown: joinLines(current.lines),
    });
    current = null;
  };

  for (const line of lines) {
    const match = line.match(CLOSING_H2_RE);
    if (match && !line.startsWith('## Case ')) {
      flush();
      const title = match[1].trim();
      current = {
        title,
        id: slugify(title),
        lines: [line],
      };
      continue;
    }
    if (current) {
      current.lines.push(line);
    }
  }
  flush();
  return parts;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function mergeMembership(
  bodyIds: readonly string[],
  commonIds: readonly string[],
): string[] {
  const set = new Set([...bodyIds, ...commonIds]);
  return [...set].sort((a, b) => a.localeCompare(b));
}

function setsEqual(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  if (a.size !== b.size) return false;
  for (const value of a) {
    if (!b.has(value)) return false;
  }
  return true;
}

/**
 * Parse the published casebook Markdown into a structured dataset.
 * Fails clearly on missing cases/sections, duplicate IDs, unknown atlas IDs,
 * or membership discrepancies when atlas membership is supplied.
 */
export function ingestCasebookMarkdown(
  markdown: string,
  options: CasebookParseOptions = {},
): CasebookDataset {
  const issues: string[] = [];
  const lines = splitLinesPreserve(markdown);
  const caseStarts = findCaseStarts(lines);

  if (caseStarts.length !== EXPECTED_CASE_COUNT) {
    throw new ResearchIngestError(
      `Expected ${EXPECTED_CASE_COUNT} case headings, found ${caseStarts.length}`,
    );
  }

  const seenCaseNums = new Set<number>();
  for (const start of caseStarts) {
    if (seenCaseNums.has(start.caseNum)) {
      throw new ResearchIngestError(`Duplicate case heading for Case ${start.caseNum}`);
    }
    seenCaseNums.add(start.caseNum);
  }

  for (let i = 0; i < EXPECTED_CASE_COUNT; i += 1) {
    if (caseStarts[i].caseNum !== i + 1) {
      throw new ResearchIngestError(
        `Case headings out of order: expected Case ${i + 1}, found Case ${caseStarts[i].caseNum}`,
      );
    }
  }

  const frontMatterMarkdown = joinLines(lines.slice(0, caseStarts[0].index));
  const frontMatterClaimIds = extractClaimIdsFromMarkdown(frontMatterMarkdown);

  // Common rules: explicit all-cases front-matter references.
  const commonRuleClaimIds = COMMON_ALL_CASE_RULE_IDS.filter((id) =>
    frontMatterClaimIds.includes(id),
  );
  if (commonRuleClaimIds.length !== COMMON_ALL_CASE_RULE_IDS.length) {
    const missing = COMMON_ALL_CASE_RULE_IDS.filter(
      (id) => !commonRuleClaimIds.includes(id),
    );
    issues.push(
      `Front matter missing required all-case rule IDs: ${missing.join(', ')}`,
    );
  }

  const cases: ParsedCase[] = [];

  for (let i = 0; i < caseStarts.length; i += 1) {
    const start = caseStarts[i];
    const end =
      i + 1 < caseStarts.length ? caseStarts[i + 1].index : lines.length;
    // Closing material after Case 4 starts at the next ## that is not a Case heading.
    let caseEnd = end;
    if (i === caseStarts.length - 1) {
      for (let j = start.index + 1; j < lines.length; j += 1) {
        if (lines[j].startsWith('## ') && !CASE_HEADING_RE.test(lines[j])) {
          caseEnd = j;
          break;
        }
      }
    }

    const caseLines = lines.slice(start.index, caseEnd);
    // Trim trailing --- separator.
    while (
      caseLines.length > 0 &&
      (caseLines[caseLines.length - 1].trim() === '' ||
        caseLines[caseLines.length - 1].trim() === '---')
    ) {
      caseLines.pop();
    }

    const caseId = `Case${start.caseNum}` as CaseId;
    if (!(CASE_IDS as readonly string[]).includes(caseId)) {
      throw new ResearchIngestError(`Unexpected case id ${caseId}`);
    }

    const expectedTitle = V011_EXPECTED_CASE_TITLES[caseId];
    if (start.title !== expectedTitle) {
      issues.push(
        `${caseId}: title mismatch — got "${start.title}", expected "${expectedTitle}"`,
      );
    }

    const taxonomy = RESEARCH_CASES.find((c) => c.id === caseId);
    if (taxonomy && taxonomy.title !== start.title) {
      issues.push(
        `${caseId}: taxonomy title diverges from published heading "${start.title}"`,
      );
    }

    const { sections } = parseSections(caseLines, caseId);
    const caseMarkdown = `${caseLines.join('\n')}\n`;
    const bodyClaimIds = extractClaimIdsFromMarkdown(
      caseLines.slice(1).join('\n'),
    );
    const membershipClaimIds = mergeMembership(bodyClaimIds, commonRuleClaimIds);

    if (options.knownClaimIds) {
      for (const id of bodyClaimIds) {
        if (!options.knownClaimIds.has(id)) {
          issues.push(`${caseId}: unknown atlas ID in case body: ${id}`);
        }
      }
    }

    if (options.atlasMembershipByCase) {
      const expected = options.atlasMembershipByCase.get(caseId);
      if (!expected) {
        issues.push(`${caseId}: missing atlas membership set`);
      } else {
        const actual = new Set(membershipClaimIds);
        if (!setsEqual(actual, expected)) {
          const missing = [...expected].filter((id) => !actual.has(id));
          const extra = [...actual].filter((id) => !expected.has(id));
          issues.push(
            `${caseId}: citation-membership discrepancy` +
              (missing.length ? `; missing from parse: ${missing.join(', ')}` : '') +
              (extra.length ? `; extra in parse: ${extra.join(', ')}` : ''),
          );
        }
      }
    }

    cases.push({
      id: caseId,
      title: start.title,
      heading: `Case ${start.caseNum} — ${start.title}`,
      markdown: caseMarkdown,
      sections,
      bodyClaimIds,
      membershipClaimIds,
    });
  }

  const lastCase = caseStarts[caseStarts.length - 1];
  let closingStart = lines.length;
  for (let j = lastCase.index + 1; j < lines.length; j += 1) {
    if (lines[j].startsWith('## ') && !CASE_HEADING_RE.test(lines[j])) {
      closingStart = j;
      break;
    }
  }
  const closingParts = parseClosingParts(lines.slice(closingStart));

  if (options.knownClaimIds) {
    for (const id of frontMatterClaimIds) {
      if (!options.knownClaimIds.has(id)) {
        issues.push(`Unknown atlas ID in front matter: ${id}`);
      }
    }
    for (const part of closingParts) {
      for (const id of extractClaimIdsFromMarkdown(part.markdown)) {
        if (!options.knownClaimIds.has(id)) {
          issues.push(`Unknown atlas ID in closing part "${part.id}": ${id}`);
        }
      }
    }
  }

  // Reject raw HTML blocks that would bypass safe rendering.
  if (/<[a-zA-Z][^>]*>/.test(markdown)) {
    // Allow only escaped mentions inside code — flag obvious HTML tags.
    const withoutCode = markdown
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]*`/g, '');
    if (/<[a-zA-Z][^>]*>/.test(withoutCode)) {
      issues.push('Unsupported embedded HTML in casebook source');
    }
  }

  if (issues.length > 0) {
    throw new ResearchIngestError('Casebook validation failed', issues);
  }

  const sourceContentSha256 = sha256Hex(markdown);
  const dataset = CasebookDatasetSchema.parse({
    provenance: {
      sourceFile: options.sourceFile ?? CASEBOOK_SOURCE_PATH,
      researchRelease: options.researchRelease ?? RESEARCH_RELEASE,
      researchCutoff: options.researchCutoff ?? RESEARCH_CUTOFF,
      correctionPass: options.correctionPass ?? RESEARCH_CORRECTION_PASS,
      sourceContentSha256,
      generatedAt: options.generatedAt ?? `content-sha256:${sourceContentSha256}`,
      caseCount: cases.length,
      sectionCount: cases.reduce((n, c) => n + c.sections.length, 0),
    },
    frontMatterMarkdown,
    commonRuleClaimIds,
    cases,
    closingParts,
  });

  return dataset;
}

/** Lightweight structural parse without atlas membership checks (fixtures). */
export function parseCasebookStructure(markdown: string): CasebookDataset {
  return ingestCasebookMarkdown(markdown, {});
}
