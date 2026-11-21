/** Research release metadata for PolisLab v0.1.1 evidence baseline. */
export const RESEARCH_RELEASE = 'v0.1.1' as const;
export const RESEARCH_CUTOFF = '20 November 2026' as const;
export const RESEARCH_CORRECTION_PASS = '21 November 2026' as const;
export const ATLAS_SOURCE_PATH = 'research/10_policy_claims_atlas.csv' as const;
export const EXPECTED_CLAIM_COUNT = 43 as const;

/** Exact source CSV column headers (18 fields). Order is authoritative. */
export const ATLAS_SOURCE_FIELDS = [
  'claim_id',
  'exact_claim',
  'mechanism_ids',
  'outcome_ids',
  'institutional_geographic_scope',
  'status',
  'primary_source_title',
  'primary_source_url',
  'source_date_or_version',
  'pinpoint',
  'what_source_establishes',
  'limitations_external_validity',
  'competing_mechanism_or_contrary_evidence',
  'observation_that_would_alter_assessment',
  'admissible_in_policy_comparison',
  'admissibility_conditions',
  'casebook_cases',
  'literature_src_ids',
] as const;

export type AtlasSourceField = (typeof ATLAS_SOURCE_FIELDS)[number];

/**
 * Observed status vocabulary in the v0.1.1 atlas.
 * Preserved exactly — not an invented evidence hierarchy.
 */
export const CLAIM_STATUSES = [
  'verified_legal_fact',
  'administrative_determination',
  'empirical_finding',
  'absence_of_finding',
  'maintained_assumption',
  'contested_claim',
  'unresolved_hypothesis',
] as const;

export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const ADMISSIBILITY_VALUES = ['yes', 'no', 'conditional'] as const;
export type AdmissibilityValue = (typeof ADMISSIBILITY_VALUES)[number];

/** Multi-identifier fields in the atlas use semicolon separators. */
export const ID_FIELD_DELIMITER = ';' as const;

/**
 * Claim IDs known to lack a public primary URL in the published atlas.
 * Absence is preserved — not fabricated.
 */
export const KNOWN_MISSING_PRIMARY_URL_CLAIM_IDS = ['ATLAS-HYP-003'] as const;
