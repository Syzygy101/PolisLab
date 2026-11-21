/**
 * AST-based extraction of ATLAS claim IDs from casebook Markdown.
 * Expands compact ranges such as ATLAS-LEG-001–005 when the numeric span is small.
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { toString } from 'mdast-util-to-string';
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

const CLAIM_ID_RE = /ATLAS-[A-Z]+-\d{3}/g;
const CLAIM_RANGE_RE =
  /ATLAS-([A-Z]+)-(\d{3})\s*[–-]\s*(?:ATLAS-\1-)?(\d{3})/g;

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
    // Guard against pathological spans in malformed fixtures.
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
      const value =
        node.type === 'text' || node.type === 'inlineCode' || node.type === 'code'
          ? node.value
          : '';
      for (const id of expandClaimIdRanges(value)) {
        found.add(id);
      }
      for (const match of value.matchAll(CLAIM_ID_RE)) {
        found.add(match[0]);
      }
    }
  });

  // Fallback: full document string (covers emphasis-split ranges across nodes).
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
 * Split text into plain segments and claim-ID segments for React rendering.
 * Does not mutate Markdown structure; used inside leaf text nodes only.
 */
export function splitTextWithClaimIds(
  text: string,
): Array<{ type: 'text'; value: string } | { type: 'claim'; id: string }> {
  const parts: Array<{ type: 'text'; value: string } | { type: 'claim'; id: string }> =
    [];
  const re = /ATLAS-[A-Z]+-\d{3}/g;
  let last = 0;
  for (const match of text.matchAll(re)) {
    const index = match.index ?? 0;
    if (index > last) {
      parts.push({ type: 'text', value: text.slice(last, index) });
    }
    parts.push({ type: 'claim', id: match[0] });
    last = index + match[0].length;
  }
  if (last < text.length) {
    parts.push({ type: 'text', value: text.slice(last) });
  }
  if (parts.length === 0) {
    parts.push({ type: 'text', value: text });
  }
  return parts;
}
