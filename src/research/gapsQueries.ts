/**
 * Evidence Gaps Laboratory — lookups, filters, and integrity validation.
 */

import type { Claim } from './schema';
import type { CasebookDataset } from './casebookSchema';
import {
  expandMechanismFamilyTags,
  isMechanismFamilyId,
  isOutcomeStageId,
  type CaseId,
  type OutcomeStageId,
} from './taxonomy';
import {
  displayRequirementText,
  parseSection9Items,
  sourceTextsMatch,
} from './gapsParse';
import {
  GAPS_REGISTRY,
  GAPS_SOURCE_CONTENT_SHA256,
  V011_EXPECTED_REQUIREMENT_COUNTS,
  V011_EXPECTED_REQUIREMENT_TOTAL,
} from './gapsRequirements';
import {
  type GapsRegistry,
  type ResearchAgendaProgramme,
  type ResearchAgendaProgrammeId,
  type ResearchRequirement,
  EMPTY_GAPS_FILTERS,
  type GapsFilterState,
  RESEARCH_AGENDA_PROGRAMME_IDS,
  isAgendaProgrammeId,
  isClaimStatus,
  isGapsCaseId,
  isObservationRole,
  isResearchRequirementType,
} from './gapsSchema';

export {
  EMPTY_GAPS_FILTERS,
  type GapsFilterState,
  isAgendaProgrammeId,
  isClaimStatus,
  isGapsCaseId,
  isObservationRole,
  isResearchRequirementType,
};

export function listResearchRequirements(
  registry: GapsRegistry = GAPS_REGISTRY,
): ResearchRequirement[] {
  return registry.requirements;
}

export function getResearchRequirement(
  id: string,
  registry: GapsRegistry = GAPS_REGISTRY,
): ResearchRequirement | undefined {
  return registry.requirements.find((r) => r.id === id);
}

export function isKnownRequirementId(
  id: string,
  registry: GapsRegistry = GAPS_REGISTRY,
): boolean {
  return registry.requirements.some((r) => r.id === id);
}

export function requirementsForCase(
  caseId: CaseId,
  registry: GapsRegistry = GAPS_REGISTRY,
): ResearchRequirement[] {
  return registry.requirements.filter((r) => r.caseId === caseId);
}

export function requirementsReferencingClaim(
  claimId: string,
  registry: GapsRegistry = GAPS_REGISTRY,
): ResearchRequirement[] {
  return registry.requirements.filter((r) =>
    r.referencedClaimIds.includes(claimId),
  );
}

export function requirementsForMechanism(
  mechanismId: string,
  opts: { familyExpand?: boolean } = {},
  registry: GapsRegistry = GAPS_REGISTRY,
): ResearchRequirement[] {
  const tags = new Set<string>();
  if (opts.familyExpand && isMechanismFamilyId(mechanismId)) {
    for (const t of expandMechanismFamilyTags(mechanismId)) tags.add(t);
  } else {
    tags.add(mechanismId);
  }
  return registry.requirements.filter((r) =>
    r.associatedMechanismIds.some((m) => tags.has(m)),
  );
}

export function requirementsForOutcome(
  outcomeId: OutcomeStageId,
  registry: GapsRegistry = GAPS_REGISTRY,
): ResearchRequirement[] {
  return registry.requirements.filter((r) =>
    r.associatedOutcomeIds.includes(outcomeId),
  );
}

export function getAgendaProgramme(
  id: string,
  registry: GapsRegistry = GAPS_REGISTRY,
): ResearchAgendaProgramme | undefined {
  return registry.agendaProgrammes.find((p) => p.id === id);
}

export function requirementsForAgenda(
  programmeId: ResearchAgendaProgrammeId,
  registry: GapsRegistry = GAPS_REGISTRY,
): ResearchRequirement[] {
  const programme = getAgendaProgramme(programmeId, registry);
  if (!programme) return [];
  const idSet = new Set(programme.requirementIds);
  return registry.requirements.filter((r) => idSet.has(r.id));
}

