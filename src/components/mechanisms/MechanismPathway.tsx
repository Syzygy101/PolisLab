import { Link } from 'react-router-dom';
import type {
  MechanismExplanation,
  PathwayEdge,
  PathwayNode,
} from '@/research/mechanismExplanations';
import { RELATION_TYPE_LABELS } from '@/research/mechanismProfiles';
import { caseSectionAnchor } from '@/research/casebookConstants';
import { isCaseId } from '@/research/taxonomy';

function nodeById(
  nodes: readonly PathwayNode[],
  id: string,
): PathwayNode | undefined {
  return nodes.find((node) => node.id === id);
}

function formatEdgeSentence(
  edge: PathwayEdge,
  nodes: readonly PathwayNode[],
): string {
  const from = nodeById(nodes, edge.from);
  const to = nodeById(nodes, edge.to);
  const fromLabel = from?.label ?? edge.from;
  const toLabel = to?.label ?? edge.to;

  switch (edge.relation) {
    case 'competing_explanation':
      if (/distinct/i.test(edge.label)) {
        return `${fromLabel} is distinct from ${toLabel}.`;
      }
      if (/compatible/i.test(edge.label)) {
        return `${fromLabel} is compatible with ${toLabel}.`;
      }
      if (/does not imply/i.test(edge.label)) {
        return `${fromLabel} does not imply ${toLabel}.`;
      }
      if (/clearance/i.test(edge.label)) {
        return `${fromLabel}: ${edge.label} — ${toLabel}.`;
      }
      return `${fromLabel} — ${edge.label} — ${toLabel}.`;
    case 'hypothesised':
      if (/possible explanation/i.test(edge.label)) {
        return `${toLabel} is a ${edge.label} (${fromLabel}).`;
      }
      if (/does not establish/i.test(edge.label)) {
        return `${fromLabel} does not establish ${toLabel}.`;
      }
      if (/may trigger/i.test(edge.label)) {
        return `${fromLabel} may trigger ${toLabel}.`;
      }
      return `${fromLabel}: ${edge.label} → ${toLabel}.`;
    case 'citation':
      if (/observed sequence/i.test(edge.label)) {
        return `${fromLabel} precedes ${toLabel} in the observed sequence (citation, not identification).`;
      }
      if (/may accompany/i.test(edge.label)) {
        return `${fromLabel} may accompany ${toLabel} (source-cited association).`;
      }
      return `${fromLabel} ${edge.label} ${toLabel} (published citation).`;
    case 'taxonomy':
      return `${fromLabel} relates to ${toLabel} by taxonomy membership (${edge.label}).`;
    case 'metadata':
      return `${fromLabel} and ${toLabel} share metadata association (${edge.label}) — not causal identification.`;
    default:
      return `${fromLabel} — ${edge.label} — ${toLabel}.`;
  }
}

export function MechanismPathway({ explanation }: { explanation: MechanismExplanation }) {
  return (
    <article
      className="space-y-4 border border-line bg-paper-raised p-4"
      data-testid={`pathway-${explanation.id}`}
    >
      <header className="space-y-2">
        <h3 className="font-display text-lg font-semibold text-ink">{explanation.title}</h3>
        <p className="text-sm leading-relaxed text-ink">{explanation.summary}</p>
        <p className="text-xs text-ink-muted">
          <span className="font-medium text-ink">Conditions: </span>
          {explanation.conditions}
        </p>
        <p className="text-xs text-ink-muted">
          <span className="font-medium text-ink">Qualitative wording: </span>
          {explanation.qualitativeWording}
        </p>
      </header>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
          Structured pathway (not a causal graph with weights)
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {explanation.nodes.map((node) => (
            <li
              key={node.id}
              className="border border-line bg-paper px-3 py-2 text-sm"
              data-relation={node.relation}
              data-node-id={node.id}
            >
              <p className="font-medium text-ink">{node.label}</p>
              <p className="text-xs text-ink-muted">{node.detail}</p>
              {node.relation ? (
                <p className="mt-1 text-[10px] uppercase tracking-wide text-ink-subtle">
                  {RELATION_TYPE_LABELS[node.relation]}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
        <ul
          className="space-y-2 text-sm text-ink"
          data-testid={`pathway-edges-${explanation.id}`}
        >
          {explanation.edges.map((edge, index) => (
            <li
              key={`${edge.from}-${edge.to}-${index}`}
              data-edge-relation={edge.relation}
              data-edge-from={edge.from}
              data-edge-to={edge.to}
            >
              <p>{formatEdgeSentence(edge, explanation.nodes)}</p>
              <p className="text-[10px] uppercase tracking-wide text-ink-subtle">
                {RELATION_TYPE_LABELS[edge.relation]}
                {edge.relation === 'hypothesised' ||
                edge.relation === 'competing_explanation'
                  ? ' · evidence limit: not established as a general causal fact'
                  : edge.relation === 'metadata'
                    ? ' · evidence limit: co-tagging only'
                    : edge.relation === 'citation'
                      ? ' · evidence limit: source association as published'
                      : ''}
              </p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-ink-subtle">
          Compatibility, distinction, and hypothesis relations are stated in plain wording.
          Directed causal arrows are not used for generic metadata co-tagging.
        </p>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-ink">Inferential limitations</p>
        <ul className="list-disc space-y-1 pl-5 text-xs text-ink-muted">
          {explanation.inferentialLimitations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="text-ink-subtle">Sources:</span>
        {explanation.sources.map((source) => {
          if (source.kind === 'claim') {
            return (
              <Link
                key={source.id}
                to={`/claims/${source.id}`}
                className="font-mono text-accent no-underline hover:underline"
                data-pathway-claim={source.id}
              >
                {source.id}
              </Link>
            );
          }
          if (source.caseId && isCaseId(source.caseId) && source.section) {
            return (
              <Link
                key={source.id}
                to={`/casebook/${source.caseId}#${caseSectionAnchor(source.section)}`}
                className="font-mono text-accent no-underline hover:underline"
                data-pathway-case-section={source.id}
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
    </article>
  );
}
