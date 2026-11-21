import { ATLAS_SOURCE_FIELDS } from './constants';
import {
  ResearchDatasetSchema,
  type AtlasRawClaim,
  type ResearchDataset,
} from './schema';

/**
 * Compare on-disk generated dataset against a freshly ingested atlas.
 * Original source fields must match exactly. With content-addressed
 * `generatedAt`, full provenance (including generatedAt) should match for
 * the published ingest path; callers may still pass a custom generatedAt.
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

  if (
    generated.provenance.sourceContentSha256 !==
    ingested.provenance.sourceContentSha256
  ) {
    issues.push(
      `Generated provenance SHA-256 ${generated.provenance.sourceContentSha256} != ingested ${ingested.provenance.sourceContentSha256}`,
    );
  }

  if (generated.provenance.claimCount !== ingested.claims.length) {
    issues.push(
      `Generated provenance.claimCount ${generated.provenance.claimCount} != claims length ${ingested.claims.length}`,
    );
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
  }

  return issues;
}
