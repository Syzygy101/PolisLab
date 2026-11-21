/**
 * Optional Case 1 R/E focus control — does not hide the original comparison table.
 */
import { useState } from 'react';

export type InterventionFocus = 'both' | 'R' | 'E';

export function CaseInterventionFocus({
  onChange,
}: {
  onChange?: (focus: InterventionFocus) => void;
}) {
  const [focus, setFocus] = useState<InterventionFocus>('both');

  function select(next: InterventionFocus) {
    setFocus(next);
    onChange?.(next);
  }

  return (
    <div
      className="space-y-2 border border-line bg-neutral-soft px-3 py-2"
      data-testid="case1-re-focus"
      role="group"
      aria-label="Focus develop-or-release or exclusivity pathways"
    >
      <p className="text-xs font-medium text-ink">
        Optional focus: R (develop-or-release) and E (exclusivity restriction) are distinct Layer D
        instruments. Pathway colour does not imply probability or desirability.
      </p>
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['both', 'Show both R and E'],
            ['R', 'Emphasise R'],
            ['E', 'Emphasise E'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={[
              'border px-2.5 py-1 text-xs',
              focus === value
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-line bg-paper-raised text-ink-muted hover:bg-paper-raised',
            ].join(' ')}
            aria-pressed={focus === value}
            onClick={() => select(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-ink-subtle">
        The original complete pathway comparison table remains in section 6 below.
        {focus === 'R'
          ? ' Focus note: R does not claim released sites go to rivals; constitutional feasibility is unverified.'
          : null}
        {focus === 'E'
          ? ' Focus note: E is not costless for landlord inducement and is not equivalent to R.'
          : null}
      </p>
    </div>
  );
}
