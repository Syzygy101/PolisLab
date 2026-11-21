/**
 * Two-claim evidence comparison URL contract (Build 03).
 *
 * Route: `/claims/compare`
 * Query parameters:
 * - `a` — first claim ID (optional)
 * - `b` — second claim ID (optional)
 *
 * Semantics:
 * - Missing `a` or `b`: that slot is empty; the page invites selection.
 * - Valid ID: that slot shows the authentic atlas record.
 * - Invalid / unknown ID: that slot shows a not-found state; the other slot
 *   still renders if valid.
 * - Identical IDs in `a` and `b`: both slots resolve to the same record; a
 *   notice states that comparison requires two distinct claims. The duplicate
 *   is preserved in the URL until the user replaces or clears a slot.
 * - Empty / whitespace-only parameter values are treated as missing.
 * - Extra unknown query parameters are ignored (not rewritten).
 * - Comparison presents source-grounded fields side by side. It does not
 *   adjudicate truth, detect contradictions, score confidence, or recommend
 *   policy.
 *
 * Examples:
 * - `/claims/compare?a=ATLAS-EMP-001&b=ATLAS-EMP-002`
 * - `/claims/compare?a=ATLAS-EMP-005&b=ATLAS-HYP-004`
 * - `/claims/compare?a=ATLAS-LEG-001&b=ATLAS-LEG-002`
 * - `/claims/compare?a=ATLAS-HYP-001&b=ATLAS-POL-001`
 */

import type { Claim } from './schema';

export const COMPARE_PARAMS = {
  a: 'a',
  b: 'b',
} as const;

export type CompareSlotStatus = 'empty' | 'valid' | 'invalid' | 'duplicate';

export interface CompareSlot {
  param: 'a' | 'b';
  rawId: string | null;
  status: CompareSlotStatus;
  claim: Claim | undefined;
}

export interface CompareState {
  slotA: CompareSlot;
  slotB: CompareSlot;
  /** True when both slots are valid and refer to distinct claim IDs. */
  isCompleteDistinctPair: boolean;
  identicalIds: boolean;
}

function normalizeClaimIdParam(value: string | null): string | null {
  if (value === null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function resolveSlot(
  param: 'a' | 'b',
  rawId: string | null,
  otherRawId: string | null,
  lookup: (id: string) => Claim | undefined,
): CompareSlot {
  if (rawId === null) {
    return { param, rawId: null, status: 'empty', claim: undefined };
  }
  const claim = lookup(rawId);
  if (!claim) {
    return { param, rawId, status: 'invalid', claim: undefined };
  }
  if (otherRawId !== null && rawId === otherRawId) {
    return { param, rawId, status: 'duplicate', claim };
  }
  return { param, rawId, status: 'valid', claim };
}

export function parseCompareState(
  params: URLSearchParams,
  lookup: (id: string) => Claim | undefined,
): CompareState {
  const rawA = normalizeClaimIdParam(params.get(COMPARE_PARAMS.a));
  const rawB = normalizeClaimIdParam(params.get(COMPARE_PARAMS.b));
  const slotA = resolveSlot('a', rawA, rawB, lookup);
  const slotB = resolveSlot('b', rawB, rawA, lookup);
  const identicalIds = rawA !== null && rawB !== null && rawA === rawB;
  const isCompleteDistinctPair =
    slotA.status === 'valid' &&
    slotB.status === 'valid' &&
    slotA.claim !== undefined &&
    slotB.claim !== undefined &&
    slotA.claim.claim_id !== slotB.claim.claim_id;

  return {
    slotA,
    slotB,
    isCompleteDistinctPair,
    identicalIds,
  };
}

export function serializeCompareSearchParams(ids: {
  a?: string | null;
  b?: string | null;
}): URLSearchParams {
  const params = new URLSearchParams();
  const a = ids.a?.trim();
  const b = ids.b?.trim();
  if (a) {
    params.set(COMPARE_PARAMS.a, a);
  }
  if (b) {
    params.set(COMPARE_PARAMS.b, b);
  }
  return params;
}

export function compareHref(ids: { a?: string | null; b?: string | null }): string {
  const params = serializeCompareSearchParams(ids);
  const qs = params.toString();
  return qs ? `/claims/compare?${qs}` : '/claims/compare';
}