export function filterResearchRequirements(
  filters: GapsFilterState,
  claims: Claim[],
  registry: GapsRegistry = GAPS_REGISTRY,
): ResearchRequirement[] {
  let rows = registry.requirements;

  if (filters.agenda) {
    rows = requirementsForAgenda(filters.agenda, registry);
  }

  if (filters.claimId) {
    rows = rows.filter((r) => r.referencedClaimIds.includes(filters.claimId!));
  }

  if (filters.cases.length > 0) {
    const set = new Set(filters.cases);
    rows = rows.filter((r) => set.has(r.caseId));
  }

  if (filters.outcomes.length > 0) {
    const set = new Set(filters.outcomes);
    rows = rows.filter((r) => r.associatedOutcomeIds.some((o) => set.has(o)));
  }

  if (filters.requirementTypes.length > 0) {
    const set = new Set(filters.requirementTypes);
    rows = rows.filter((r) => set.has(r.requirementType));
  }

  if (filters.observationRoles.length > 0) {
    const set = new Set(filters.observationRoles);
    rows = rows.filter((r) => set.has(r.observationRole));
  }

  if (filters.mechanisms.length > 0 || filters.mechanismFamilies.length > 0) {
    const tags = new Set<string>();
    for (const m of filters.mechanisms) tags.add(m);
    for (const f of filters.mechanismFamilies) {
      for (const t of expandMechanismFamilyTags(f)) tags.add(t);
    }
    rows = rows.filter((r) =>
      r.associatedMechanismIds.some((m) => tags.has(m)),
    );
  }

  if (filters.statuses.length > 0) {
    const statusSet = new Set(filters.statuses);
    const claimById = new Map(claims.map((c) => [c.claim_id, c]));
    rows = rows.filter((r) =>
      r.referencedClaimIds.some((id) => {
        const claim = claimById.get(id);
        return claim ? statusSet.has(claim.status) : false;
      }),
    );
  }

  return rows;
}

/** Dynamic atlas-side counts — never sum as unique unresolved questions. */
export interface GapsAtlasCounts {
  gapPrefixed: number;
  absenceOfFinding: number;
  unresolvedHypothesis: number;
  totalClaims: number;
}

export function computeGapsAtlasCounts(claims: Claim[]): GapsAtlasCounts {
  return {
    gapPrefixed: claims.filter((c) => c.claim_id.startsWith('ATLAS-GAP-')).length,
    absenceOfFinding: claims.filter((c) => c.status === 'absence_of_finding')
      .length,
    unresolvedHypothesis: claims.filter(
      (c) => c.status === 'unresolved_hypothesis',
    ).length,
    totalClaims: claims.length,
  };
}

export function claimsWithAssessmentChangingObservations(
  claims: Claim[],
): Claim[] {
  return claims.filter(
    (c) => c.observation_that_would_alter_assessment.trim().length > 0,
  );
}

/** Case-wide requirements: comparisonVariantIds is null or empty. */
export function isCaseWideRequirement(req: ResearchRequirement): boolean {
  return !req.comparisonVariantIds || req.comparisonVariantIds.length === 0;
}

/** Requirements explicitly linked to a comparison variant ID. */
export function requirementsForVariant(
  variantId: string,
  caseId: CaseId,
  registry: GapsRegistry = GAPS_REGISTRY,
): ResearchRequirement[] {
  return registry.requirements.filter(
    (r) =>
      r.caseId === caseId &&
      !isCaseWideRequirement(r) &&
      (r.comparisonVariantIds?.includes(variantId) ?? false),
  );
}

/** Case-wide §9 requirements for a case (not variant-assigned). */
export function caseWideRequirements(
  caseId: CaseId,
  registry: GapsRegistry = GAPS_REGISTRY,
): ResearchRequirement[] {
  return registry.requirements.filter(
    (r) => r.caseId === caseId && isCaseWideRequirement(r),
  );
}

/**
 * Partition requirements for a two-variant comparison.
 * Same-case: shared case-wide once; variant-specific per side.
 * Cross-case: each side keeps its own case-wide + variant-specific set
 * (no silent reassignment across cases).
 */
