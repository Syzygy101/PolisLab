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
      className="panel panel--muted stack--tight"
      style={{ display: 'grid', gap: '0.75rem' }}
      data-testid="case1-re-focus"
      role="group"
      aria-label="Focus develop-or-release or exclusivity pathways"
    >
      <p className="small-note" style={{ color: 'var(--color-ink)' }}>
        <strong>Optional focus.</strong> R (develop-or-release) and E (exclusivity restriction)
        are distinct Layer D instruments. Pathway colour does not imply probability or
        desirability.
      </p>
      <div className="action-row">
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
            className="filter-chip"
            aria-pressed={focus === value}
            onClick={() => select(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="small-note small-note--subtle" aria-live="polite">
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
