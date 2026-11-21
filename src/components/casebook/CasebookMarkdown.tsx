/**
 * Safe GFM Markdown renderer for casebook content.
 * Maps Markdown to React elements (no unsanitised HTML).
 * Converts ATLAS claim IDs in text leaves into claim-detail links without
 * altering surrounding non-ID text.
 */
import { Fragment, type ReactNode } from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import { isSafeHttpUrl } from '@/research/safeUrl';
import { splitTextWithClaimIds } from '@/research/casebookCitations';
import { findClaimById } from '@/data/researchDataset';

export interface CaseClaimReturnState {
  caseId: string;
  section?: number;
}

function linkifyClaimText(
  children: ReactNode,
  claimReturn?: CaseClaimReturnState,
): ReactNode {
  if (typeof children === 'string') {
    return splitTextWithClaimIds(children).map((part, index) => {
      if (part.type === 'text') {
        // Preserve plain text exactly — no wrapper when the whole leaf is text.
        return <Fragment key={index}>{part.value}</Fragment>;
      }
      const exists = Boolean(findClaimById(part.id));
      if (!exists) {
        return (
          <span
            key={index}
            className="font-mono text-[0.9em] text-caution"
            title="Unknown atlas ID"
            data-unknown-claim-id={part.id}
          >
            {part.id}
          </span>
        );
      }
      return (
        <Link
          key={index}
          to={`/claims/${part.id}`}
          state={claimReturn ? { caseReturn: claimReturn } : undefined}
          className="font-mono text-[0.9em] text-accent no-underline hover:underline"
          data-claim-id={part.id}
        >
          {part.id}
        </Link>
      );
    });
  }
  if (Array.isArray(children)) {
    return children.map((child, index) => (
      <Fragment key={index}>{linkifyClaimText(child, claimReturn)}</Fragment>
    ));
  }
  return children;
}

function createComponents(claimReturn?: CaseClaimReturnState): Components {
  const L = (children: ReactNode) => linkifyClaimText(children, claimReturn);
  return {
    a: ({ href, children }) => {
      const url = href?.trim() ?? '';
      if (!url || !isSafeHttpUrl(url)) {
        return (
          <span className="text-ink-muted" data-unsafe-href={url || undefined}>
            {children}
          </span>
        );
      }
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
    table: ({ children }) => (
      <div className="casebook-table-wrap my-3 overflow-x-auto">
        <table className="casebook-table w-full min-w-[28rem] border-collapse text-left text-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => <thead className="border-b border-line-strong">{children}</thead>,
    th: ({ children }) => (
      <th className="bg-neutral-soft px-2 py-1.5 align-top font-medium text-ink">{L(children)}</th>
    ),
    td: ({ children }) => (
      <td className="border-t border-line px-2 py-1.5 align-top text-ink">{L(children)}</td>
    ),
    h1: ({ children }) => (
      <h3 className="font-display text-lg font-semibold text-ink">{L(children)}</h3>
    ),
    h2: ({ children }) => (
      <h3 className="font-display text-base font-semibold text-ink">{L(children)}</h3>
    ),
    h3: ({ children }) => (
      <h4 className="text-sm font-semibold text-ink">{L(children)}</h4>
    ),
    ul: ({ children }) => <ul className="list-disc space-y-1 pl-5 text-sm text-ink">{children}</ul>,
    ol: ({ children }) => (
      <ol className="list-decimal space-y-1 pl-5 text-sm text-ink">{children}</ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{L(children)}</li>,
    p: ({ children }) => <p className="text-sm leading-relaxed text-ink">{L(children)}</p>,
    strong: ({ children }) => <strong className="font-semibold">{L(children)}</strong>,
    em: ({ children }) => <em>{L(children)}</em>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-accent/40 pl-3 text-sm text-ink-muted">
        {L(children)}
      </blockquote>
    ),
    hr: () => <hr className="my-4 border-line" />,
    code: ({ children }) => (
      <code className="rounded bg-neutral-soft px-1 font-mono text-[0.85em]">{children}</code>
    ),
  };
}

export function CasebookMarkdown({
  markdown,
  className,
  claimReturn,
}: {
  markdown: string;
  className?: string;
  claimReturn?: CaseClaimReturnState;
}) {
  if (!markdown.trim()) {
    return null;
  }
  return (
    <div className={['casebook-prose space-y-3', className].filter(Boolean).join(' ')}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={createComponents(claimReturn)}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
