import { Link } from 'react-router-dom';
import {
  isMechanismId,
  mechanismProfileHref,
} from '@/research/taxonomy';
import { claimsExplorerHref } from '@/research/urlFilters';
import { isOutcomeStageId, isCaseId } from '@/research/taxonomy';

export function IdChip({ value }: { value: string }) {
  return (
    <span className="inline-flex rounded border border-line bg-neutral-soft px-1.5 py-0.5 font-mono text-[11px] text-ink-muted">
      {value}
    </span>
  );
}

/** Mechanism tag chip linking to the Mechanism Explorer profile. */
export function MechanismIdChip({ value }: { value: string }) {
  if (!isMechanismId(value)) {
    return <IdChip value={value} />;
  }
  return (
    <Link
      to={mechanismProfileHref(value)}
      className="inline-flex rounded border border-accent/30 bg-accent-soft px-1.5 py-0.5 font-mono text-[11px] text-accent no-underline hover:underline"
      data-mechanism-chip={value}
      title={`Open mechanism profile ${value}`}
    >
      {value}
    </Link>
  );
}

export function IdChipList({
  values,
  linkMechanisms = false,
}: {
  values: string[];
  /** When true, known mechanism tags link to /mechanisms/:id. */
  linkMechanisms?: boolean;
}) {
  if (values.length === 0) {
    return <span className="text-ink-subtle">—</span>;
  }
  return (
    <span className="inline-flex flex-wrap gap-1">
      {values.map((value) =>
        linkMechanisms ? (
          <MechanismIdChip key={value} value={value} />
        ) : (
          <IdChip key={value} value={value} />
        ),
      )}
    </span>
  );
}

/** Optional helper chips that deep-link into Claims Explorer exact-tag subsets. */
export function LinkedTaxonomyChip({
  kind,
  value,
}: {
  kind: 'mechanism' | 'outcome' | 'case';
  value: string;
}) {
  let href = '/claims';
  if (kind === 'mechanism') {
    href = claimsExplorerHref({ mechanisms: [value] });
  } else if (kind === 'outcome' && isOutcomeStageId(value)) {
    href = claimsExplorerHref({ outcomes: [value] });
  } else if (kind === 'case' && isCaseId(value)) {
    href = claimsExplorerHref({ cases: [value] });
  }
  return (
    <Link
      to={href}
      className="inline-flex rounded border border-line bg-neutral-soft px-1.5 py-0.5 font-mono text-[11px] text-ink-muted no-underline hover:border-accent hover:text-accent"
    >
      {value}
    </Link>
  );
}
