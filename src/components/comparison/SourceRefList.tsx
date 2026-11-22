import { Link } from 'react-router-dom';
import type { ComparisonSourceRef } from '@/research/comparisonSchema';
import { caseSectionAnchor } from '@/research/casebookConstants';
import { isCaseId } from '@/research/taxonomy';

export function SourceRefList({
  sources,
  testId,
}: {
  sources: readonly ComparisonSourceRef[];
  testId?: string;
}) {
  if (sources.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-wrap gap-2 text-xs" data-testid={testId}>
      <span className="text-ink-subtle">Sources:</span>
      {sources.map((source) => {
        if (source.kind === 'claim') {
          return (
            <Link
              key={`${source.kind}-${source.id}`}
              to={`/claims/${source.id}`}
              className="font-mono text-accent no-underline hover:underline"
              data-comparison-claim={source.id}
            >
              {source.id}
            </Link>
          );
        }
        if (source.caseId && isCaseId(source.caseId) && source.section) {
          return (
            <Link
              key={`${source.kind}-${source.id}`}
              to={`/casebook/${source.caseId}#${caseSectionAnchor(source.section)}`}
              className="font-mono text-accent no-underline hover:underline"
              data-comparison-case-section={source.id}
            >
              {source.id}
            </Link>
          );
        }
        return (
          <span key={source.id} className="font-mono text-ink-muted">
            {source.id}
          </span>
        );
      })}
    </div>
  );
}
