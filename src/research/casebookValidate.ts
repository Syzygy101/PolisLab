import type { CaseId } from './taxonomy';
import type { CasebookDataset } from './casebookSchema';
import type { Claim } from './schema';
import {
  EXPECTED_CASE_COUNT,
  EXPECTED_TOTAL_SECTIONS,
  V011_EXPECTED_CASE_MEMBERSHIP_SETS,
  V011_EXPECTED_BODY_CLAIM_SETS,
} from './casebookConstants';
import { V011_EXPECTED_CASE_TITLES } from './referenceExpectations';
import { ResearchIngestError } from './ingest';

function setEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const sb = new Set(b);
  return a.every((id) => sb.has(id));
}

/** Validate a generated casebook dataset against independent expectations + atlas. */
export function validateCasebookDataset(
  dataset: CasebookDataset,
  claims: readonly Claim[],
): void {
  const issues: string[] = [];

  if (dataset.cases.length !== EXPECTED_CASE_COUNT) {
    issues.push(`Expected ${EXPECTED_CASE_COUNT} cases, got ${dataset.cases.length}`);
  }
  if (dataset.provenance.sectionCount !== EXPECTED_TOTAL_SECTIONS) {
    issues.push(
      `Expected ${EXPECTED_TOTAL_SECTIONS} sections, got ${dataset.provenance.sectionCount}`,
    );
  }

  const atlasByCase = new Map<CaseId, string[]>();
  for (const claim of claims) {
    for (const caseId of claim.cases) {
      const list = atlasByCase.get(caseId as CaseId) ?? [];
      list.push(claim.claim_id);
      atlasByCase.set(caseId as CaseId, list);
    }
  }

  for (const researchCase of dataset.cases) {
    const expectedTitle = V011_EXPECTED_CASE_TITLES[researchCase.id];
    if (researchCase.title !== expectedTitle) {
      issues.push(
        `${researchCase.id}: title "${researchCase.title}" ≠ expected "${expectedTitle}"`,
      );
    }
    if (researchCase.sections.length !== 10) {
      issues.push(`${researchCase.id}: expected 10 sections`);
    }

    const expectedMembers = V011_EXPECTED_CASE_MEMBERSHIP_SETS[researchCase.id];
    const atlasMembers = (atlasByCase.get(researchCase.id) ?? []).sort((a, b) =>
      a.localeCompare(b),
    );
    if (!setEqual(atlasMembers, [...expectedMembers])) {
      issues.push(
        `${researchCase.id}: atlas CSV membership diverges from independent expectation`,
      );
    }
    if (!setEqual(researchCase.membershipClaimIds, [...expectedMembers])) {
      issues.push(
        `${researchCase.id}: parsed membership diverges from independent expectation`,
      );
    }
    if (
      !setEqual(researchCase.bodyClaimIds, [
        ...V011_EXPECTED_BODY_CLAIM_SETS[researchCase.id],
      ])
    ) {
      issues.push(
        `${researchCase.id}: parsed body claim set diverges from independent expectation`,
      );
    }
  }

  const requiredClosing = [
    'source-to-claim-cross-reference-compact',
    'four-case-comparison-table',
  ];
  const closingIds = new Set(dataset.closingParts.map((p) => p.id));
  for (const id of requiredClosing) {
    if (!closingIds.has(id)) {
      issues.push(`Missing required closing part: ${id}`);
    }
  }

  if (!dataset.frontMatterMarkdown.includes('How to use this casebook')) {
    issues.push('Front matter missing “How to use this casebook”');
  }
  if (!dataset.commonRuleClaimIds.includes('ATLAS-ASM-002')) {
    issues.push('Common rules missing ATLAS-ASM-002');
  }
  if (!dataset.commonRuleClaimIds.includes('ATLAS-CON-003')) {
    issues.push('Common rules missing ATLAS-CON-003');
  }

  if (issues.length > 0) {
    throw new ResearchIngestError('Casebook dataset validation failed', issues);
  }
}

export function findCasebookGeneratedDrift(
  expected: CasebookDataset,
  actualRaw: unknown,
): string[] {
  const issues: string[] = [];
  if (!actualRaw || typeof actualRaw !== 'object') {
    return ['Generated casebook is not an object'];
  }
  const actual = actualRaw as CasebookDataset;
  if (actual.provenance?.sourceContentSha256 !== expected.provenance.sourceContentSha256) {
    issues.push('Casebook SHA-256 drift between source and generated artefact');
  }
  if (JSON.stringify(actual.cases) !== JSON.stringify(expected.cases)) {
    issues.push('Generated casebook cases drift from freshly ingested source');
  }
  if (actual.frontMatterMarkdown !== expected.frontMatterMarkdown) {
    issues.push('Generated casebook front matter drift');
  }
  return issues;
}
