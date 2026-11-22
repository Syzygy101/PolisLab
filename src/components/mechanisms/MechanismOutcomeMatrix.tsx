import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Claim } from '@/research/schema';
import {
  MECHANISM_FAMILIES,
  OUTCOME_STAGES,
  getMechanismFamily,
  getOutcomeStage,
  mechanismProfileHref,
  type MechanismFamilyId,
  type OutcomeStageId,
} from '@/research/taxonomy';
import {
  claimsExplorerHrefForMatrixCell,
  computeMechanismOutcomeMatrix,
  countMechanismOutcomeCell,
} from '@/research/mechanismQueries';

interface MechanismOutcomeMatrixProps {
  claims: Claim[];
}

/** Sequential coverage level 0–4 relative to the largest cell (a count band, not a score). */
function cellLevel(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0 || max === 0) return 0;
  const ratio = count / max;
  if (ratio >= 0.75) return 4;
  if (ratio >= 0.45) return 3;
  if (ratio >= 0.2) return 2;
  return 1;
}

export function MechanismOutcomeMatrix({ claims }: MechanismOutcomeMatrixProps) {
  const matrix = useMemo(() => computeMechanismOutcomeMatrix(claims), [claims]);
  const max = useMemo(() => {
    let m = 0;
    for (const family of MECHANISM_FAMILIES) {
      for (const outcome of OUTCOME_STAGES) {
        m = Math.max(m, matrix[family.id][outcome.id]);
      }
    }
    return m;
  }, [matrix]);

  const [selected, setSelected] = useState<{
    familyId: MechanismFamilyId;
    outcomeId: OutcomeStageId;
  } | null>({ familyId: 'M1', outcomeId: 'O1' });

  const selectedCount = selected
    ? countMechanismOutcomeCell(claims, selected.familyId, selected.outcomeId)
    : 0;
  const selectedFamily = selected ? getMechanismFamily(selected.familyId) : null;
  const selectedOutcome = selected ? getOutcomeStage(selected.outcomeId) : null;

  return (
    <section
      id="mechanism-matrix"
      className="stack"
      style={{ scrollMarginTop: '1.5rem' }}
      aria-labelledby="mechanism-matrix-heading"
      data-testid="mechanism-outcome-matrix"
    >
      <div>
        <h2 id="mechanism-matrix-heading" className="section-title">
          Mechanism–outcome coverage matrix
        </h2>
        <p className="small-note">
          Each cell counts unique claims co-tagged with the family-expanded mechanism set and the
          exact outcome tag. Co-tagging is metadata association — not causal identification,
          transmission intensity, effect size, or confidence. Select a cell to read its meaning and
          open the matching evidence subset.
        </p>
      </div>

      <div className="matrix-layout stack">
        <div className="stack--tight" style={{ display: 'grid', gap: '0.75rem', minWidth: 0 }}>
          <div className="matrix-wrap">
            <table className="matrix">
              <caption className="sr-only">
                Six by six matrix of mechanism families versus outcome stages with unique claim
                counts. Rows are mechanism families; columns are outcome stages.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="matrix-corner">
                    Family / Outcome
                  </th>
                  {OUTCOME_STAGES.map((outcome) => (
                    <th
                      key={outcome.id}
                      scope="col"
                      title={outcome.label}
                      className={selected?.outcomeId === outcome.id ? 'is-axis-selected' : undefined}
                    >
                      <span className="matrix-col-id">{outcome.id}</span>
                      <span className="matrix-col-label">{outcome.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MECHANISM_FAMILIES.map((family) => (
                  <tr key={family.id}>
                    <th
                      scope="row"
                      className={selected?.familyId === family.id ? 'is-axis-selected' : undefined}
                    >
                      <span className="matrix-row-id">{family.id}</span>
                      <span className="matrix-row-label">{family.shorthand}</span>
                    </th>
                    {OUTCOME_STAGES.map((outcome) => {
                      const count = matrix[family.id][outcome.id];
                      const isSelected =
                        selected?.familyId === family.id && selected?.outcomeId === outcome.id;
                      return (
                        <td key={outcome.id}>
                          <button
                            type="button"
                            aria-pressed={isSelected}
                            aria-label={`${family.id} by ${outcome.id}: ${count} unique claims`}
                            onClick={() =>
                              setSelected({ familyId: family.id, outcomeId: outcome.id })
                            }
                            className="matrix-cell"
                            data-level={cellLevel(count, max)}
                            data-testid={`matrix-cell-${family.id}-${outcome.id}`}
                          >
                            {count}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="matrix-legend" aria-label="Legend: sequential coverage intensity">
            <li>
              <i style={{ background: 'var(--color-paper)' }} />0
            </li>
            <li>
              <i style={{ background: 'color-mix(in srgb, var(--color-accent) 7%, white)' }} />
              low
            </li>
            <li>
              <i style={{ background: 'color-mix(in srgb, var(--color-accent) 16%, white)' }} />
              mid
            </li>
            <li>
              <i style={{ background: 'color-mix(in srgb, var(--color-accent) 28%, white)' }} />
              higher
            </li>
            <li>
              <i style={{ background: 'color-mix(in srgb, var(--color-accent) 42%, white)' }} />
              highest
            </li>
            <li>Shading is a count band relative to this release’s maximum cell ({max}). The number is authoritative.</li>
          </ul>
        </div>

        {selected && selectedFamily && selectedOutcome ? (
          <div
            className="panel matrix-selection"
            data-testid="matrix-selection-panel"
            aria-live="polite"
          >
            <h3 className="panel-title">
              <span className="mono">{selected.familyId}</span> ×{' '}
              <span className="mono">{selected.outcomeId}</span>
            </h3>
            <p className="small-note" style={{ color: 'var(--color-ink)' }}>
              <strong>{selectedFamily.label}</strong>
              {' — '}
              {selectedFamily.definition}
            </p>
            <p className="small-note" style={{ color: 'var(--color-ink)' }}>
              <strong>
                {selectedOutcome.id} {selectedOutcome.label}
              </strong>
              {' — '}
              {selectedOutcome.meaning}
            </p>
            <p className="matrix-selection-count" data-testid="matrix-selection-count">
              {selectedCount} unique claim{selectedCount === 1 ? '' : 's'} satisfy family-expanded{' '}
              <span className="mono">{selected.familyId}</span> and exact{' '}
              <span className="mono">{selected.outcomeId}</span>. Do not sum overlapping matrix
              cells as distinct claims.
            </p>
            <p className="small-note small-note--subtle">
              Limitation: co-tagging records research association in the atlas. It does not
              identify a causal pathway from the mechanism family to the outcome stage.
            </p>
            <div className="action-row">
              <Link
                to={claimsExplorerHrefForMatrixCell(selected.familyId, selected.outcomeId)}
                className="btn btn--primary"
                data-testid="matrix-claims-link"
              >
                View filtered evidence subset
              </Link>
              <Link to={mechanismProfileHref(selected.familyId)} className="btn btn--ghost">
                {selected.familyId} family profile
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
