import { ATLAS_SOURCE_FIELDS } from './constants';
import {
  CasebookDatasetSchema,
  type CasebookDataset,
} from './casebookSchema';
import {
  ResearchDatasetSchema,
  type AtlasRawClaim,
  type Claim,
  type ResearchDataset,
} from './schema';

const ENRICHED_CLAIM_FIELDS = [
  'mechanisms',
  'outcomes',
  'cases',
  'literatureSources',
  'hasPrimarySourceUrl',
] as const satisfies ReadonlyArray<keyof Claim>;

function jsonEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Compare on-disk generated claims dataset against a freshly ingested atlas.
 * Covers original source fields, enriched arrays, source-URL flags, and full
 * provenance (excluding generatedAt only when the ingest path intentionally
 * differs — the published path uses content-addressed generatedAt).
 */
export function findGeneratedDrift(
  ingested: ResearchDataset,
  generatedUnknown: unknown,
): string[] {
  const issues: string[] = [];
  const parsed = ResearchDatasetSchema.safeParse(generatedUnknown);
  if (!parsed.success) {
    issues.push(
      `Generated JSON failed schema validation: ${parsed.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ')}`,
    );
    return issues;
  }

  const generated = parsed.data;

  if (generated.claims.length !== ingested.claims.length) {
    issues.push(
      `Generated claim count ${generated.claims.length} != ingested ${ingested.claims.length}`,
    );
  }

  const provenanceKeys = [
    'sourceFile',
    'researchRelease',
    'researchCutoff',
    'correctionPass',
    'sourceContentSha256',
    'claimCount',
    'generatedAt',
    'fields',
  ] as const;
  for (const key of provenanceKeys) {
    if (!jsonEqual(generated.provenance[key], ingested.provenance[key])) {
      issues.push(
        `Generated provenance.${key} drifts: generated=${JSON.stringify(generated.provenance[key])} ingested=${JSON.stringify(ingested.provenance[key])}`,
      );
    }
  }

  if (
    JSON.stringify(generated.provenance.fields) !==
    JSON.stringify([...ATLAS_SOURCE_FIELDS])
  ) {
    issues.push('Generated provenance.fields do not match the 18 source fields');
  }

  const byIngested = new Map(ingested.claims.map((c) => [c.claim_id, c]));
  const byGenerated = new Map(generated.claims.map((c) => [c.claim_id, c]));

  for (const id of byIngested.keys()) {
    if (!byGenerated.has(id)) {
      issues.push(`Generated dataset missing claim ${id}`);
    }
  }
  for (const id of byGenerated.keys()) {
    if (!byIngested.has(id)) {
      issues.push(`Generated dataset has unexpected claim ${id}`);
    }
  }

  for (const [id, ingestedClaim] of byIngested) {
    const generatedClaim = byGenerated.get(id);
    if (!generatedClaim) {
      continue;
    }
    for (const field of ATLAS_SOURCE_FIELDS) {
      const left = ingestedClaim[field as keyof AtlasRawClaim];
      const right = generatedClaim[field as keyof AtlasRawClaim];
      if (left !== right) {
        issues.push(
          `Drift at ${id}.${field}: ingested=${JSON.stringify(left)} generated=${JSON.stringify(right)}`,
        );
      }
    }
    for (const field of ENRICHED_CLAIM_FIELDS) {
      if (!jsonEqual(ingestedClaim[field], generatedClaim[field])) {
        issues.push(
          `Drift at ${id}.${field}: ingested=${JSON.stringify(ingestedClaim[field])} generated=${JSON.stringify(generatedClaim[field])}`,
        );
      }
    }
  }

  return issues;
}

/**
 * Compare on-disk generated casebook against a freshly ingested Markdown parse.
 * Covers provenance (SHA), cases/sections, front matter, closing parts,
 * common-rule citation metadata, and membership/body citation sets.
 */
export function findCasebookGeneratedDrift(
  expected: CasebookDataset,
  actualRaw: unknown,
): string[] {
  const issues: string[] = [];
  const parsed = CasebookDatasetSchema.safeParse(actualRaw);
  if (!parsed.success) {
    issues.push(
      `Generated casebook failed schema validation: ${parsed.error.issues
        .map((i) => `${i.path.join('.')}: ${i.message}`)
        .join('; ')}`,
    );
    return issues;
  }
  const actual = parsed.data;

  const provenanceKeys = [
    'sourceFile',
    'researchRelease',
    'researchCutoff',
    'correctionPass',
    'sourceContentSha256',
    'generatedAt',
    'caseCount',
    'sectionCount',
  ] as const;
  for (const key of provenanceKeys) {
    if (!jsonEqual(actual.provenance[key], expected.provenance[key])) {
      issues.push(
        `Casebook provenance.${key} drift: actual=${JSON.stringify(actual.provenance[key])} expected=${JSON.stringify(expected.provenance[key])}`,
      );
    }
  }
  if (actual.provenance.sourceContentSha256 !== expected.provenance.sourceContentSha256) {
    issues.push('Casebook SHA-256 drift between source and generated artefact');
  }

  if (actual.frontMatterMarkdown !== expected.frontMatterMarkdown) {
    issues.push('Generated casebook front matter drift');
  }
  if (!jsonEqual(actual.commonRuleClaimIds, expected.commonRuleClaimIds)) {
    issues.push('Generated casebook commonRuleClaimIds (citation metadata) drift');
  }
  if (!jsonEqual(actual.closingParts, expected.closingParts)) {
    issues.push('Generated casebook closingParts drift');
  }
  if (!jsonEqual(actual.cases, expected.cases)) {
    issues.push('Generated casebook cases drift from freshly ingested source');
  }

  // Section-level citation metadata (explicitClaimIds) is included in cases
  // JSON compare above; surface a clearer message if only citations drifted.
  for (let i = 0; i < expected.cases.length; i += 1) {
    const expCase = expected.cases[i];
    const actCase = actual.cases[i];
    if (!expCase || !actCase || expCase.id !== actCase.id) continue;
    if (!jsonEqual(expCase.membershipClaimIds, actCase.membershipClaimIds)) {
      issues.push(`${expCase.id}: membershipClaimIds citation metadata drift`);
    }
    if (!jsonEqual(expCase.bodyClaimIds, actCase.bodyClaimIds)) {
      issues.push(`${expCase.id}: bodyClaimIds citation metadata drift`);
    }
    for (let s = 0; s < expCase.sections.length; s += 1) {
      const expSec = expCase.sections[s];
      const actSec = actCase.sections[s];
      if (!expSec || !actSec) continue;
      if (!jsonEqual(expSec.explicitClaimIds, actSec.explicitClaimIds)) {
        issues.push(
          `${expCase.id} §${expSec.number}: explicitClaimIds citation metadata drift`,
        );
      }
    }
  }

  return issues;
}
