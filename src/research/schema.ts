import { z } from 'zod';
import {
  ADMISSIBILITY_VALUES,
  ATLAS_SOURCE_FIELDS,
  CLAIM_STATUSES,
} from './constants';
import { parseSemicolonIds } from './parseIds';

/** Raw atlas row: all 18 source fields as strings, preserving empty values. */
export const AtlasRawClaimSchema = z.object({
  claim_id: z.string().min(1, 'claim_id is required'),
  exact_claim: z.string().min(1, 'exact_claim is required'),
  mechanism_ids: z.string(),
  outcome_ids: z.string(),
  institutional_geographic_scope: z.string(),
  status: z.enum(CLAIM_STATUSES),
  primary_source_title: z.string(),
  primary_source_url: z.string(),
  source_date_or_version: z.string(),
  pinpoint: z.string(),
  what_source_establishes: z.string(),
  limitations_external_validity: z.string(),
  competing_mechanism_or_contrary_evidence: z.string(),
  observation_that_would_alter_assessment: z.string(),
  admissible_in_policy_comparison: z.enum(ADMISSIBILITY_VALUES),
  admissibility_conditions: z.string(),
  casebook_cases: z.string(),
  literature_src_ids: z.string(),
});

export type AtlasRawClaim = z.infer<typeof AtlasRawClaimSchema>;

export const ClaimSchema = AtlasRawClaimSchema.extend({
  mechanisms: z.array(z.string()),
  outcomes: z.array(z.string()),
  cases: z.array(z.string()),
  literatureSources: z.array(z.string()),
  hasPrimarySourceUrl: z.boolean(),
});

export type Claim = z.infer<typeof ClaimSchema>;

export const ResearchProvenanceSchema = z.object({
  sourceFile: z.string(),
  researchRelease: z.string(),
  researchCutoff: z.string(),
  correctionPass: z.string(),
  sourceContentSha256: z.string(),
  claimCount: z.number().int().nonnegative(),
  generatedAt: z.string(),
  fields: z.array(z.string()),
});

export type ResearchProvenance = z.infer<typeof ResearchProvenanceSchema>;

export const ResearchDatasetSchema = z.object({
  provenance: ResearchProvenanceSchema,
  claims: z.array(ClaimSchema),
});

export type ResearchDataset = z.infer<typeof ResearchDatasetSchema>;

export function enrichRawClaim(raw: AtlasRawClaim): Claim {
  const url = raw.primary_source_url.trim();
  return ClaimSchema.parse({
    ...raw,
    mechanisms: parseSemicolonIds(raw.mechanism_ids),
    outcomes: parseSemicolonIds(raw.outcome_ids),
    cases: parseSemicolonIds(raw.casebook_cases),
    literatureSources: parseSemicolonIds(raw.literature_src_ids),
    hasPrimarySourceUrl: url.length > 0,
  });
}

export function assertExactHeaders(headers: string[] | undefined): void {
  if (!headers) {
    throw new Error('CSV has no headers');
  }
  const expected = [...ATLAS_SOURCE_FIELDS];
  if (headers.length !== expected.length) {
    throw new Error(
      `Unexpected header count: got ${headers.length}, expected ${expected.length}`,
    );
  }
  for (let i = 0; i < expected.length; i += 1) {
    if (headers[i] !== expected[i]) {
      throw new Error(
        `Unexpected header at index ${i}: got "${headers[i]}", expected "${expected[i]}"`,
      );
    }
  }
}
