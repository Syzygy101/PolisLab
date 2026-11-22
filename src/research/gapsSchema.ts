/**
 * Evidence Gaps and Falsification Laboratory (Build 07) — schemas.
 *
 * Distinguishes source-grounded casebook §9 research requirements from
 * curated organisational metadata. Does not invent empirical results,
 * falsification tests the source does not state, or composite gap scores.
 */

import { z } from 'zod';
import { CLAIM_STATUSES, type ClaimStatus } from './constants';
import {
  CASE_IDS,
  OUTCOME_STAGE_IDS,
  isCaseId,
  type CaseId,
  type MechanismFamilyId,
  type OutcomeStageId,
} from './taxonomy';

export const GAPS_REGISTRY_VERSION = '2026.11.22-b07' as const;

export const RESEARCH_REQUIREMENT_ID_PATTERN = /^REQ-C[1-4]-\d{2}$/;
export const GAPS_CLAIM_ID_PATTERN = /^ATLAS-[A-Z]+-\d{3}$/;

/** Defensible research-requirement types — not interchangeable. */
export const RESEARCH_REQUIREMENT_TYPES = [
  'empirical_identification',
  'descriptive_observation',
  'measurement_parameter',
  'competing_mechanism_discrimination',
  'realisation_outcome',
  'legal_institutional_verification',
] as const;
export type ResearchRequirementType = (typeof RESEARCH_REQUIREMENT_TYPES)[number];

/**
 * How a published assessment-changing observation relates to a proposition.
 * Not every requirement has a strengthen/weaken falsification test.
 */
export const OBSERVATION_ROLES = [
  'strengthen_or_undermine',
  'weaken_proposition',
  'distinguish_mechanisms',
  'assess_additional_outcomes',
  'legal_feasibility',
  'clarify_scope_or_measurement',
  'unspecified_by_source',
] as const;
export type ObservationRole = (typeof OBSERVATION_ROLES)[number];

export const RESEARCH_REQUIREMENT_TYPE_LABELS: Record<
  ResearchRequirementType,
  string
> = {
  empirical_identification: 'Empirical identification',
  descriptive_observation: 'Descriptive observation',
  measurement_parameter: 'Measurement / parameter',
  competing_mechanism_discrimination: 'Competing-mechanism discrimination',
  realisation_outcome: 'Realisation / outcome tracking',
  legal_institutional_verification: 'Legal / institutional verification',
};

export const OBSERVATION_ROLE_LABELS: Record<ObservationRole, string> = {
  strengthen_or_undermine:
    'Could strengthen or undermine (source states both directions)',
  weaken_proposition: 'Could weaken a stated proposition',
  distinguish_mechanisms: 'Needed to distinguish competing mechanisms',
  assess_additional_outcomes: 'Needed to assess additional outcomes',
  legal_feasibility: 'Needed for legal or institutional feasibility',
  clarify_scope_or_measurement: 'Would clarify scope or improve measurement',
  unspecified_by_source:
    'The published research does not specify a sufficient empirical falsification test',
};

const CaseIdSchema = z.enum(CASE_IDS);
const OutcomeIdSchema = z.enum(OUTCOME_STAGE_IDS);
const NonEmpty = z.string().trim().min(1);
const ClaimIdSchema = z.string().regex(GAPS_CLAIM_ID_PATTERN);
const RequirementIdSchema = z
  .string()
  .regex(RESEARCH_REQUIREMENT_ID_PATTERN, 'ID must look like REQ-C1-01');

export const ResearchRequirementSchema = z
  .strictObject({
    id: RequirementIdSchema,
    caseId: CaseIdSchema,
    /** 1-based index within that case's published §9 numbered list. */
    itemNumber: z.number().int().min(1).max(20),
    /**
     * Exact published wording after the leading "N. " (trailing MD hard-break
     * spaces preserved for integrity checks).
     */
    sourceText: NonEmpty,
    /** Casebook section number — always 9 for v0.1.1 case §9 items. */
    sectionNumber: z.literal(9),
    researchRelease: z.literal('v0.1.1'),
    sourceFile: NonEmpty,
    sourceContentSha256: z.string().regex(/^[0-9a-f]{64}$/),
    /** Claim IDs explicitly cited in the §9 item or tightly supported by it. */
    referencedClaimIds: z.array(ClaimIdSchema),
    /**
     * Mechanism IDs only where the published requirement or its immediate
     * case context explicitly supports the association — not metadata inference.
     */
    associatedMechanismIds: z.array(NonEmpty),
    associatedOutcomeIds: z.array(OutcomeIdSchema),
    requirementType: z.enum(RESEARCH_REQUIREMENT_TYPES),
    observationRole: z.enum(OBSERVATION_ROLES),
    /** Curated short label — organisational aid, not published wording. */
    curatedLabel: NonEmpty,
    /** Relevant unresolved proposition (curated; may quote/paraphrase carefully). */
    relevantProposition: NonEmpty,
    /**
     * What remains uncertain — curated interpretive summary, labelled as such
     * in the UI. Must not invent results.
     */
    remainsUncertain: NonEmpty,
    /**
     * Competing explanations already present in the published research for this
     * requirement's domain. Empty when the §9 item does not engage that frame.
     */
    competingExplanations: z.array(NonEmpty),
    /**
     * Assessment-changing observation note. Prefer the original §9 wording;
     * may point to linked atlas `observation_that_would_alter_assessment`.
     */
    assessmentChangingNote: NonEmpty,
    /**
     * Explicit qualification: e.g. legal verification ≠ empirical falsification.
     */
    qualification: NonEmpty,
    /**
     * When true, the UI must state that the published research does not specify
     * a sufficient empirical falsification test.
     */
    falsificationUnspecified: z.boolean(),
    /**
     * Optional comparison-variant IDs only where the published source supports
     * a variant-specific link. Null / empty = case-wide requirement.
     */
    comparisonVariantIds: z.array(NonEmpty).nullable(),
  })
  .superRefine((req, ctx) => {
    if (req.falsificationUnspecified && req.observationRole !== 'unspecified_by_source') {
      // Allow legal_feasibility / clarify without forcing unspecified role.
      if (
        req.observationRole !== 'legal_feasibility' &&
        req.observationRole !== 'clarify_scope_or_measurement'
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['observationRole'],
          message:
            'falsificationUnspecified requirements should use unspecified, legal_feasibility, or clarify_scope_or_measurement roles',
        });
      }
    }
    if (req.comparisonVariantIds) {
      const uniq = new Set(req.comparisonVariantIds);
      if (uniq.size !== req.comparisonVariantIds.length) {
        ctx.addIssue({
          code: 'custom',
          path: ['comparisonVariantIds'],
          message: 'comparisonVariantIds must not contain duplicates',
        });
      }
    }
  });
