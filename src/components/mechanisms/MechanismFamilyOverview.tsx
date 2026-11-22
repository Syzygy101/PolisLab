import { Link } from 'react-router-dom';
import type { Claim } from '@/research/schema';
import {
  MECHANISM_FAMILIES,
  getMechanismSubmechanism,
  mechanismProfileHref,
} from '@/research/taxonomy';
import {
  claimsExplorerHrefForMechanism,
  computeMechanismFamilyCoverage,
} from '@/research/mechanismQueries';

export function MechanismFamilyOverview({ claims }: { claims: Claim[] }) {
  const rows = computeMechanismFamilyCoverage(claims);

  return (
    <section
      id="mechanism-families"
      className="stack"
      style={{ scrollMarginTop: '1.5rem' }}
      aria-labelledby="mechanism-families-heading"
      data-testid="mechanism-family-overview"
    >
      <div>
        <h2 id="mechanism-families-heading" className="section-title">
          Mechanism families and research coverage
        </h2>
        <p className="small-note">
          Counts are unique research-coverage tallies from validated atlas tags — not causal
          importance, policy effectiveness, or evidence strength. Exact family-tag counts include
          only records tagged with the bare family ID; family-expanded counts include the family ID
          and its registered submechanisms.
        </p>
      </div>

      <div className="family-list">
        {rows.map((row) => {
          const family = MECHANISM_FAMILIES.find((item) => item.id === row.id)!;
          return (
            <article
              key={row.id}
              className="family-card"
              data-testid={`mechanism-family-card-${row.id}`}
            >
              <header className="stack--tight" style={{ display: 'grid' }}>
                <h3>
                  <Link to={mechanismProfileHref(row.id)}>
                    <span className="family-id">{row.id}</span>{' '}
                    {family.label}
                  </Link>
                </h3>
                <p className="small-note">{family.definition}</p>
              </header>

              <dl className="stat-row">
                <div>
                  <dt>Family-expanded claims</dt>
                  <dd data-testid={`family-count-${row.id}`}>{row.familyCount}</dd>
                </div>
                <div>
                  <dt>Exact family tag</dt>
                  <dd data-testid={`exact-count-${row.id}`}>{row.exactCount}</dd>
                </div>
              </dl>

              <div>
                <p className="eyebrow" style={{ marginBottom: '0.35rem' }}>
                  Exact atlas submechanisms
                </p>
                <ul className="sub-list">
                  {row.childIds.map((childId) => {
                    const child = getMechanismSubmechanism(childId);
                    return (
                      <li key={childId}>
                        <Link
                          to={mechanismProfileHref(childId)}
                          className="sub-id"
                          data-testid={`submech-link-${childId}`}
                        >
                          {childId}
                        </Link>
                        <span>{child.label}</span>
                        <span className="sub-count" title="Exact-tag claims">
                          {row.childExactCounts[childId] ?? 0} exact
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="action-row">
                <Link to={mechanismProfileHref(row.id)} className="btn btn--secondary">
                  Open {row.id} profile
                </Link>
                <Link
                  to={claimsExplorerHrefForMechanism(row.id)}
                  className="btn btn--ghost"
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
