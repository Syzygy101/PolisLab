/**
 * Policy Comparison Laboratory (Build 06) — schemas for the curated,
 * qualitative comparison dataset.
 *
 * Grounded ONLY in research/10_policy_assessment_casebook.md (published
 * v0.1.1) and the companion atlas. The schemas deliberately contain no field
 * for scores, rankings, probabilities, or effect sizes, and every object is
 * strict so such fields cannot be smuggled in.
 */

import { z } from 'zod';
import { CASE_IDS, OUTCOME_STAGE_IDS } from './taxonomy';

export const COMPARISON_DATASET_VERSION = '2026.11.22-b06' as const;

export const COMPARISON_ID_PATTERN = /^C[1-4]-[A-Z0-9][A-Z0-9-]*$/;
export const COMPARISON_CLAIM_ID_PATTERN = /^ATLAS-[A-Z]+-\d{3}$/;

const CaseIdSchema = z.enum(CASE_IDS);
const OutcomeIdSchema = z.enum(OUTCOME_STAGE_IDS);
const StableIdSchema = z
  .string()
  .regex(COMPARISON_ID_PATTERN, 'ID must look like C1-VAR-R');
const NonEmpty = z.string().trim().min(1);

/** Stable reference id for a published case section, e.g. `Case1:section-6`. */
export function comparisonSectionRefId(caseId: string, section: number): string {
  return `${caseId}:section-${section}`;
}

export const ComparisonSourceRefSchema = z
  .strictObject({
    kind: z.enum(['claim', 'case_section']),
    /** Atlas claim ID (kind=claim) or `CaseN:section-K` (kind=case_section). */
    id: NonEmpty,
    caseId: CaseIdSchema.optional(),
    section: z.number().int().min(1).max(10).optional(),
  })
  .superRefine((ref, ctx) => {
    if (ref.kind === 'claim') {
      if (!COMPARISON_CLAIM_ID_PATTERN.test(ref.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['id'],
          message: `Claim ref id "${ref.id}" is not a valid ATLAS claim ID`,
        });
      }
      return;
    }
    if (!ref.caseId || ref.section === undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'case_section refs require caseId and section',
      });
      return;
    }
    if (ref.id !== comparisonSectionRefId(ref.caseId, ref.section)) {
      ctx.addIssue({
        code: 'custom',
        path: ['id'],
        message: `case_section id must be "${comparisonSectionRefId(ref.caseId, ref.section)}"`,
      });
    }
  });
export type ComparisonSourceRef = z.infer<typeof ComparisonSourceRefSchema>;

const SourcesSchema = z.array(ComparisonSourceRefSchema).min(1);

export const BASELINE_LAYERS = ['A', 'B', 'C', 'D'] as const;
export type BaselineLayer = (typeof BASELINE_LAYERS)[number];

export const ComparisonBaselineSchema = z.strictObject({
  id: StableIdSchema,
  caseId: CaseIdSchema,
  label: NonEmpty,
  /** A law in force · B administrative practice/observed · C announced · D hypothetical. */
  layer: z.enum(BASELINE_LAYERS),
  description: NonEmpty,
  datedNote: NonEmpty.optional(),
  sources: SourcesSchema,
});
export type ComparisonBaseline = z.infer<typeof ComparisonBaselineSchema>;

export const InterventionVariantSchema = z.strictObject({
  id: StableIdSchema,
  caseId: CaseIdSchema,
  label: NonEmpty,
  shortCode: NonEmpty,
  definition: NonEmpty,
  baselineId: StableIdSchema,
  /** Triggers / defining conditions as published (kept as separate items). */
  conditions: z.array(NonEmpty),
  /** What the published text says stays binding or is not relaxed. */
  retainedConstraints: z.array(NonEmpty),
  sources: SourcesSchema,
});
export type InterventionVariant = z.infer<typeof InterventionVariantSchema>;

export const PATHWAY_POLARITIES = [
  'favourable',
  'unfavourable',
  'null_path',
] as const;
export type PathwayPolarity = (typeof PATHWAY_POLARITIES)[number];

