/**
 * AST-safe splitting of casebook text for mechanism-tag linkification.
 *
 * Preserves grouped identifiers (M1a/M1b/M1c) and contextual subdivisions
 * (M5a-1, M5a-2). Does not silently convert M5a-1/M5a-2 into exact M5a filters.
 * Rejects partial matches such as M5a inside M5a-3.
 */

import {
  isContextualMechanismSubdivision,
  isMechanismId,
} from './taxonomy';
import {
  splitTextWithClaimIds,
  type ClaimTextPart,
} from './casebookCitations';

export type MechanismTextPart =
  | { type: 'text'; value: string }
  | { type: 'mechanism'; id: string; navigable: true }
  | {
      type: 'contextual';
      id: string;
      /** Profile anchor for contextual subdivisions (not an atlas tag). */
      href: string;
    };

/**
 * Longest-first mechanism tokens. Negative lookahead rejects trailing
 * alphanumerics or hyphenated suffixes other than the known M5a-1/M5a-2 forms
 * (so M5a inside M5a-3 is not a match).
 */
export const MECHANISM_TOKEN_RE =
  /\b(M5a-[12]|M[1-6][a-c]|M[1-6])(?![A-Za-z0-9-])/g;

export function splitTextWithMechanismIds(text: string): MechanismTextPart[] {
  const parts: MechanismTextPart[] = [];
  let last = 0;
  for (const match of text.matchAll(MECHANISM_TOKEN_RE)) {
    const index = match.index ?? 0;
    if (index > last) {
      parts.push({ type: 'text', value: text.slice(last, index) });
    }
    const id = match[1];
    if (isContextualMechanismSubdivision(id)) {
      parts.push({
        type: 'contextual',
        id,
        href: '/mechanisms/M5a#contextual-subdivisions',
      });
    } else if (isMechanismId(id)) {
      parts.push({ type: 'mechanism', id, navigable: true });
    } else {
      parts.push({ type: 'text', value: id });
    }
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

export type ResearchTextPart =
  | { type: 'text'; value: string }
  | { type: 'claim'; id: string }
  | { type: 'claim_range'; display: string; ids: string[] }
  | { type: 'mechanism'; id: string }
  | { type: 'contextual'; id: string; href: string };

/**
 * Combined claim + mechanism split for casebook leaves.
 * Claim IDs / ranges take precedence; remaining text is mechanism-split.
 */
export function splitTextWithClaimsAndMechanisms(text: string): ResearchTextPart[] {
  const out: ResearchTextPart[] = [];
  const claimParts: ClaimTextPart[] = splitTextWithClaimIds(text);
  for (const part of claimParts) {
    if (part.type === 'text') {
      for (const mech of splitTextWithMechanismIds(part.value)) {
        if (mech.type === 'text') {
          out.push(mech);
        } else if (mech.type === 'mechanism') {
          out.push({ type: 'mechanism', id: mech.id });
        } else {
          out.push({ type: 'contextual', id: mech.id, href: mech.href });
        }
      }
    } else if (part.type === 'claim') {
      out.push(part);
    } else {
      out.push(part);
    }
  }
  if (out.length === 0) {
    out.push({ type: 'text', value: text });
  }
  return out;
}
