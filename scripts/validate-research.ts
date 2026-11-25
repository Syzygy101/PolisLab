/**
 * Validation CLI: nonzero exit when atlas or casebook integrity requirements fail.
 * Checks published sources and on-disk generated consumer artefacts.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ATLAS_SOURCE_FIELDS,
  ATLAS_SOURCE_PATH,
  CASEBOOK_SOURCE_PATH,
  EXPECTED_CLAIM_COUNT,
  KNOWN_MISSING_PRIMARY_URL_CLAIM_IDS,
  RESEARCH_RELEASE,
  findCasebookGeneratedDrift,
  findGeneratedDrift,
  ingestAtlasCsv,
  ingestCasebookMarkdown,
  ResearchIngestError,
  sha256Hex,
  type CaseId,
  validateCasebookDataset,
} from '../src/research/index.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const atlasPath = path.join(root, ATLAS_SOURCE_PATH);
const casebookPath = path.join(root, CASEBOOK_SOURCE_PATH);
const generatedClaimsPath = path.join(root, 'src/data/claims.generated.json');
const generatedCasebookPath = path.join(root, 'src/data/casebook.generated.json');

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

  if (!existsSync(generatedClaimsPath)) {
    throw new ResearchIngestError(
      `Missing generated dataset at ${path.relative(root, generatedClaimsPath)}; run npm run ingest`,
    );
  }

  const generatedClaimsRaw: unknown = JSON.parse(
    readFileSync(generatedClaimsPath, 'utf8'),
  );
  const claimsDrift = findGeneratedDrift(dataset, generatedClaimsRaw);
  if (claimsDrift.length > 0) {
    throw new ResearchIngestError(
      'Generated claims dataset drifts from published atlas',
      claimsDrift,
    );
  }

  const knownClaimIds = new Set(dataset.claims.map((c) => c.claim_id));
  const atlasMembershipByCase = new Map<CaseId, Set<string>>();
  for (const claim of dataset.claims) {
    for (const caseId of claim.cases) {
      const set = atlasMembershipByCase.get(caseId as CaseId) ?? new Set<string>();
      set.add(claim.claim_id);
      atlasMembershipByCase.set(caseId as CaseId, set);
    }
  }

  const casebookMarkdown = readFileSync(casebookPath, 'utf8');
  const casebookChecksum = sha256Hex(casebookMarkdown);
  const casebook = ingestCasebookMarkdown(casebookMarkdown, {
    sourceFile: CASEBOOK_SOURCE_PATH,
    knownClaimIds,
    atlasMembershipByCase,
  });
  validateCasebookDataset(casebook, dataset.claims);

  if (!existsSync(generatedCasebookPath)) {
    throw new ResearchIngestError(
      `Missing generated casebook at ${path.relative(root, generatedCasebookPath)}; run npm run ingest`,
    );
  }
  const generatedCasebookRaw: unknown = JSON.parse(
    readFileSync(generatedCasebookPath, 'utf8'),
  );
  const casebookDrift = findCasebookGeneratedDrift(casebook, generatedCasebookRaw);
  if (casebookDrift.length > 0) {
    throw new ResearchIngestError(
      'Generated casebook drifts from published Markdown',
      casebookDrift,
    );
  }

  // Unpublished working files must not be bundled as application source artefacts.
  for (const name of readdirSync(path.join(root, 'src/data'))) {
    if (/^0[1-9]_/.test(name)) {
      throw new ResearchIngestError(
        `Unpublished research artefact copied into src/data: ${name}`,
      );
    }
  }


  console.log('Research validation passed');
  console.log(`  release: ${RESEARCH_RELEASE}`);
  console.log(`  claims:  ${dataset.claims.length}`);
  console.log(`  fields:  ${dataset.provenance.fields.length}`);
  console.log(`  atlas sha256:  ${checksum}`);
  console.log(`  casebook cases: ${casebook.cases.length}`);
  console.log(`  casebook sections: ${casebook.provenance.sectionCount}`);
  console.log(`  casebook sha256: ${casebookChecksum}`);
  console.log(`  source atlas:  ${ATLAS_SOURCE_PATH}`);
  console.log(`  source casebook: ${CASEBOOK_SOURCE_PATH}`);
  console.log(`  generated claims: ${path.relative(root, generatedClaimsPath)} (in sync)`);
  console.log(
    `  generated casebook: ${path.relative(root, generatedCasebookPath)} (in sync)`,
  );
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
