/**
 * Validation CLI: nonzero exit when atlas integrity requirements are violated.
 * Checks both the published CSV and the on-disk generated JSON consumer artefact.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ATLAS_SOURCE_FIELDS,
  ATLAS_SOURCE_PATH,
  EXPECTED_CLAIM_COUNT,
  KNOWN_MISSING_PRIMARY_URL_CLAIM_IDS,
  RESEARCH_RELEASE,
  findGeneratedDrift,
  ingestAtlasCsv,
  ResearchIngestError,
  sha256Hex,
} from '../src/research/index.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const atlasPath = path.join(root, ATLAS_SOURCE_PATH);
const generatedPath = path.join(root, 'src/data/claims.generated.json');

function main(): void {
  const csvText = readFileSync(atlasPath, 'utf8');
  const checksum = sha256Hex(csvText);
  const dataset = ingestAtlasCsv(csvText, {
    expectPublishedCount: true,
    enforceKnownMissingUrls: true,
    sourceFile: ATLAS_SOURCE_PATH,
  });

  const ids = dataset.claims.map((c) => c.claim_id);
  const unique = new Set(ids);
  if (unique.size !== ids.length) {
    throw new ResearchIngestError('Duplicate claim IDs after ingest');
  }
  if (dataset.claims.length !== EXPECTED_CLAIM_COUNT) {
    throw new ResearchIngestError(
      `Claim count mismatch: ${dataset.claims.length} !== ${EXPECTED_CLAIM_COUNT}`,
    );
  }
  if (dataset.provenance.fields.length !== ATLAS_SOURCE_FIELDS.length) {
    throw new ResearchIngestError('Field count mismatch in provenance');
  }

  const hyp003 = dataset.claims.find((c) => c.claim_id === 'ATLAS-HYP-003');
  if (!hyp003) {
    throw new ResearchIngestError('ATLAS-HYP-003 missing from dataset');
  }
  if (hyp003.hasPrimarySourceUrl || hyp003.primary_source_url.trim() !== '') {
    throw new ResearchIngestError(
      'ATLAS-HYP-003 unexpectedly has a primary_source_url',
    );
  }
  if (
    !(KNOWN_MISSING_PRIMARY_URL_CLAIM_IDS as readonly string[]).includes(
      hyp003.claim_id,
    )
  ) {
    throw new ResearchIngestError('ATLAS-HYP-003 not listed as known missing URL');
  }

  if (!existsSync(generatedPath)) {
    throw new ResearchIngestError(
      `Missing generated dataset at ${path.relative(root, generatedPath)}; run npm run ingest`,
    );
  }

  const generatedRaw: unknown = JSON.parse(readFileSync(generatedPath, 'utf8'));
  const drift = findGeneratedDrift(dataset, generatedRaw);
  if (drift.length > 0) {
    throw new ResearchIngestError(
      'Generated dataset drifts from published atlas',
      drift,
    );
  }

  console.log('Research validation passed');
  console.log(`  release: ${RESEARCH_RELEASE}`);
  console.log(`  claims:  ${dataset.claims.length}`);
  console.log(`  fields:  ${dataset.provenance.fields.length}`);
  console.log(`  sha256:  ${checksum}`);
  console.log(`  source:  ${ATLAS_SOURCE_PATH}`);
  console.log(`  generated: ${path.relative(root, generatedPath)} (in sync)`);
}

try {
  main();
} catch (error) {
  if (error instanceof ResearchIngestError) {
    console.error('Research validation FAILED');
    console.error(error.message);
    for (const issue of error.issues) {
      console.error(`  - ${issue}`);
    }
  } else if (error instanceof Error) {
    console.error('Research validation FAILED');
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
}
