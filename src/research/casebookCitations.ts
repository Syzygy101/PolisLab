/**
 * AST-based extraction and leaf splitting of ATLAS claim IDs from casebook Markdown.
 *
 * Compact ranges such as ATLAS-LEG-001–002 are preserved in source wording while
 * expanding to both claim targets for navigation. Partial matches such as
 * ATLAS-LEG-001 inside ATLAS-LEG-0010 are rejected.
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { toString } from 'mdast-util-to-string';
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

/** Exact claim ID — three digits, not followed by another digit. */
export const CLAIM_ID_RE = /ATLAS-[A-Z]+-\d{3}(?!\d)/g;

/** Compact inclusive ranges: ATLAS-LEG-001–005 or ATLAS-LEG-001–ATLAS-LEG-005. */
export const CLAIM_RANGE_RE =
  /ATLAS-([A-Z]+)-(\d{3})\s*[–-]\s*(?:ATLAS-\1-)?(\d{3})(?!\d)/g;

export type ClaimTextPart =
  | { type: 'text'; value: string }
  | { type: 'claim'; id: string }
  | {
      type: 'claim_range';
      /** Exact source wording of the range token. */
      display: string;
      ids: string[];
    };

export function parseCasebookMarkdownAst(markdown: string): Root {
  return unified().use(remarkParse).use(remarkGfm).parse(markdown) as Root;
}

/** Expand ATLAS-LEG-001–005 style ranges into individual IDs (inclusive). */
export function expandClaimIdRanges(text: string): string[] {
  const ids: string[] = [];
  for (const match of text.matchAll(CLAIM_RANGE_RE)) {
    const family = match[1];
    const start = Number(match[2]);
    const end = Number(match[3]);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
      continue;
    }
    if (end - start > 40) {
      continue;
    }
    for (let n = start; n <= end; n += 1) {
      ids.push(`ATLAS-${family}-${String(n).padStart(3, '0')}`);
    }
  }
  return ids;
}

/** Collect distinct ATLAS claim IDs appearing in Markdown text. */
export function extractClaimIdsFromMarkdown(markdown: string): string[] {
  const ast = parseCasebookMarkdownAst(markdown);
  const found = new Set<string>();

  visit(ast, (node) => {
    if (node.type === 'text' || node.type === 'inlineCode' || node.type === 'code') {
      const value = node.value;
      for (const id of expandClaimIdRanges(value)) {
        found.add(id);
      }
      for (const match of value.matchAll(CLAIM_ID_RE)) {
        found.add(match[0]);
      }
    }
  });

  const plain = toString(ast);
  for (const id of expandClaimIdRanges(plain)) {
    found.add(id);
  }
  for (const match of plain.matchAll(CLAIM_ID_RE)) {
    found.add(match[0]);
  }

  return [...found].sort((a, b) => a.localeCompare(b));
}

/**
 * Split text into plain segments, single claim IDs, and preserved claim ranges.
 * Ranges keep their source wording while exposing every expanded target ID.
 */
export function splitTextWithClaimIds(text: string): ClaimTextPart[] {
  type Hit =
    | { kind: 'range'; index: number; length: number; display: string; ids: string[] }
    | { kind: 'claim'; index: number; length: number; id: string };

  const hits: Hit[] = [];
  for (const match of text.matchAll(CLAIM_RANGE_RE)) {
    const index = match.index ?? 0;
    const ids = expandClaimIdRanges(match[0]);
    if (ids.length === 0) continue;
    hits.push({
      kind: 'range',
      index,
      length: match[0].length,
      display: match[0],
      ids,
    });
  }
  for (const match of text.matchAll(CLAIM_ID_RE)) {
    const index = match.index ?? 0;
    const length = match[0].length;
    // Skip IDs already covered by a range hit.
    const covered = hits.some(
      (hit) => hit.kind === 'range' && index >= hit.index && index < hit.index + hit.length,
    );
    if (covered) continue;
    hits.push({ kind: 'claim', index, length, id: match[0] });
  }
  hits.sort((a, b) => a.index - b.index || b.length - a.length);

  const parts: ClaimTextPart[] = [];
  let last = 0;
  for (const hit of hits) {
    if (hit.index < last) continue;
    if (hit.index > last) {
      parts.push({ type: 'text', value: text.slice(last, hit.index) });
    }
    if (hit.kind === 'range') {
      parts.push({ type: 'claim_range', display: hit.display, ids: hit.ids });
    } else {
      parts.push({ type: 'claim', id: hit.id });
    }
    last = hit.index + hit.length;
  }
  if (last < text.length) {
    parts.push({ type: 'text', value: text.slice(last) });
  }
  if (parts.length === 0) {
    parts.push({ type: 'text', value: text });
  }
  return parts;
}
