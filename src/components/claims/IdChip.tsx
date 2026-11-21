export function IdChip({ value }: { value: string }) {
  return (
    <span className="inline-flex rounded border border-line bg-neutral-soft px-1.5 py-0.5 font-mono text-[11px] text-ink-muted">
      {value}
    </span>
  );
}

export function IdChipList({ values }: { values: string[] }) {
  if (values.length === 0) {
    return <span className="text-ink-subtle">—</span>;
  }
  return (
    <span className="inline-flex flex-wrap gap-1">
      {values.map((value) => (
        <IdChip key={value} value={value} />
      ))}
    </span>
  );
}
