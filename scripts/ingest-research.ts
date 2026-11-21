/**
 * Deterministic research ingestion: atlas CSV + casebook Markdown →
 * application-consumable JSON. Published research files remain the source of truth.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ATLAS_SOURCE_PATH,
  CASEBOOK_SOURCE_PATH,
  ingestAtlasCsv,
  ingestCasebookMarkdown,
  ResearchIngestError,
  type CaseId,
  validateCasebookDataset,
} from '../src/research/index.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const atlasPath = path.join(root, ATLAS_SOURCE_PATH);
const casebookPath = path.join(root, CASEBOOK_SOURCE_PATH);
const outDir = path.join(root, 'src/data');
const claimsPath = path.join(outDir, 'claims.generated.json');
const casebookOutPath = path.join(outDir, 'casebook.generated.json');

function main(): void {
  const csvText = readFileSync(atlasPath, 'utf8');
  const dataset = ingestAtlasCsv(csvText, {
    expectPublishedCount: true,
    enforceKnownMissingUrls: true,
    sourceFile: ATLAS_SOURCE_PATH,
  });

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
  const casebook = ingestCasebookMarkdown(casebookMarkdown, {
    sourceFile: CASEBOOK_SOURCE_PATH,
    knownClaimIds,
    atlasMembershipByCase,
  });
  validateCasebookDataset(casebook, dataset.claims);

  mkdirSync(outDir, { recursive: true });
  writeFileSync(claimsPath, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8');
  writeFileSync(casebookOutPath, `${JSON.stringify(casebook, null, 2)}\n`, 'utf8');

  console.log(
    `Ingested ${dataset.claims.length} claims from ${ATLAS_SOURCE_PATH}`,
  );
  console.log(`Claims SHA-256: ${dataset.provenance.sourceContentSha256}`);
  console.log(
    `Ingested ${casebook.cases.length} cases / ${casebook.provenance.sectionCount} sections from ${CASEBOOK_SOURCE_PATH}`,
  );
  console.log(`Casebook SHA-256: ${casebook.provenance.sourceContentSha256}`);
  console.log(`Wrote ${path.relative(root, claimsPath)}`);
  console.log(`Wrote ${path.relative(root, casebookOutPath)}`);
}

try {
  main();
} catch (error) {
  if (error instanceof ResearchIngestError) {
    console.error(error.message);
    for (const issue of error.issues) {
      console.error(`  - ${issue}`);
    }
  } else {
    console.error(error);
  }
  process.exit(1);
}
