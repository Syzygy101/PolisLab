import { Link } from 'react-router-dom';
import { casebookDataset } from '@/data/casebookDataset';
import { CasebookMarkdown } from '@/components/casebook/CasebookMarkdown';
import {
  RESEARCH_CORRECTION_PASS,
  RESEARCH_CUTOFF,
  RESEARCH_RELEASE,
} from '@/research/constants';

export function CasebookSourcePage() {
  const { provenance, frontMatterMarkdown, closingParts, cases } = casebookDataset;

  return (
    <div className="space-y-6" data-testid="casebook-source-page">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
        <Link to="/casebook" className="text-accent no-underline hover:underline">
          Casebook
        </Link>
        <span className="mx-2 text-ink-subtle">/</span>
        <span className="text-ink">Source document</span>
      </nav>

      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Casebook methodology &amp; source document
        </h1>
        <p className="max-w-3xl text-sm text-ink-muted">
          Complete published front matter, cross-case comparison, and closing methodological
          sections from the authoritative Markdown casebook. Individual case bodies are also
          available as navigable investigations.
        </p>
        <p className="text-xs text-ink-subtle">
          Research {RESEARCH_RELEASE} · cutoff {RESEARCH_CUTOFF} · correction pass{' '}
          {RESEARCH_CORRECTION_PASS} · <span className="font-mono">{provenance.sourceFile}</span> ·
          SHA-256 <span className="font-mono">{provenance.sourceContentSha256}</span>
        </p>
      </header>

      <section className="space-y-3" aria-labelledby="front-matter-heading">
        <h2 id="front-matter-heading" className="font-display text-xl font-semibold text-ink">
          How to use this casebook (front matter)
        </h2>
        <CasebookMarkdown markdown={frontMatterMarkdown} />
      </section>

      <section className="space-y-2" aria-labelledby="case-links-heading">
        <h2 id="case-links-heading" className="font-display text-xl font-semibold text-ink">
          Four case investigations
        </h2>
        <ul className="space-y-1 text-sm">
          {cases.map((c) => (
            <li key={c.id}>
              <Link to={`/casebook/${c.id}`} className="text-accent">
                {c.heading}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {closingParts.map((part) => (
        <section
          key={part.id}
          id={part.id}
          className="scroll-mt-6 space-y-3 border-t border-line pt-5"
          aria-labelledby={`${part.id}-heading`}
        >
          <h2 id={`${part.id}-heading`} className="font-display text-xl font-semibold text-ink">
            {part.title}
          </h2>
          <CasebookMarkdown markdown={part.markdown.replace(/^## .+\n/, '')} />
        </section>
      ))}
    </div>
  );
}