export function partitionComparisonRequirements(
  variantA: { id: string; caseId: CaseId } | null,
  variantB: { id: string; caseId: CaseId } | null,
  registry: GapsRegistry = GAPS_REGISTRY,
): {
  sharedCaseWide: ResearchRequirement[];
  sideA: ResearchRequirement[];
  sideB: ResearchRequirement[];
  sameCase: boolean;
} {
  if (!variantA && !variantB) {
    return { sharedCaseWide: [], sideA: [], sideB: [], sameCase: false };
  }
  if (variantA && variantB && variantA.caseId === variantB.caseId) {
    return {
      sameCase: true,
      sharedCaseWide: caseWideRequirements(variantA.caseId, registry),
      sideA: requirementsForVariant(variantA.id, variantA.caseId, registry),
      sideB: requirementsForVariant(variantB.id, variantB.caseId, registry),
    };
  }
  const sideFor = (v: { id: string; caseId: CaseId } | null) => {
    if (!v) return [];
    return [
      ...caseWideRequirements(v.caseId, registry),
      ...requirementsForVariant(v.id, v.caseId, registry),
    ];
  };
  return {
    sameCase: false,
    sharedCaseWide: [],
    sideA: sideFor(variantA),
    sideB: sideFor(variantB),
  };
}

export function requirementHref(id: string): string {
  return `/gaps/${id}`;
}

export function casebookSection9Href(caseId: CaseId): string {
  return `/casebook/${caseId}#section-9`;
}

export interface GapsValidationIssue {
  path: string;
  message: string;
}

export interface GapsValidationResult {
  ok: boolean;
  issues: GapsValidationIssue[];
}

/**
 * Validate the curated registry against casebook §9 source text, claim IDs,
 * mechanism/outcome tags, and comparison variant IDs.
 */
/**
 * @param knownVariants — comparison variant id/case pairs used to validate
 *   comparisonVariantIds. Pass from the comparison dataset at the call site so
 *   this module does not eagerly import the comparison dataset into the main
 *   Claims/Overview bundle.
 */