export const ComparisonPathwaySchema = z
  .strictObject({
    id: StableIdSchema,
    caseId: CaseIdSchema,
    /** null = case-level shared pathway (not assigned to any single variant). */
    variantIds: z.array(StableIdSchema).min(1).nullable(),
    polarity: z.enum(PATHWAY_POLARITIES),
    summary: NonEmpty,
    sources: SourcesSchema,
  })
  .superRefine((p, ctx) => {
    if (p.variantIds && new Set(p.variantIds).size !== p.variantIds.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['variantIds'],
        message: 'variantIds must not contain duplicates',
      });
    }
  });
export type ComparisonPathway = z.infer<typeof ComparisonPathwaySchema>;

export const ASSESSABILITY_VALUES = [
  'assessable',
  'partial',
  'not_assessable',
] as const;
export type Assessability = (typeof ASSESSABILITY_VALUES)[number];

export const OUTCOME_SCOPES = ['case_wide', 'variant'] as const;
export type OutcomeScope = (typeof OUTCOME_SCOPES)[number];

export const OutcomeAssessmentSchema = z
  .strictObject({
    id: StableIdSchema,
    caseId: CaseIdSchema,
    variantId: StableIdSchema.nullish(),
    outcomeId: OutcomeIdSchema,
    assessability: z.enum(ASSESSABILITY_VALUES),
    scope: z.enum(OUTCOME_SCOPES),
    /** Qualitative judgment of what can be said — never a numeric score. */
    judgment: NonEmpty,
    limitations: NonEmpty,
    /** Published evidence that would materially change the assessment. */
    changeEvidenceRefs: z.array(ComparisonSourceRefSchema),
    sources: SourcesSchema,
  })
  .superRefine((a, ctx) => {
    if (a.scope === 'variant' && !a.variantId) {
      ctx.addIssue({
        code: 'custom',
        path: ['variantId'],
        message: 'variant-scoped assessments require variantId',
      });
    }
    if (a.scope === 'case_wide' && a.variantId) {
      ctx.addIssue({
        code: 'custom',
        path: ['variantId'],
        message: 'case_wide assessments must not carry a variantId',
      });
    }
  });
export type OutcomeAssessment = z.infer<typeof OutcomeAssessmentSchema>;

export const EvidenceUseSchema = z.strictObject({
  id: StableIdSchema,
  claimId: z.string().regex(COMPARISON_CLAIM_ID_PATTERN),
  /** The bounded proposition this claim is used to support — nothing wider. */
  supportsProposition: NonEmpty,
  caseId: CaseIdSchema,
  variantId: StableIdSchema.nullish(),
  sources: SourcesSchema,
});
export type EvidenceUse = z.infer<typeof EvidenceUseSchema>;

export const CaseComparisonOrientationSchema = z.strictObject({
  caseId: CaseIdSchema,
  coreQuestion: NonEmpty,
  baselineHinge: NonEmpty,
  leadMechanisms: z.array(NonEmpty).min(1),
  bestSupportedFinding: NonEmpty,
  signReversalRisks: z.array(NonEmpty).min(1),
  assessableNow: z.array(NonEmpty).min(1),
  notInferable: z.array(NonEmpty).min(1),
  /** The casebook declares no policy winner in any case. */
  policyWinnerDeclared: z.literal(false),
  sources: SourcesSchema,
});
export type CaseComparisonOrientation = z.infer<
  typeof CaseComparisonOrientationSchema
>;

export const ComparisonProvenanceSchema = z.strictObject({
  sourceFile: NonEmpty,
  researchRelease: NonEmpty,
  sourceContentSha256: z.string().regex(/^[0-9a-f]{64}$/),
  datasetVersion: z.literal(COMPARISON_DATASET_VERSION),
});
export type ComparisonProvenance = z.infer<typeof ComparisonProvenanceSchema>;

export const ComparisonDatasetSchema = z.strictObject({
  provenance: ComparisonProvenanceSchema,
  baselines: z.array(ComparisonBaselineSchema),
  variants: z.array(InterventionVariantSchema),
  pathways: z.array(ComparisonPathwaySchema),
  outcomeAssessments: z.array(OutcomeAssessmentSchema),
  evidenceUses: z.array(EvidenceUseSchema),
  orientations: z.array(CaseComparisonOrientationSchema),
});
export type ComparisonDataset = z.infer<typeof ComparisonDatasetSchema>;