export type ResearchRequirement = z.infer<typeof ResearchRequirementSchema>;

export const RESEARCH_AGENDA_PROGRAMME_IDS = [
  'sites-planning-holding',
  'foreign-investment-pathways',
  'distribution-scale-up',
  'demand-substitution-welfare',
  'acquisition-oversight-realisation',
  'legal-feasibility-institutional',
] as const;
export type ResearchAgendaProgrammeId =
  (typeof RESEARCH_AGENDA_PROGRAMME_IDS)[number];

export const ResearchAgendaProgrammeSchema = z.strictObject({
  id: z.enum(RESEARCH_AGENDA_PROGRAMME_IDS),
  label: NonEmpty,
  description: NonEmpty,
  /** Organisational grouping only — not a newly published finding. */
  organisationalOnly: z.literal(true),
  requirementIds: z.array(RequirementIdSchema).min(1),
});
export type ResearchAgendaProgramme = z.infer<
  typeof ResearchAgendaProgrammeSchema
>;

export const GapsProvenanceSchema = z.strictObject({
  sourceFile: NonEmpty,
  researchRelease: z.literal('v0.1.1'),
  sourceContentSha256: z.string().regex(/^[0-9a-f]{64}$/),
  registryVersion: z.literal(GAPS_REGISTRY_VERSION),
  expectedRequirementCount: z.literal(19),
});
export type GapsProvenance = z.infer<typeof GapsProvenanceSchema>;

export const GapsRegistrySchema = z.strictObject({
  provenance: GapsProvenanceSchema,
  requirements: z.array(ResearchRequirementSchema).length(19),
  agendaProgrammes: z.array(ResearchAgendaProgrammeSchema),
});
export type GapsRegistry = z.infer<typeof GapsRegistrySchema>;

/** Claim statuses useful for gaps filtering (original atlas vocabulary). */
export const GAPS_FILTERABLE_STATUSES = CLAIM_STATUSES;
export type GapsFilterableStatus = (typeof GAPS_FILTERABLE_STATUSES)[number];

/** URL / UI filter state — lives here so gapsUrl need not import the registry. */
export interface GapsFilterState {
  cases: CaseId[];
  mechanisms: string[];
  mechanismFamilies: MechanismFamilyId[];
  outcomes: OutcomeStageId[];
  /** Filter requirements that reference at least one claim with this status. */
  statuses: ClaimStatus[];
  requirementTypes: ResearchRequirementType[];
  observationRoles: ObservationRole[];
  agenda: ResearchAgendaProgrammeId | null;
  claimId: string | null;
}

export const EMPTY_GAPS_FILTERS: GapsFilterState = {
  cases: [],
  mechanisms: [],
  mechanismFamilies: [],
  outcomes: [],
  statuses: [],
  requirementTypes: [],
  observationRoles: [],
  agenda: null,
  claimId: null,
};

export function isResearchRequirementType(
  value: string,
): value is ResearchRequirementType {
  return (RESEARCH_REQUIREMENT_TYPES as readonly string[]).includes(value);
}

export function isObservationRole(value: string): value is ObservationRole {
  return (OBSERVATION_ROLES as readonly string[]).includes(value);
}

export function isAgendaProgrammeId(
  value: string,
): value is ResearchAgendaProgrammeId {
  return (RESEARCH_AGENDA_PROGRAMME_IDS as readonly string[]).includes(value);
}

export function isClaimStatus(value: string): value is ClaimStatus {
  return (CLAIM_STATUSES as readonly string[]).includes(value);
}

export function isGapsCaseId(value: string): value is CaseId {
  return isCaseId(value);
}
