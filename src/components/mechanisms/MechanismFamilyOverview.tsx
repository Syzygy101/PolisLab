import { Link } from 'react-router-dom';
import type { Claim } from '@/research/schema';
import { MECHANISM_FAMILIES, mechanismProfileHref } from '@/research/taxonomy';
import {
  claimsExplorerHrefForMechanism,
  computeMechanismFamilyCoverage,
} from '@/research/mechanismQueries';

export function MechanismFamilyOverview({ claims }: { claims: Claim[] }) {
  const rows = computeMechanismFamilyCoverage(claims);

  return (
    <section className="space-y-4" data-testid="mechanism-family-overview">
      <div className="space-y-2">
        <h2 className="font-display text-xl font-semibold text-ink">
          Mechanism families and research coverage
        </h2>
        <p className="max-w-3xl text-sm text-ink-muted">
          Counts are unique research-coverage tallies from validated atlas tags — not causal
          importance, policy effectiveness, or evidence strength. Exact family-tag counts include
          only records tagged with the bare family ID; family-expanded counts include the family
          ID and its registered submechanisms.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => {
          const family = MECHANISM_FAMILIES.find((item) => item.id === row.id)!;
          return (
            <article
              key={row.id}
              className="space-y-3 border border-line bg-paper-raised p-4"
              data-testid={`mechanism-family-card-${row.id}`}
            >
              <header className="space-y-1">
                <h3 className="font-display text-lg font-semibold text-ink">
                  <Link
                    to={mechanismProfileHref(row.id)}
                    className="text-ink no-underline hover:text-accent"
                  >
                    <span className="font-mono text-base">{row.id}</span>
                    <span className="ml-2">{family.label}</span>
                  </Link>
                </h3>
                <p className="text-xs text-ink-muted">{family.definition}</p>
              </header>

              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-ink-subtle">Family-expanded</dt>
                  <dd
                    className="font-mono text-ink"
                    data-testid={`family-count-${row.id}`}
                  >
                    {row.familyCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-subtle">Exact family tag</dt>
                  <dd
                    className="font-mono text-ink"
                    data-testid={`exact-count-${row.id}`}
                  >
                    {row.exactCount}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-1.5">
                {row.childIds.map((childId) => (
                  <Link
                    key={childId}
                    to={mechanismProfileHref(childId)}
                    className="inline-flex border border-line bg-paper px-2 py-1 font-mono text-[11px] text-ink-muted no-underline hover:border-accent hover:text-accent"
                    data-testid={`submech-link-${childId}`}
                  >
                    {childId}
                    <span className="ml-1 text-ink-subtle">
                      ({row.childExactCounts[childId] ?? 0})
                    </span>
                  </Link>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  to={mechanismProfileHref(row.id)}
                  className="text-sm text-accent no-underline hover:underline"
                >
                  Open {row.id} profile
                </Link>
                <Link
                  to={claimsExplorerHrefForMechanism(row.id)}
                  className="text-sm text-ink-muted no-underline hover:underline"
                  data-testid={`family-claims-link-${row.id}`}
                >
                  Family evidence subset
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
