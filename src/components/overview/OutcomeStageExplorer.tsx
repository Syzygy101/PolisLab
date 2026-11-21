import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Claim } from '@/research/schema';
import {
  OUTCOME_STAGES,
  type OutcomeStageId,
} from '@/research/taxonomy';
import { countClaimsByOutcome } from '@/research/coverage';
import { claimsExplorerHref } from '@/research/urlFilters';

interface OutcomeStageExplorerProps {
  claims: Claim[];
}

/**
 * Accessible toggle-button group (not incomplete tab semantics).
 * Selected state via aria-pressed; all stages remain in the tab order.
 */
export function OutcomeStageExplorer({ claims }: OutcomeStageExplorerProps) {
  const [selected, setSelected] = useState<OutcomeStageId>('O1');
  const stage = OUTCOME_STAGES.find((s) => s.id === selected)!;
  const matchCount = countClaimsByOutcome(claims, selected);

  return (
    <div className="space-y-4" data-testid="outcome-stage-explorer">
      <p className="text-sm text-ink-muted">
        O1–O6 is a <span className="font-medium text-ink">conceptual progression</span> used to
        keep outcome claims distinct. It is not an identified causal chain, numerical model, or
        guarantee that every entrant proceeds through all six stages.
      </p>

      <div
        role="group"
        aria-label="Outcome stages"
        className="flex flex-wrap gap-1.5"
      >
        {OUTCOME_STAGES.map((item) => {
          const isSelected = item.id === selected;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${item.id}: ${item.label}`}
              onClick={() => setSelected(item.id)}
              className={[
                'border px-2.5 py-1.5 text-left text-sm transition-colors',
                isSelected
                  ? 'border-accent bg-accent-soft font-medium text-accent'
                  : 'border-line bg-paper text-ink-muted hover:bg-neutral-soft',
              ].join(' ')}
            >
              <span className="font-mono text-xs">{item.id}</span>
              <span className="ml-1.5">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div
        className="space-y-3 border border-line bg-paper-raised p-4"
        data-testid="outcome-stage-panel"
        aria-live="polite"
      >
        <h3 className="font-display text-lg font-semibold text-ink">
          <span className="font-mono text-base">{stage.id}</span> — {stage.label}
        </h3>
        <p className="text-sm leading-relaxed text-ink">{stage.meaning}</p>
        <p className="text-sm text-ink-muted">
          <span className="font-medium text-ink">Illustrative indicator (example only): </span>
          {stage.illustrativeExample}
        </p>
        <p className="text-sm text-ink-muted">
          <span className="font-medium text-ink">Limitation on later stages: </span>
          {stage.subsequentStageLimitation}
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link
            to={claimsExplorerHref({ outcomes: [selected] })}
            className="inline-flex border border-accent bg-accent px-3 py-1.5 text-sm font-medium text-white no-underline hover:opacity-90"
            data-testid={`outcome-claims-link-${selected}`}
          >
            View claims tagged {selected}
          </Link>
          <span className="text-xs text-ink-subtle" data-testid="outcome-match-count">
            {matchCount} matching claim{matchCount === 1 ? '' : 's'} (exact tag{' '}
            <span className="font-mono">{selected}</span>)
          </span>
        </div>
      </div>
    </div>
  );
}