export function validateGapsRegistry(
  registry: GapsRegistry,
  claims: Claim[],
  casebook: CasebookDataset,
  knownVariants: ReadonlyArray<{ id: string; caseId: CaseId }>,
): GapsValidationResult {
  const issues: GapsValidationIssue[] = [];
  const claimIds = new Set(claims.map((c) => c.claim_id));
  const variantIds = new Set(knownVariants.map((v) => v.id));
  const variantById = new Map(knownVariants.map((v) => [v.id, v]));

  if (registry.requirements.length !== V011_EXPECTED_REQUIREMENT_TOTAL) {
    issues.push({
      path: 'requirements',
      message: `Expected ${V011_EXPECTED_REQUIREMENT_TOTAL} requirements, found ${registry.requirements.length}`,
    });
  }

  if (registry.provenance.sourceContentSha256 !== GAPS_SOURCE_CONTENT_SHA256) {
    issues.push({
      path: 'provenance.sourceContentSha256',
      message: 'Registry SHA does not match pinned casebook SHA',
    });
  }

  if (
    registry.provenance.sourceContentSha256 !==
    casebook.provenance.sourceContentSha256
  ) {
    issues.push({
      path: 'provenance.sourceContentSha256',
      message: 'Registry SHA does not match generated casebook provenance SHA',
    });
  }

  for (const caseId of Object.keys(V011_EXPECTED_REQUIREMENT_COUNTS) as CaseId[]) {
    const expected = V011_EXPECTED_REQUIREMENT_COUNTS[caseId];
    const actual = registry.requirements.filter((r) => r.caseId === caseId).length;
    if (actual !== expected) {
      issues.push({
        path: `requirements.${caseId}`,
        message: `Expected ${expected} §9 items for ${caseId}, found ${actual}`,
      });
    }

    const researchCase = casebook.cases.find((c) => c.id === caseId);
    if (!researchCase) {
      issues.push({
        path: `casebook.${caseId}`,
        message: `Case ${caseId} missing from generated casebook`,
      });
      continue;
    }
    const section9 = researchCase.sections.find((s) => s.number === 9);
    if (!section9) {
      issues.push({
        path: `casebook.${caseId}.section-9`,
        message: `§9 missing for ${caseId}`,
      });
      continue;
    }
    const parsed = parseSection9Items(section9.markdown);
    if (parsed.length !== expected) {
      issues.push({
        path: `casebook.${caseId}.section-9.items`,
        message: `Parsed ${parsed.length} §9 items for ${caseId}, expected ${expected}`,
      });
    }
    const caseReqs = registry.requirements
      .filter((r) => r.caseId === caseId)
      .sort((a, b) => a.itemNumber - b.itemNumber);
    for (const req of caseReqs) {
      const sourceItem = parsed.find((p) => p.itemNumber === req.itemNumber);
      if (!sourceItem) {
        issues.push({
          path: req.id,
          message: `No §9 item ${req.itemNumber} in ${caseId} source`,
        });
        continue;
      }
      if (!sourceTextsMatch(req.sourceText, sourceItem.sourceText)) {
        issues.push({
          path: `${req.id}.sourceText`,
          message: `Source text drift for ${req.id}. Registry: ${JSON.stringify(displayRequirementText(req.sourceText))} Source: ${JSON.stringify(displayRequirementText(sourceItem.sourceText))}`,
        });
      }
    }
  }

  const seenIds = new Set<string>();
  for (const req of registry.requirements) {
    if (seenIds.has(req.id)) {
      issues.push({ path: req.id, message: 'Duplicate requirement ID' });
    }
    seenIds.add(req.id);

    for (const claimId of req.referencedClaimIds) {
      if (!claimIds.has(claimId)) {
        issues.push({
          path: `${req.id}.referencedClaimIds`,
          message: `Unknown claim ${claimId}`,
        });
      } else {
        const claim = claims.find((c) => c.claim_id === claimId)!;
        if (!claim.cases.includes(req.caseId)) {
          // GAP-002 is multi-case; allow if claim membership includes the case
          // already checked. If not a member, reject unsupported association.
          issues.push({
            path: `${req.id}.referencedClaimIds`,
            message: `Claim ${claimId} is not a member of ${req.caseId}`,
          });
        }
      }
    }

    for (const outcomeId of req.associatedOutcomeIds) {
      if (!isOutcomeStageId(outcomeId)) {
        issues.push({
          path: `${req.id}.associatedOutcomeIds`,
          message: `Invalid outcome ${outcomeId}`,
        });
      }
    }

    if (req.comparisonVariantIds) {
      for (const vid of req.comparisonVariantIds) {
        if (!variantIds.has(vid)) {
          issues.push({
            path: `${req.id}.comparisonVariantIds`,
            message: `Unknown comparison variant ${vid}`,
          });
        } else {
          const variant = variantById.get(vid)!;
          if (variant.caseId !== req.caseId) {
            issues.push({
              path: `${req.id}.comparisonVariantIds`,
              message: `Variant ${vid} belongs to ${variant.caseId}, not ${req.caseId}`,
            });
          }
        }
      }
    }
  }

  for (const programme of registry.agendaProgrammes) {
    if (!RESEARCH_AGENDA_PROGRAMME_IDS.includes(programme.id)) {
      issues.push({
        path: `agenda.${programme.id}`,
        message: 'Unknown agenda programme id',
      });
    }
    for (const rid of programme.requirementIds) {
      if (!seenIds.has(rid)) {
        issues.push({
          path: `agenda.${programme.id}`,
          message: `Agenda references unknown requirement ${rid}`,
        });
      }
    }
  }

  // Classification safeguards
  const hyp004 = claims.find((c) => c.claim_id === 'ATLAS-HYP-004');
  if (hyp004 && hyp004.status !== 'absence_of_finding') {
    issues.push({
      path: 'ATLAS-HYP-004',
      message: 'ATLAS-HYP-004 must retain absence_of_finding status',
    });
  }
  const hyp002 = claims.find((c) => c.claim_id === 'ATLAS-HYP-002');
  if (
    hyp002 &&
    (hyp002.status !== 'unresolved_hypothesis' ||
      hyp002.admissible_in_policy_comparison !== 'no')
  ) {
    issues.push({
      path: 'ATLAS-HYP-002',
      message:
        'ATLAS-HYP-002 must remain unresolved_hypothesis with admissibility=no',
    });
  }

  return { ok: issues.length === 0, issues };
}
