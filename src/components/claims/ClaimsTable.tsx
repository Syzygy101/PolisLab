import { useNavigate } from 'react-router-dom';
import type { Claim } from '@/research/schema';
import { StatusBadge } from './StatusBadge';
import { IdChipList } from './IdChip';

interface ClaimsTableProps {
  claims: Claim[];
}

export function ClaimsTable({ claims }: ClaimsTableProps) {
  const navigate = useNavigate();

  if (claims.length === 0) {
    return (
      <div
        role="status"
        className="border border-dashed border-line-strong bg-paper-raised px-4 py-10 text-center"
      >
        <p className="text-sm font-medium text-ink">No claims match the current filters</p>
        <p className="mt-1 text-sm text-ink-muted">
          Clear filters or broaden search terms to restore results from the published atlas.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-line bg-paper-raised">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-neutral-soft text-xs uppercase tracking-wide text-ink-muted">
          <tr>
            <th scope="col" className="border-b border-line px-3 py-2 font-medium">
              Claim ID
            </th>
            <th scope="col" className="border-b border-line px-3 py-2 font-medium">
              Claim
            </th>
            <th scope="col" className="border-b border-line px-3 py-2 font-medium">
              Status
            </th>
            <th scope="col" className="border-b border-line px-3 py-2 font-medium">
              Mechanisms
            </th>
            <th scope="col" className="border-b border-line px-3 py-2 font-medium">
              Outcomes
            </th>
            <th scope="col" className="border-b border-line px-3 py-2 font-medium">
              Cases
            </th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim) => (
            <tr
              key={claim.claim_id}
              tabIndex={0}
              role="link"
              aria-label={`Open claim ${claim.claim_id}`}
              className="cursor-pointer border-b border-line last:border-b-0 hover:bg-accent-soft/40 focus-visible:bg-accent-soft/50"
              onClick={() => navigate(`/claims/${claim.claim_id}`)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  navigate(`/claims/${claim.claim_id}`);
                }
              }}
            >
              <td className="whitespace-nowrap px-3 py-2 align-top font-mono text-xs text-accent">
                {claim.claim_id}
              </td>
              <td className="max-w-xl px-3 py-2 align-top text-ink">
                <span className="line-clamp-3">{claim.exact_claim}</span>
              </td>
              <td className="px-3 py-2 align-top">
                <StatusBadge status={claim.status} />
              </td>
              <td className="px-3 py-2 align-top">
                <IdChipList values={claim.mechanisms} />
              </td>
              <td className="px-3 py-2 align-top">
                <IdChipList values={claim.outcomes} />
              </td>
              <td className="px-3 py-2 align-top">
                <IdChipList values={claim.cases} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
