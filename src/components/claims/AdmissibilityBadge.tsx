import type { AdmissibilityValue } from '@/research/constants';

/**
 * Admissibility badges use a shared neutral accent treatment.
 * Colour must not read as truth/falsity or an ordinal quality score.
 */
const ADMISSIBILITY_META: Record<
  AdmissibilityValue,
  { label: string; className: string; note: string }
> = {
  yes: {
    label: 'Admissible: yes',
    className: 'bg-accent-soft text-accent border-accent/30',
    note: 'May be used in policy comparison under the stated conditions — not a truth verdict',
  },
  conditional: {
    label: 'Admissible: conditional',
    className: 'bg-accent-soft text-accent border-accent/30 border-dashed',
    note: 'Only under the stated conditions — not a truth verdict',
  },
  no: {
    label: 'Admissible: no',
    className: 'bg-neutral-soft text-ink-muted border-line-strong',
    note: 'Not admissible as a validated analytical result — does not mean the claim is false',
  },
};

export function AdmissibilityBadge({ value }: { value: AdmissibilityValue }) {
  const meta = ADMISSIBILITY_META[value];
  return (
    <span
      className={`inline-flex max-w-full items-center rounded border px-1.5 py-0.5 text-[11px] font-medium leading-tight ${meta.className}`}
      title={meta.note}
    >
      {meta.label}
    </span>
  );
}

export function admissibilityExpandedLabel(value: AdmissibilityValue): string {
  return ADMISSIBILITY_META[value].note;
}
