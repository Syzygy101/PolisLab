import { Link } from 'react-router-dom';
import type { ClaimStatus } from '@/research/constants';
import { CLAIM_STATUSES } from '@/research/constants';
import { STATUS_LABELS } from '@/research/taxonomy';
import { claimsExplorerHref } from '@/research/urlFilters';

interface StatusDistributionProps {
  counts: Record<ClaimStatus, number>;
  total: number;
}

/** Accessible horizontal bar chart of evidence-status composition. */
export function StatusDistribution({ counts, total }: StatusDistributionProps) {
  const max = Math.max(...CLAIM_STATUSES.map((s) => counts[s]), 1);

  return (
    <div className="space-y-3" data-testid="status-distribution">
      <p className="text-xs text-ink-subtle">
        Counts by published classification — not an evidence-strength scale. Each label opens the
        Evidence library filtered to that status.
      </p>
      <ul className="space-y-2" aria-label="Evidence status distribution">
        {CLAIM_STATUSES.map((status) => {
          const count = counts[status];
          const widthPct = total === 0 ? 0 : Math.round((count / max) * 100);
          const label = STATUS_LABELS[status];
          return (
            <li key={status} className="grid grid-cols-[minmax(0,12rem)_1fr_auto] items-center gap-3">
              <Link
                to={claimsExplorerHref({ statuses: [status] })}
                className="truncate text-sm font-medium text-accent underline-offset-2 hover:underline"
                aria-label={`Filter Evidence library by status ${label}`}
                title={status}
                data-testid={`status-link-${status}`}
              >
                {label}
              </Link>
              <div
                className="h-5 bg-neutral-soft"
                role="img"
                aria-label={`${label}: ${count} of ${total} claims`}
              >
                <div
                  className="h-full bg-accent/55"
                  style={{ width: `${widthPct}%` }}
                />
              </div>
              <span className="w-8 text-right font-mono text-sm tabular-nums text-ink">
                {count}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
