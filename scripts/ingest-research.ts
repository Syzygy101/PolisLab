/**
 * Deterministic research ingestion: read the published atlas CSV and write
 * application-consumable JSON. The CSV remains the source of truth.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ATLAS_SOURCE_PATH,
  ingestAtlasCsv,
  ResearchIngestError,
} from '../src/research/index.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const atlasPath = path.join(root, ATLAS_SOURCE_PATH);
const outDir = path.join(root, 'src/data');
const datasetPath = path.join(outDir, 'claims.generated.json');

function main(): void {
  const csvText = readFileSync(atlasPath, 'utf8');
  const dataset = ingestAtlasCsv(csvText, {
    expectPublishedCount: true,
    enforceKnownMissingUrls: true,
    sourceFile: ATLAS_SOURCE_PATH,
  });

  mkdirSync(outDir, { recursive: true });
  writeFileSync(datasetPath, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8');

  console.log(
    `Ingested ${dataset.claims.length} claims from ${ATLAS_SOURCE_PATH}`,
  );
  console.log(`SHA-256: ${dataset.provenance.sourceContentSha256}`);
  console.log(`Wrote ${path.relative(root, datasetPath)}`);
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
