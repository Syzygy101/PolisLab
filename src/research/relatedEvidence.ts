import type { Claim } from './schema';

export type RelatedOverlapDimension =
  | 'mechanism'
  | 'outcome'
  | 'case'
  | 'literature';

export interface RelatedOverlap {
  dimension: RelatedOverlapDimension;
  sharedIds: string[];
}

export interface RelatedEvidenceItem {
  claim: Claim;
  overlaps: RelatedOverlap[];
  /** Human-readable association reason; metadata overlap only. */
  explanation: string;
}

function sharedSorted(a: string[], b: string[]): string[] {
  const setB = new Set(b);
  return a.filter((id) => setB.has(id)).sort((x, y) => x.localeCompare(y));
}

function formatSharedList(label: string, ids: string[]): string {
  if (ids.length === 1) {
    return `${label} ${ids[0]}`;
  }
  if (ids.length === 2) {
    return `${label}s ${ids[0]} and ${ids[1]}`;
  }
  const head = ids.slice(0, -1).join(', ');
  return `${label}s ${head}, and ${ids[ids.length - 1]}`;
}

/**
 * Build a plain-language explanation of metadata overlap.
 * Does not assert causal support, corroboration, contradiction, or citation
 * relationships unless those appear in the authoritative atlas text itself.
 */
export function explainRelatedOverlaps(overlaps: RelatedOverlap[]): string {
  const parts: string[] = [];
  for (const overlap of overlaps) {
    if (overlap.sharedIds.length === 0) {
      continue;
    }
    switch (overlap.dimension) {
      case 'mechanism':
        parts.push(formatSharedList('mechanism', overlap.sharedIds));
        break;
      case 'outcome':
        parts.push(formatSharedList('outcome', overlap.sharedIds));
        break;
      case 'case':
        parts.push(formatSharedList('case', overlap.sharedIds));
        break;
      case 'literature':
        parts.push(formatSharedList('literature-source identifier', overlap.sharedIds));
        break;
      default:
        break;
    }
  }
  if (parts.length === 0) {
    return 'No shared metadata identifiers.';
  }
  if (parts.length === 1) {
    return `Shares ${parts[0]}.`;
  }
  if (parts.length === 2) {
    return `Shares ${parts[0]} and ${parts[1]}.`;
  }
  const head = parts.slice(0, -1).join('; ');
  return `Shares ${head}; and ${parts[parts.length - 1]}.`;
}

/**
 * Related evidence via explicit original metadata overlap only.
 *
 * Rules:
 * - Shared exact mechanism identifiers, outcome identifiers, case membership,
 *   and/or literature-source identifiers.
 * - Excludes the currently inspected claim.
 * - Deduplicates by claim_id.
 * - Sorted deterministically by claim_id.
 * - Association is metadata overlap, not causal connection or evidentiary support.
 */
export function findRelatedEvidence(
  claim: Claim,
  claims: Claim[],
): RelatedEvidenceItem[] {
  const items: RelatedEvidenceItem[] = [];

  for (const other of claims) {
    if (other.claim_id === claim.claim_id) {
      continue;
    }

    const overlaps: RelatedOverlap[] = [];
    const mechanisms = sharedSorted(claim.mechanisms, other.mechanisms);
    if (mechanisms.length > 0) {
      overlaps.push({ dimension: 'mechanism', sharedIds: mechanisms });
    }
    const outcomes = sharedSorted(claim.outcomes, other.outcomes);
    if (outcomes.length > 0) {
      overlaps.push({ dimension: 'outcome', sharedIds: outcomes });
    }
    const cases = sharedSorted(claim.cases, other.cases);
    if (cases.length > 0) {
      overlaps.push({ dimension: 'case', sharedIds: cases });
    }
    const literature = sharedSorted(claim.literatureSources, other.literatureSources);
    if (literature.length > 0) {
      overlaps.push({ dimension: 'literature', sharedIds: literature });
    }

    if (overlaps.length === 0) {
      continue;
    }

    items.push({
      claim: other,
      overlaps,
      explanation: explainRelatedOverlaps(overlaps),
    });
  }

  return items.sort((a, b) => a.claim.claim_id.localeCompare(b.claim.claim_id));
}

/**
 * Claims sharing an exact primary source URL (excluding the seed claim).
 * Titles alone never merge documents; URL match is required.
 */
export function findClaimsSharingSourceUrl(
  claim: Claim,
  claims: Claim[],
): Claim[] {
  const url = claim.primary_source_url.trim();
  if (!url) {
    return [];
  }
  return claims
    .filter(
      (other) =>
        other.claim_id !== claim.claim_id &&
        other.primary_source_url.trim() === url,
    )
    .sort((a, b) => a.claim_id.localeCompare(b.claim_id));
}

/**
 * Claims sharing any of the given literature-source identifiers.
 */
export function findClaimsSharingLiterature(
  literatureIds: string[],
  claims: Claim[],
  excludeClaimId?: string,
): Claim[] {
  const wanted = new Set(literatureIds.filter((id) => id.trim().length > 0));
  if (wanted.size === 0) {
    return [];
  }
  return claims
    .filter((claim) => {
      if (excludeClaimId && claim.claim_id === excludeClaimId) {
        return false;
      }
      return claim.literatureSources.some((id) => wanted.has(id));
    })
    .sort((a, b) => a.claim_id.localeCompare(b.claim_id));
}
