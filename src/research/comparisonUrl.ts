/**
 * Policy Comparison Laboratory URL contract (Build 06).
 *
 * Route: `/comparison`
 * Query parameters:
 * - `a` — first variant ID (optional), e.g. `C1-VAR-R`
 * - `b` — second variant ID (optional), e.g. `C1-VAR-E`
 *
 * Semantics:
 * - Defaults: empty selection (both slots empty; no parameters serialized).
 * - Missing, empty, or whitespace-only values are an empty slot (no notice).
 * - Invalid / unknown variant IDs are ignored: the slot becomes empty and an
 *   `invalid_variant` notice is recorded. The other slot is unaffected.
 * - Identical valid IDs in `a` and `b`: both slots keep the same variant and a
 *   `duplicate_variants` notice states that comparison needs distinct variants.
 *   The duplicate is preserved when serialized until a slot is changed.
 * - Repeated parameters: the first non-empty value is used and a
 *   `repeated_param` notice is recorded.
 * - Extra unknown query parameters are ignored (not rewritten).
 * - Selecting variants from different cases is allowed; the comparison layer
 *   (not the URL) states that no common basis is implied.
 * - The URL carries selection only; it never encodes a ranking or winner.
 *
 * Examples:
 * - `/comparison`
 * - `/comparison?a=C1-VAR-R&b=C1-VAR-E`
 * - `/comparison?a=C4-VAR-B0&b=C4-VAR-CF-WEAKER`
 */

import { COMPARISON_DATASET } from './comparisonDataset';

export const COMPARISON_ROUTE = '/comparison' as const;

export const COMPARISON_PARAMS = {
  a: 'a',
  b: 'b',
} as const;

export type ComparisonSlotParam = 'a' | 'b';
export type ComparisonSlotStatus = 'empty' | 'valid' | 'duplicate';

export interface ComparisonSlot {
  param: ComparisonSlotParam;
  /** Resolved variant ID, or null for an empty slot. */
  variantId: string | null;
  status: ComparisonSlotStatus;
}

export type ComparisonUrlNoticeCode =
  | 'invalid_variant'
  | 'duplicate_variants'
  | 'repeated_param';

export interface ComparisonUrlNotice {
  code: ComparisonUrlNoticeCode;
  param?: ComparisonSlotParam;
  /** Raw offending value, when applicable. */
  rawId?: string;
  message: string;
}

export interface ComparisonUrlState {
  slotA: ComparisonSlot;
  slotB: ComparisonSlot;
  notices: ComparisonUrlNotice[];
  /** Both slots hold the same variant (a === b). */
  identicalIds: boolean;
  /** Both slots are filled with two distinct variants. */
  isCompleteDistinctPair: boolean;
}

export type VariantIdPredicate = (id: string) => boolean;

const defaultIsKnownVariant: VariantIdPredicate = (id) =>
  COMPARISON_DATASET.variants.some((v) => v.id === id);

function readParam(
  params: URLSearchParams,
  name: ComparisonSlotParam,
  notices: ComparisonUrlNotice[],
): string | null {
  const values = params
    .getAll(name)
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
  if (values.length === 0) return null;
  if (params.getAll(name).length > 1) {
    notices.push({
      code: 'repeated_param',
      param: name,
      message: `Parameter "${name}" was repeated; only the first value was used.`,
    });
  }
  return values[0];
}

export function parseComparisonState(
  params: URLSearchParams,
  isKnownVariant: VariantIdPredicate = defaultIsKnownVariant,
): ComparisonUrlState {
  const notices: ComparisonUrlNotice[] = [];
  const resolved: Record<ComparisonSlotParam, string | null> = { a: null, b: null };

  for (const name of ['a', 'b'] as const) {
    const raw = readParam(params, name, notices);
    if (raw === null) continue;
    if (isKnownVariant(raw)) {
      resolved[name] = raw;
    } else {
      notices.push({
        code: 'invalid_variant',
        param: name,
        rawId: raw,
        message: `Unknown variant ID "${raw}" in parameter "${name}" was ignored.`,
      });
    }
  }

  const identicalIds = resolved.a !== null && resolved.a === resolved.b;
  if (identicalIds) {
    notices.push({
      code: 'duplicate_variants',
      message: 'Comparison requires two distinct variants; both slots hold the same variant.',
    });
  }

  const status = (id: string | null): ComparisonSlotStatus =>
    id === null ? 'empty' : identicalIds ? 'duplicate' : 'valid';

  return {
    slotA: { param: 'a', variantId: resolved.a, status: status(resolved.a) },
    slotB: { param: 'b', variantId: resolved.b, status: status(resolved.b) },
    notices,
    identicalIds,
    isCompleteDistinctPair:
      resolved.a !== null && resolved.b !== null && resolved.a !== resolved.b,
  };
}

export function serializeComparisonSearchParams(ids: {
  a?: string | null;
  b?: string | null;
}): URLSearchParams {
  const params = new URLSearchParams();
  const a = ids.a?.trim();
  const b = ids.b?.trim();
  if (a) params.set(COMPARISON_PARAMS.a, a);
  if (b) params.set(COMPARISON_PARAMS.b, b);
  return params;
}

export function comparisonHref(ids: {
  a?: string | null;
  b?: string | null;
}): string {
  const qs = serializeComparisonSearchParams(ids).toString();
  return qs ? `${COMPARISON_ROUTE}?${qs}` : COMPARISON_ROUTE;
}
