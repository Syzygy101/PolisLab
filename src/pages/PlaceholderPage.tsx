import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function PlaceholderPage({
  title,
  description,
  gated = false,
}: {
  title: string;
  description: string;
  gated?: boolean;
}) {
  useDocumentTitle(title);

  return (
    <div className="space-y-4 border border-dashed border-line-strong bg-paper-raised p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
        {gated ? 'Future capability · not available in v0.2' : 'Not implemented'}
      </p>
      <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
      <p className="max-w-2xl text-sm text-ink-muted">{description}</p>
      <div className="flex flex-wrap gap-3 text-sm">
        <Link to="/" className="font-medium text-accent no-underline hover:underline">
          Research Overview
        </Link>
        <Link to="/claims" className="font-medium text-accent no-underline hover:underline">
          Claims Explorer
        </Link>
        <Link to="/casebook" className="font-medium text-accent no-underline hover:underline">
          Casebook
        </Link>
      </div>
    </div>
  );
}
