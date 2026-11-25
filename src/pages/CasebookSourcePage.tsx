import { Link } from 'react-router-dom';
import { casebookDataset } from '@/data/casebookDataset';
import { CasebookMarkdown } from '@/components/casebook/CasebookMarkdown';
import {
  RESEARCH_CORRECTION_PASS,
  RESEARCH_CUTOFF,
  RESEARCH_RELEASE,
} from '@/research/constants';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function CasebookSourcePage() {
  useDocumentTitle('Methodology and source');

  const { provenance, frontMatterMarkdown, closingParts, cases } = casebookDataset;

  return (
    <div data-testid="casebook-source-page">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link to="/casebook">Investigations</Link>
        <span aria-hidden="true">/</span>
        <span>Source document</span>
      </nav>

      <header>
        <p className="page-kicker">Research · Source document</p>
        <h1 className="page-title">Casebook methodology &amp; source document</h1>
        <p className="lede">
          Complete published front matter, cross-case comparison, and closing methodological
          sections from the authoritative Markdown casebook. Individual case bodies are also
          available as navigable investigations.
        </p>
        <p className="meta-line" style={{ marginBottom: '1.5rem', overflowWrap: 'anywhere' }}>
          Research {RESEARCH_RELEASE} · cutoff {RESEARCH_CUTOFF} · correction pass{' '}
          {RESEARCH_CORRECTION_PASS} · <span className="mono">{provenance.sourceFile}</span> ·
          SHA-256 <span className="mono">{provenance.sourceContentSha256}</span>
        </p>
      </header>

      <div className="case-layout">
        <nav className="section-rail" aria-label="Source document sections">
          <p className="section-rail-label">On this page</p>
          <ol>
            <li>
              <a href="#front-matter">How to use this casebook</a>
            </li>
            <li>
              <a href="#case-links">Case investigations</a>
            </li>
            {closingParts.map((part) => (
              <li key={part.id}>
                <a href={`#${part.id}`}>{part.title}</a>
              </li>
            ))}
            <li>
              <a href="#licensing">Licensing</a>
            </li>
          </ol>
        </nav>

        <div>
          <section
            id="front-matter"
            className="case-section"
            aria-labelledby="front-matter-heading"
          >
            <div className="case-section-head">
              <h2 id="front-matter-heading">How to use this casebook (front matter)</h2>
            </div>
            <div className="case-prose case-prose--wide">
              <CasebookMarkdown markdown={frontMatterMarkdown} />
            </div>
          </section>

          <section id="case-links" className="case-section" aria-labelledby="case-links-heading">
            <div className="case-section-head">
              <h2 id="case-links-heading">Four case investigations</h2>
            </div>
            <ul className="link-rows case-prose">
              {cases.map((c) => (
                <li key={c.id}>
                  <Link to={`/casebook/${c.id}`}>{c.heading}</Link>
                </li>
              ))}
            </ul>
          </section>

          {closingParts.map((part) => (
            <section
              key={part.id}
              id={part.id}
              className="case-section"
              aria-labelledby={`${part.id}-heading`}
            >
              <div className="case-section-head">
                <h2 id={`${part.id}-heading`}>{part.title}</h2>
              </div>
              <div className="case-prose case-prose--wide">
                <CasebookMarkdown markdown={part.markdown.replace(/^## .+\n/, '')} />
              </div>
            </section>
          ))}

          <section
            id="licensing"
            className="case-section"
            aria-labelledby="licensing-heading"
          >
            <div className="case-section-head">
              <h2 id="licensing-heading">Licensing</h2>
            </div>
            <div className="case-prose case-prose--wide">
              <p>
                Research text in this document and the claims atlas is licensed{' '}
                <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
                  CC BY 4.0
                </a>{' '}
                (repository file <span className="mono">LICENSE</span>). The PolisLab application
                software is licensed under Apache 2.0 (repository file{' '}
                <span className="mono">LICENSE-SOFTWARE</span>). See also repository{' '}
                <span className="mono">NOTICE</span> and <span className="mono">CONTRIBUTING.md</span>
                .
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
