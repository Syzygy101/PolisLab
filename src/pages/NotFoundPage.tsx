import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Page not found');

  return (
    <div className="space-y-4 border border-line bg-paper-raised p-6" role="alert">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
        Invalid route
      </p>
      <h1 className="font-display text-2xl font-semibold text-ink">Page not found</h1>
      <p className="max-w-2xl text-sm text-ink-muted">
        That URL is not a research module in this application. Check the path, or return to a
        published investigation surface.
      </p>
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
