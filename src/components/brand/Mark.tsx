/** Proposed PolisLab mark — not an approved trademark. */

export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      className="brand-mark"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="26" height="26" stroke="var(--color-accent)" strokeWidth="2" />
      <path
        d="M9 23V9h6.5c3.2 0 5.2 1.7 5.2 4.4 0 2.6-2 4.3-5.2 4.3H12.2V23H9zm3.2-8.3h3c1.5 0 2.4-.8 2.4-2.1s-.9-2.1-2.4-2.1h-3v4.2z"
        fill="var(--color-ink)"
      />
      <path
        d="M22 9v14"
        stroke="var(--color-data)"
        strokeWidth="2"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand-lockup${compact ? ' brand-lockup--compact' : ''}`}>
      <BrandMark size={compact ? 24 : 28} />
      <span className="brand-wordmark">PolisLab</span>
    </span>
  );
}
