import { Link } from 'react-router-dom';

export function PlaceholderPage({
  title,
  description,
  gated = false,
}: {
  title: string;
  description: string;
  gated?: boolean;
}) {
  return (
    <div className="space-y-4 border border-dashed border-line-strong bg-paper-raised p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
        {gated ? 'Gated · not available' : 'Not implemented in Build 01'}
      </p>
      <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
      <p className="max-w-2xl text-sm text-ink-muted">{description}</p>
      <Link to="/claims" className="inline-block text-sm font-medium">
        Go to Claims Explorer
      </Link>
    </div>
  );
}
