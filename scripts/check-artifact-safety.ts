/**
 * Publication artifact safety gate (Build 08F).
 *
 * Distinguishes:
 *   A. Permitted textual citations already present in pinned published research
 *   B. Unpublished files actually included in the release tree or dist
 *   C. Unpublished path tokens / payloads embedded in otherwise innocuous files
 *      when those tokens are NOT present in the pinned published corpus
 *
 * Does not weaken protection by blanket-allowing all JS or all research/ strings.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TEXT_EXT = new Set([
  '.js',
  '.mjs',
  '.cjs',
  '.css',
  '.html',
  '.json',
  '.svg',
  '.txt',
  '.md',
  '.csv',
  '.map',
]);

/** Path / filename tokens that must not appear unless cited in pinned published research. */
export const UNPUBLISHED_TOKEN_RE =
  /research\/0[1-9]_[A-Za-z0-9_./-]+|references\/[A-Za-z0-9_ ./-]+|World Economic Policy/g;

/** Filenames that must never appear as distributed files. */
const FORBIDDEN_DIST_NAME_RE =
  /^(?:0[1-9]_[A-Za-z0-9_-]+|World Economic Policy)/i;

const PUBLISHED_CORPUS_PATHS = [
  'research/10_policy_claims_atlas.csv',
  'research/10_policy_assessment_casebook.md',
  'LICENSE',
] as const;

export interface ArtifactSafetyIssue {
  code: 'tracked_unpublished' | 'dist_forbidden_file' | 'embedded_unpublished_token';
  detail: string;
}

export function loadPinnedPublishedCorpus(root: string): string {
  return PUBLISHED_CORPUS_PATHS.map((rel) =>
    readFileSync(path.join(root, rel), 'utf8'),
  ).join('\n');
}

export function isPermittedPublishedCitation(token: string, corpus: string): boolean {
  return corpus.includes(token);
}

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...walkFiles(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

export function checkTrackedUnpublished(root: string): ArtifactSafetyIssue[] {
  const issues: ArtifactSafetyIssue[] = [];
  let tracked = '';
  try {
    tracked = execFileSync('git', ['ls-files', '-z'], {
      cwd: root,
      encoding: 'utf8',
    });
  } catch {
    // Not a git checkout (e.g. isolated fixture) — skip tracked-path check.
    return issues;
  }
  for (const rel of tracked.split('\0')) {
    if (!rel) continue;
    if (/^research\/0[1-9]_/.test(rel) || /^references\//.test(rel)) {
      issues.push({
        code: 'tracked_unpublished',
        detail: `Git tracks unpublished path: ${rel}`,
      });
    }
  }
  return issues;
}

export function checkDistForbiddenFiles(root: string): ArtifactSafetyIssue[] {
  const issues: ArtifactSafetyIssue[] = [];
  const distDir = path.join(root, 'dist');
  for (const full of walkFiles(distDir)) {
    const rel = path.relative(root, full);
    const base = path.basename(full);
    if (FORBIDDEN_DIST_NAME_RE.test(base) || /(?:^|\/)references\//.test(rel)) {
      issues.push({
        code: 'dist_forbidden_file',
        detail: `Forbidden unpublished file in dist: ${rel}`,
      });
    }
  }
  return issues;
}

export function checkDistEmbeddedTokens(
  root: string,
  corpus: string,
): ArtifactSafetyIssue[] {
  const issues: ArtifactSafetyIssue[] = [];
  const distDir = path.join(root, 'dist');
  for (const full of walkFiles(distDir)) {
    const ext = path.extname(full).toLowerCase();
    if (ext === '.map') continue;
    if (!TEXT_EXT.has(ext) && ext !== '') continue;
    let text: string;
    try {
      text = readFileSync(full, 'utf8');
    } catch {
      continue;
    }
    const rel = path.relative(root, full);
    const seen = new Set<string>();
    for (const match of text.matchAll(UNPUBLISHED_TOKEN_RE)) {
      const token = match[0];
      if (seen.has(token)) continue;
      seen.add(token);
      if (isPermittedPublishedCitation(token, corpus)) {
        continue;
      }
      issues.push({
        code: 'embedded_unpublished_token',
        detail: `Unapproved unpublished token "${token}" in ${rel}`,
      });
    }
  }
  return issues;
}

export function runArtifactSafetyCheck(root: string): ArtifactSafetyIssue[] {
  const corpus = loadPinnedPublishedCorpus(root);
  return [
    ...checkTrackedUnpublished(root),
    ...checkDistForbiddenFiles(root),
    ...checkDistEmbeddedTokens(root, corpus),
  ];
}

function main(): void {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const issues = runArtifactSafetyCheck(root);
  if (issues.length > 0) {
    console.error('Artifact safety check FAILED:');
    for (const issue of issues) {
      console.error(`  [${issue.code}] ${issue.detail}`);
    }
    process.exit(1);
  }
  console.log('Artifact safety checks passed.');
}

const isDirect =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirect) {
  main();
}
