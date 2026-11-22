/**
 * Safe GFM Markdown renderer for casebook content.
 * Maps Markdown to React elements (no unsanitised HTML).
 * Converts ATLAS claim IDs and published mechanism tags in text leaves into
 * navigable links without altering surrounding non-ID text.
 */
import { Fragment, type ReactNode } from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import { isSafeHttpUrl } from '@/research/safeUrl';
import { splitTextWithClaimsAndMechanisms } from '@/research/mechanismCitations';
import { findClaimById } from '@/data/researchDataset';
import { mechanismProfileHref } from '@/research/taxonomy';

export interface CaseClaimReturnState {
  caseId: string;
  section?: number;
}

function linkifyClaimText(
  children: ReactNode,
  claimReturn?: CaseClaimReturnState,
): ReactNode {
  if (typeof children === 'string') {
    return splitTextWithClaimsAndMechanisms(children).map((part, index) => {
      if (part.type === 'text') {
        return <Fragment key={index}>{part.value}</Fragment>;
      }
      if (part.type === 'claim') {
        const exists = Boolean(findClaimById(part.id));
        if (!exists) {
          return (
            <span
              key={index}
              className="is-unknown-id"
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
            className="claim-link"
            data-claim-id={part.id}
          >
            {part.id}
          </Link>
        );
      }
      if (part.type === 'claim_range') {
        // Preserve published range wording while exposing every expanded target.
        return (
          <span
            key={index}
            className="claim-range"
            data-claim-range={part.display}
          >
            <span>{part.display}</span>
            <span className="claim-range-sep"> [</span>
            {part.ids.map((id, idIndex) => {
              const exists = Boolean(findClaimById(id));
              const sep =
                idIndex < part.ids.length - 1 ? (
                  <span className="claim-range-sep">, </span>
                ) : null;
              if (!exists) {
                return (
                  <Fragment key={id}>
                    <span className="is-unknown-id" data-unknown-claim-id={id}>
                      {id}
                    </span>
                    {sep}
                  </Fragment>
                );
              }
              return (
                <Fragment key={id}>
                  <Link
                    to={`/claims/${id}`}
                    state={claimReturn ? { caseReturn: claimReturn } : undefined}
                    className="claim-link"
                    data-claim-id={id}
                    data-claim-range-target={part.display}
                  >
                    {id}
                  </Link>
                  {sep}
                </Fragment>
              );
            })}
            <span className="claim-range-end">]</span>
          </span>
        );
      }
      if (part.type === 'contextual') {
        return (
          <Link
            key={index}
            to={part.href}
            className="contextual-id"
            title="Contextual subdivision — not an atlas tag"
            data-contextual-mechanism={part.id}
          >
            {part.id}
          </Link>
        );
      }
      return (
        <Link
          key={index}
          to={mechanismProfileHref(part.id)}
          className="claim-link"
          data-mechanism-id={part.id}
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

/** Monotonic across all casebook Markdown mounts so scrollable table regions stay unique. */
let casebookTableRegionSerial = 0;

function createComponents(claimReturn?: CaseClaimReturnState): Components {
  const L = (children: ReactNode) => linkifyClaimText(children, claimReturn);
  return {
    a: ({ href, children }) => {
      const url = href?.trim() ?? '';
      if (!url || !isSafeHttpUrl(url)) {
        return (
          <span data-unsafe-href={url || undefined}>
            {children}
          </span>
        );
      }
      return (
        <a className="link-external" href={url} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
    table: ({ children }) => {
      casebookTableRegionSerial += 1;
      const tableNumber = casebookTableRegionSerial;
      return (
        <div
          className="case-table-wrap"
          tabIndex={0}
          role="region"
          aria-label={`Casebook table ${tableNumber} (scrolls horizontally)`}
        >
          <table className="casebook-table">{children}</table>
        </div>
      );
    },
    th: ({ children }) => <th>{L(children)}</th>,
    td: ({ children }) => <td>{L(children)}</td>,
    // Published headings sit beneath the section <h2>, so they step down one level.
    h1: ({ children }) => <h3>{L(children)}</h3>,
    h2: ({ children }) => <h3>{L(children)}</h3>,
    h3: ({ children }) => <h4>{L(children)}</h4>,
    li: ({ children }) => <li>{L(children)}</li>,
    p: ({ children }) => <p>{L(children)}</p>,
    strong: ({ children }) => <strong>{L(children)}</strong>,
    em: ({ children }) => <em>{L(children)}</em>,
    blockquote: ({ children }) => <blockquote>{L(children)}</blockquote>,
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
    <div className={['case-md', className].filter(Boolean).join(' ')}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={createComponents(claimReturn)}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
