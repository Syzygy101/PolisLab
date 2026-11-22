/**
 * Release gate: validate on-disk artefacts BEFORE any regeneration.
 *
 * Pins atlas CSV, casebook Markdown, and research LICENSE to the exact
 * published commit checksums. Ordinary `npm run validate` may pass after a
 * benign source edit + regenerate; this gate must still reject that drift.
 *
 * Application software licensing and production-host SPA fallback remain
 * separate release decisions (not asserted here).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PINNED_ATLAS_SHA256,
  PINNED_CASEBOOK_SHA256,
  PINNED_LICENSE_SHA256,
  PINNED_RESEARCH_COMMIT,
  ResearchIngestError,
  runReleaseValidation,
} from '../src/research/index.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

try {
  const issues = runReleaseValidation(root);
  if (issues.length > 0) {
    console.error('Release validation FAILED');
    console.error('Pinned research release artefacts drifted or generated data is unsafe');
    for (const issue of issues) {
      console.error(`  - ${issue}`);
    }
    process.exit(1);
  }
  console.log('Release validation passed');
  console.log(`  pinned commit: ${PINNED_RESEARCH_COMMIT}`);
  console.log(`  atlas sha256:    ${PINNED_ATLAS_SHA256}`);
  console.log(`  casebook sha256: ${PINNED_CASEBOOK_SHA256}`);
  console.log(`  LICENSE sha256:  ${PINNED_LICENSE_SHA256}`);
  console.log(
    '  note: application software licence and production-host SPA fallback remain separate release decisions',
  );
} catch (error) {
  console.error('Release validation FAILED');
  if (error instanceof ResearchIngestError) {
    console.error(error.message);
    for (const issue of error.issues) {
      console.error(`  - ${issue}`);
    }
  } else if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
}
