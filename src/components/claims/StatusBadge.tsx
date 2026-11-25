import type { ClaimStatus } from '@/research/constants';

const STATUS_STYLES: Record<
  ClaimStatus,
  { label: string; className: string; tone: string }
> = {
  verified_legal_fact: {
    label: 'Verified legal fact',
    className: 'bg-ok-soft text-ok border-ok/30',
    tone: 'Established legal or institutional information',
  },
  administrative_determination: {
    label: 'Administrative determination',
    className: 'bg-accent-soft text-accent border-accent/30',
    tone: 'Observed administrative determination',
  },
  empirical_finding: {
    label: 'Empirical finding',
    className: 'bg-accent-soft text-accent border-accent/30',
    tone: 'Observed empirical or administrative information',
  },
  absence_of_finding: {
    label: 'Absence of finding',
    className: 'bg-neutral-soft text-ink-muted border-line-strong',
    tone: 'Documented absence of a finding — not proof of the contrary',
  },
  maintained_assumption: {
    label: 'Maintained assumption',
    className: 'bg-warn-soft text-warn border-warn/30',
    tone: 'Maintained modelling or framing assumption',
  },
  contested_claim: {
    label: 'Contested claim',
    className: 'bg-caution-soft text-caution border-caution/40 border-dashed',
    tone: 'Contested or restricted inference — not an established finding',
  },
  unresolved_hypothesis: {
    label: 'Unresolved hypothesis',
    className: 'bg-caution-soft text-caution border-caution/40 border-dashed',
    tone: 'Hypothesis — not a validated result',
  },
};

export function StatusBadge({ status }: { status: ClaimStatus }) {
  const meta = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex max-w-full items-center rounded border px-1.5 py-0.5 text-[11px] font-medium leading-tight ${meta.className}`}
      title={meta.tone}
    >
      {meta.label}
    </span>
  );
}

export function statusTone(status: ClaimStatus): string {
  return STATUS_STYLES[status].tone;
}
