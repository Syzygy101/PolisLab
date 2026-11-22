/**
 * Pure release-gate helpers (no process.exit). Used by validate-release CLI and tests.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { ATLAS_SOURCE_PATH } from './constants';
import { CASEBOOK_SOURCE_PATH } from './casebookConstants';
import {
  PINNED_ATLAS_SHA256,
  PINNED_CASEBOOK_SHA256,
  PINNED_LICENSE_SHA256,
  PINNED_RESEARCH_COMMIT,
  PERMITTED_GENERATED_DATA_FILES,
  UNPUBLISHED_RESEARCH_PREFIXES,
} from './releasePins';
import { findCasebookGeneratedDrift, findGeneratedDrift } from './validateGenerated';
import { ingestAtlasCsv } from './ingest';
import { ingestCasebookMarkdown } from './casebookParse';
import { validateCasebookDataset } from './casebookValidate';
import type { CaseId } from './taxonomy';

export function sha256Buffer(buf: Buffer | string): string {
  return createHash('sha256').update(buf).digest('hex');
}

export function sha256FileAt(root: string, relPath: string): string {
  return sha256Buffer(readFileSync(path.join(root, relPath)));
}

export function checkPinnedReleaseSources(root: string): string[] {
  const issues: string[] = [];
  const atlasSha = sha256FileAt(root, ATLAS_SOURCE_PATH);
  const casebookSha = sha256FileAt(root, CASEBOOK_SOURCE_PATH);
  const licenseSha = sha256FileAt(root, 'LICENSE');

  if (atlasSha !== PINNED_ATLAS_SHA256) {
    issues.push(
      `Atlas SHA ${atlasSha} != pinned ${PINNED_ATLAS_SHA256} (commit ${PINNED_RESEARCH_COMMIT})`,
    );
  }
  if (casebookSha !== PINNED_CASEBOOK_SHA256) {
    issues.push(
      `Casebook SHA ${casebookSha} != pinned ${PINNED_CASEBOOK_SHA256} (commit ${PINNED_RESEARCH_COMMIT})`,
    );
  }
  if (licenseSha !== PINNED_LICENSE_SHA256) {
    issues.push(
      `LICENSE SHA ${licenseSha} != pinned ${PINNED_LICENSE_SHA256} (research licence; commit ${PINNED_RESEARCH_COMMIT})`,
    );
  }
  return issues;
}

export function checkNoUnpublishedBundled(root: string): string[] {
  const issues: string[] = [];
  const dataDir = path.join(root, 'src/data');
  if (existsSync(dataDir)) {
    for (const name of readdirSync(dataDir)) {
      if (UNPUBLISHED_RESEARCH_PREFIXES.some((prefix) => name.startsWith(prefix))) {
        issues.push(`Unpublished research artefact in src/data: ${name}`);
      }
    }
  }
  const distDir = path.join(root, 'dist');
  if (existsSync(distDir)) {
    const walk = (dir: string): void => {
      for (const name of readdirSync(dir)) {
        const full = path.join(dir, name);
        if (statSync(full).isDirectory()) {
          walk(full);
          continue;
        }
        if (
          UNPUBLISHED_RESEARCH_PREFIXES.some((prefix) => name.startsWith(prefix)) ||
          /World Economic Policy/i.test(name)
        ) {
          issues.push(`Unpublished material in dist: ${path.relative(root, full)}`);
        }
      }
    };
    walk(distDir);
  }
  return issues;
}

export function checkGeneratedMatchesPinnedSources(root: string): string[] {
  const issues: string[] = [];
  for (const rel of PERMITTED_GENERATED_DATA_FILES) {
    if (!existsSync(path.join(root, rel))) {
      issues.push(`Missing generated artefact ${rel}`);
    }
  }
  if (issues.length > 0) {
    return issues;
  }

  const csvText = readFileSync(path.join(root, ATLAS_SOURCE_PATH), 'utf8');
  const dataset = ingestAtlasCsv(csvText, {
    expectPublishedCount: true,
    enforceKnownMissingUrls: true,
    sourceFile: ATLAS_SOURCE_PATH,
  });
  const generatedClaims = JSON.parse(
    readFileSync(path.join(root, 'src/data/claims.generated.json'), 'utf8'),
  );
  issues.push(...findGeneratedDrift(dataset, generatedClaims));

  const knownClaimIds = new Set(dataset.claims.map((c) => c.claim_id));
  const atlasMembershipByCase = new Map<CaseId, Set<string>>();
  for (const claim of dataset.claims) {
    for (const caseId of claim.cases) {
      const set = atlasMembershipByCase.get(caseId as CaseId) ?? new Set<string>();
      set.add(claim.claim_id);
      atlasMembershipByCase.set(caseId as CaseId, set);
    }
  }
  const casebookMarkdown = readFileSync(path.join(root, CASEBOOK_SOURCE_PATH), 'utf8');
  const onDiskCasebook = JSON.parse(
    readFileSync(path.join(root, 'src/data/casebook.generated.json'), 'utf8'),
  ) as { provenance: { generatedAt: string; sourceContentSha256: string } };
  const casebook = ingestCasebookMarkdown(casebookMarkdown, {
    sourceFile: CASEBOOK_SOURCE_PATH,
    knownClaimIds,
    atlasMembershipByCase,
    generatedAt: onDiskCasebook.provenance.generatedAt,
  });
  validateCasebookDataset(casebook, dataset.claims);
  issues.push(...findCasebookGeneratedDrift(casebook, onDiskCasebook));

  if (
    (generatedClaims as { provenance: { sourceContentSha256: string } }).provenance
      .sourceContentSha256 !== PINNED_ATLAS_SHA256
  ) {
    issues.push('Generated claims provenance SHA is not the pinned atlas SHA');
  }
  if (onDiskCasebook.provenance.sourceContentSha256 !== PINNED_CASEBOOK_SHA256) {
    issues.push('Generated casebook provenance SHA is not the pinned casebook SHA');
  }
  return issues;
}

export function runReleaseValidation(root: string): string[] {
  return [
    ...checkPinnedReleaseSources(root),
    ...checkNoUnpublishedBundled(root),
    ...checkGeneratedMatchesPinnedSources(root),
  ];
}
