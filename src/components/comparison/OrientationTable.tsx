import { Link } from 'react-router-dom';
import { COMPARISON_DATASET } from '@/research/comparisonDataset';
import { CASE_IDS, getResearchCase } from '@/research/taxonomy';
import { listVariants } from '@/research/comparisonQueries';
import { comparisonHref } from '@/research/comparisonUrl';
import { SourceRefList } from './SourceRefList';

/**
 * Secondary orientation section. Rendered as a `<details>` so that direct
 * selected-comparison URLs reach the selectors and compared sections first.
 */
export function OrientationTable({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const orientations = CASE_IDS.map(
    (caseId) => COMPARISON_DATASET.orientations.find((o) => o.caseId === caseId)!,
  );

  return (
    <details
      className="space-y-4 border-t border-line pt-4"
      data-testid="comparison-orientation"
      open={defaultOpen}
    >
      <summary className="cursor-pointer font-display text-lg font-semibold text-ink">
        Four-case orientation{defaultOpen ? '' : ' (secondary)'}
      </summary>
      <div className="mt-3 space-y-2">
        <p className="max-w-3xl text-sm text-ink-muted">
          Published cross-case comparison table. Orientation only — not a ranking, scorecard, or
          policy winner. Every case declares <span className="font-medium">no policy winner</span>.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
          <thead>
            <tr>
              <th className="border border-line bg-neutral-soft px-2 py-2">Dimension</th>
              {orientations.map((o) => (
                <th key={o.caseId} className="border border-line bg-neutral-soft px-2 py-2">
                  <Link
                    to={`/casebook/${o.caseId}`}
                    className="text-accent no-underline hover:underline"
                  >
                    {o.caseId}
                  </Link>
                  <span className="mt-1 block text-xs font-normal text-ink-muted">
                    {getResearchCase(o.caseId).title}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(
              [
                ['Core question', 'coreQuestion'],
                ['Baseline hinge', 'baselineHinge'],
                ['Lead mechanisms', 'leadMechanisms'],
                ['Best-supported finding', 'bestSupportedFinding'],
                ['Sign-reversal risks', 'signReversalRisks'],
                ['Assessable now', 'assessableNow'],
                ['Not inferable', 'notInferable'],
              ] as const
            ).map(([label, key]) => (
              <tr key={key}>
                <th className="border border-line bg-paper-raised px-2 py-2 align-top text-xs font-medium text-ink-muted">
                  {label}
                </th>
                {orientations.map((o) => {
                  const value = o[key];
                  const text = Array.isArray(value) ? value.join('; ') : value;
                  return (
                    <td
                      key={o.caseId}
                      className="border border-line px-2 py-2 align-top text-ink"
                    >
                      {text}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <th className="border border-line bg-paper-raised px-2 py-2 align-top text-xs font-medium text-ink-muted">
                Policy winner?
              </th>
              {orientations.map((o) => (
                <td key={o.caseId} className="border border-line px-2 py-2 align-top text-ink">
                  {o.policyWinnerDeclared ? 'Declared' : 'None declared'}
                </td>
              ))}
            </tr>
            <tr>
              <th className="border border-line bg-paper-raised px-2 py-2 align-top text-xs font-medium text-ink-muted">
                Compare variants
              </th>
              {CASE_IDS.map((caseId) => {
                const variants = listVariants(caseId);
                const first = variants[0];
                const second = variants[1];
                return (
                  <td key={caseId} className="border border-line px-2 py-2 align-top">
                    <ul className="space-y-1 text-xs">
                      {variants.map((v) => (
                        <li key={v.id}>
                          <span className="font-mono text-ink">{v.shortCode}</span>
                          <span className="text-ink-muted"> — {v.label}</span>
                        </li>
                      ))}
                    </ul>
                    {first && second ? (
                      <Link
                        to={comparisonHref({ a: first.id, b: second.id })}
                        className="mt-2 inline-flex text-xs text-accent no-underline hover:underline"
                        data-testid={`orientation-compare-${caseId}`}
                      >
                        Open {first.shortCode} vs {second.shortCode}
                      </Link>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        {orientations.map((o) => (
          <SourceRefList key={o.caseId} sources={o.sources} />
        ))}
      </div>
    </details>
  );
}
