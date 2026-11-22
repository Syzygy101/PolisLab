import { Link } from 'react-router-dom';
import type {
  MechanismExplanation,
  PathwayEdge,
  PathwayNode,
} from '@/research/mechanismExplanations';
import {
  RELATION_TYPE_LABELS,
  type MechanismRelationType,
} from '@/research/mechanismProfiles';
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

const RELATION_CHIP_CLASS: Record<MechanismRelationType, string> = {
  taxonomy: 'label-chip',
  metadata: 'label-chip',
  citation: 'label-chip label-chip--status-data',
  // Hypotheses and competing explanations keep the dashed caution treatment:
  // they are never styled as established findings.
  hypothesised: 'label-chip label-chip--status-caution',
  competing_explanation: 'label-chip label-chip--status-caution',
};

/** Relation-type label; the type is always shown in words, never by colour alone. */
export function RelationChip({ relation }: { relation: MechanismRelationType }) {
  return (
    <span className={RELATION_CHIP_CLASS[relation]} data-relation-type={relation}>
      {RELATION_TYPE_LABELS[relation]}
    </span>
  );
}

function SourceLinks({ sources }: { sources: MechanismExplanation['sources'] }) {
  return (
    <>
      {sources.map((source) => {
        if (source.kind === 'claim') {
          return (
            <Link
              key={source.id}
              to={`/claims/${source.id}`}
              className="id-link"
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
              className="id-link"
              data-pathway-case-section={source.id}
            >
              {source.id}
            </Link>
          );
        }
        return (
          <span key={source.id} className="mono" style={{ color: 'var(--color-ink-muted)' }}>
            {source.id}
          </span>
        );
      })}
    </>
  );
}

export function MechanismPathway({ explanation }: { explanation: MechanismExplanation }) {
  return (
    <article className="pathway" data-testid={`pathway-${explanation.id}`}>
      <header className="stack--tight" style={{ display: 'grid' }}>
        <h3>{explanation.title}</h3>
        <p className="prose-block">{explanation.summary}</p>
        <p className="small-note">
          <strong style={{ color: 'var(--color-ink)' }}>Conditions: </strong>
          {explanation.conditions}
        </p>
        <p className="small-note">
          <strong style={{ color: 'var(--color-ink)' }}>Qualitative wording: </strong>
          {explanation.qualitativeWording}
        </p>
      </header>

      <div className="stack--tight" style={{ display: 'grid', gap: '0.75rem' }}>
        <p className="eyebrow">Structured pathway (not a causal graph with weights)</p>
        <ul className="pathway-nodes">
          {explanation.nodes.map((node) => (
            <li key={node.id} data-relation={node.relation} data-node-id={node.id}>
              <p className="node-label">{node.label}</p>
              <p className="node-detail">{node.detail}</p>
              {node.relation ? (
                <span className="relation-tag">{RELATION_TYPE_LABELS[node.relation]}</span>
              ) : null}
            </li>
          ))}
        </ul>
        <ul className="relation-list" data-testid={`pathway-edges-${explanation.id}`}>
          {explanation.edges.map((edge, index) => (
            <li
              key={`${edge.from}-${edge.to}-${index}`}
              data-edge-relation={edge.relation}
              data-edge-from={edge.from}
              data-edge-to={edge.to}
            >
              <p className="relation-sentence">{formatEdgeSentence(edge, explanation.nodes)}</p>
              <p className="relation-tag">
                {RELATION_TYPE_LABELS[edge.relation]}
                {edge.relation === 'hypothesised' || edge.relation === 'competing_explanation'
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
        <p className="small-note small-note--subtle">
          Compatibility, distinction, and hypothesis relations are stated in plain wording.
          Directed causal arrows are not used for generic metadata co-tagging.
        </p>
      </div>

      <div className="stack--tight" style={{ display: 'grid', gap: '0.35rem' }}>
        <p className="eyebrow">Inferential limitations</p>
        <ul className="bullets">
          {explanation.inferentialLimitations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="action-row" style={{ gap: '0.25rem 0.75rem' }}>
        <span className="eyebrow">Sources</span>
        <SourceLinks sources={explanation.sources} />
      </div>
    </article>
  );
}
