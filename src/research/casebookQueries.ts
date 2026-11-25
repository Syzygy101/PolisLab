import type { CaseId } from './taxonomy';
import type { CasebookDataset, ParsedCase, CaseSection } from './casebookSchema';
import { isCaseId } from './taxonomy';
import type { Claim } from './schema';

export function findCase(
  dataset: CasebookDataset,
  caseId: string,
): ParsedCase | undefined {
  if (!isCaseId(caseId)) return undefined;
  return dataset.cases.find((c) => c.id === caseId);
}

export function findCaseSection(
  researchCase: ParsedCase,
  sectionNumber: number,
): CaseSection | undefined {
  return researchCase.sections.find((s) => s.number === sectionNumber);
}

/** Claims whose atlas casebook_cases field lists this case (authoritative membership). */
export function atlasMembersForCase(claims: readonly Claim[], caseId: CaseId): Claim[] {
  return claims.filter((c) => c.cases.includes(caseId));
}

export function atlasMembershipIds(claims: readonly Claim[], caseId: CaseId): string[] {
  return atlasMembersForCase(claims, caseId)
    .map((c) => c.claim_id)
    .sort((a, b) => a.localeCompare(b));
}

export type CitationRelation =
  | 'section_explicit'
  | 'case_body'
  | 'common_rule'
  | 'atlas_member_only'
  | 'related_metadata';

/**
 * Classify how a claim relates to a case investigation.
 * Categories are not interchangeable.
 */
export function classifyCitationRelation(
  dataset: CasebookDataset,
  caseId: CaseId,
  claimId: string,
  options: {
    sectionNumber?: number;
    atlasMemberIds: ReadonlySet<string>;
    claimCases: readonly string[];
  },
): CitationRelation {
  const researchCase = findCase(dataset, caseId);
  if (!researchCase) {
    return 'related_metadata';
  }

  if (
    options.sectionNumber !== undefined &&
    researchCase.sections
      .find((s) => s.number === options.sectionNumber)
      ?.explicitClaimIds.includes(claimId)
  ) {
    return 'section_explicit';
  }

  if (researchCase.bodyClaimIds.includes(claimId)) {
    return 'case_body';
  }

  if (
    dataset.commonRuleClaimIds.includes(claimId) &&
    options.atlasMemberIds.has(claimId)
  ) {
    return 'common_rule';
  }

  if (options.atlasMemberIds.has(claimId) || options.claimCases.includes(caseId)) {
    return 'atlas_member_only';
  }

  return 'related_metadata';
}

export const CITATION_RELATION_LABELS: Record<CitationRelation, string> = {
  section_explicit: 'Cited explicitly in this section',
  case_body: 'Cited directly in the case body',
  common_rule: 'Common methodological rule (all four cases)',
  atlas_member_only: 'Direct case membership (atlas)',
  related_metadata: 'Related through shared metadata only',
};
