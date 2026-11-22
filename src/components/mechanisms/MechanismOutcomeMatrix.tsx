import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Claim } from '@/research/schema';
import {
  MECHANISM_FAMILIES,
  OUTCOME_STAGES,
  getMechanismFamily,
  getOutcomeStage,
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

function cellTone(count: number, max: number): string {
  if (count === 0 || max === 0) {
    return 'bg-paper text-ink-subtle';
  }
  const ratio = count / max;
  if (ratio >= 0.75) return 'bg-[color-mix(in_srgb,var(--color-accent)_28%,white)] text-ink';
  if (ratio >= 0.45) return 'bg-[color-mix(in_srgb,var(--color-accent)_16%,white)] text-ink';
  if (ratio >= 0.2) return 'bg-[color-mix(in_srgb,var(--color-accent)_8%,white)] text-ink';
  return 'bg-neutral-soft text-ink-muted';
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
    <div className="space-y-4" data-testid="mechanism-outcome-matrix">
      <div className="space-y-2">
        <h2 className="font-display text-xl font-semibold text-ink">
          Mechanism–outcome coverage matrix
        </h2>
        <p className="max-w-3xl text-sm text-ink-muted">
          Each cell counts unique claims co-tagged with the family-expanded mechanism set and the
          exact outcome tag. Co-tagging is metadata association — not causal identification,
          transmission intensity, effect size, or confidence.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-sm" role="grid">
          <caption className="sr-only">
            Six by six matrix of mechanism families versus outcome stages with unique claim counts
          </caption>
          <thead>
            <tr>
              <th scope="col" className="border border-line bg-neutral-soft px-2 py-2 text-left">
                Family \\ Outcome
              </th>
              {OUTCOME_STAGES.map((outcome) => (
                <th
                  key={outcome.id}
                  scope="col"
                  className="border border-line bg-neutral-soft px-2 py-2 text-center font-mono text-xs"
                  title={outcome.label}
                >
                  {outcome.id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MECHANISM_FAMILIES.map((family) => (
              <tr key={family.id}>
                <th
                  scope="row"
                  className="border border-line bg-paper-raised px-2 py-2 text-left"
                >
                  <span className="font-mono text-xs">{family.id}</span>
                  <span className="ml-1.5 text-xs font-normal text-ink-muted">
                    {family.shorthand}
                  </span>
                </th>
                {OUTCOME_STAGES.map((outcome) => {
                  const count = matrix[family.id][outcome.id];
                  const isSelected =
                    selected?.familyId === family.id &&
                    selected?.outcomeId === outcome.id;
                  return (
                    <td key={outcome.id} className="border border-line p-0 text-center">
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        aria-label={`${family.id} by ${outcome.id}: ${count} unique claims`}
                        onClick={() =>
                          setSelected({ familyId: family.id, outcomeId: outcome.id })
                        }
                        className={[
                          'flex h-full min-h-11 w-full items-center justify-center font-mono text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent',
                          cellTone(count, max),
                          isSelected ? 'ring-2 ring-inset ring-accent' : '',
                        ].join(' ')}
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

      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-subtle" aria-hidden="true">
        <span>Legend (sequential coverage intensity):</span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-4 w-6 border border-line bg-paper" /> 0
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-4 w-6 border border-line bg-neutral-soft" /> low
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-4 w-6 border border-line bg-[color-mix(in_srgb,var(--color-accent)_16%,white)]" />{' '}
          mid
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-4 w-6 border border-line bg-[color-mix(in_srgb,var(--color-accent)_28%,white)]" />{' '}
          higher
        </span>
        <span>Max cell in this release: {max}</span>
      </div>

      {selected && selectedFamily && selectedOutcome ? (
        <div
          className="space-y-3 border border-line bg-paper-raised p-4"
          data-testid="matrix-selection-panel"
          aria-live="polite"
        >
          <h3 className="font-display text-lg font-semibold text-ink">
            <span className="font-mono">{selected.familyId}</span> ×{' '}
            <span className="font-mono">{selected.outcomeId}</span>
          </h3>
          <p className="text-sm text-ink">
            <span className="font-medium">{selectedFamily.label}</span>
            {' — '}
            {selectedFamily.definition}
          </p>
          <p className="text-sm text-ink">
            <span className="font-medium">
              {selectedOutcome.id} {selectedOutcome.label}
            </span>
            {' — '}
            {selectedOutcome.meaning}
          </p>
          <p className="text-sm text-ink-muted" data-testid="matrix-selection-count">
            {selectedCount} unique claim{selectedCount === 1 ? '' : 's'} satisfy family-expanded{' '}
            <span className="font-mono">{selected.familyId}</span> and exact{' '}
            <span className="font-mono">{selected.outcomeId}</span>. Do not sum overlapping
            matrix cells as distinct claims.
          </p>
          <p className="text-xs text-ink-subtle">
            Limitation: co-tagging records research association in the atlas. It does not identify
            a causal pathway from the mechanism family to the outcome stage.
          </p>
          <Link
            to={claimsExplorerHrefForMatrixCell(selected.familyId, selected.outcomeId)}
            className="inline-flex border border-accent bg-accent px-3 py-1.5 text-sm font-medium text-white no-underline hover:opacity-90"
            data-testid="matrix-claims-link"
          >
            View filtered evidence subset
          </Link>
        </div>
      ) : null}
    </div>
  );
}
