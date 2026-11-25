/**
 * Pinned v0.1.1 release artefact checksums (commit a1922f8…).
 * Used by the release gate to reject regenerated outputs that merely match
 * a locally edited source while ordinary source→generated validation passes.
 */

export const PINNED_RESEARCH_COMMIT =
  'a1922f8a8d08f59749d34de306e1b7406f9fe10b' as const;

export const PINNED_ATLAS_SHA256 =
  'cdb874f2637fca62c7170d5176eacd02ad2f86096f857a35b245208d9e1473af' as const;

export const PINNED_CASEBOOK_SHA256 =
  '3da0e29c56f05f76b9cd0c663d3372140122ca39c71d5a202a298cf7c7ca4c08' as const;

export const PINNED_LICENSE_SHA256 =
  '1ab51b336823fc04967cc3294e6ab5f69cfa582313ad840b1b9f5cd02a207bfc' as const;

/** Paths that may appear under research/ in a release validation copy. */
export const PERMITTED_RESEARCH_RELEASE_FILES = [
  'research/10_policy_claims_atlas.csv',
  'research/10_policy_assessment_casebook.md',
] as const;

/** Generated consumer artefacts permitted in the application data layer. */
export const PERMITTED_GENERATED_DATA_FILES = [
  'src/data/claims.generated.json',
  'src/data/casebook.generated.json',
] as const;

/** Filename prefixes that must never be copied into release/test artefacts. */
export const UNPUBLISHED_RESEARCH_PREFIXES = [
  '01_',
  '02_',
  '03_',
  '04_',
  '05_',
  '06_',
  '07_',
  '08_',
  '09_',
] as const;
