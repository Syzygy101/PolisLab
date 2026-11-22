import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { OrientationTable } from '@/components/comparison/OrientationTable';
import { VariantComparePanel } from '@/components/comparison/VariantComparePanel';
import { COMPARISON_DATASET } from '@/research/comparisonDataset';
import {
  compareVariants,
  listVariants,
  validateComparisonDataset,
} from '@/research/comparisonQueries';
import {
  comparisonHref,
  parseComparisonState,
  serializeComparisonSearchParams,
} from '@/research/comparisonUrl';
import { allClaims } from '@/data/researchDataset';
import { CASE_IDS } from '@/research/taxonomy';

export function ComparisonPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlState = useMemo(
    () => parseComparisonState(searchParams),
    [searchParams],
  );
  const comparison = useMemo(
    () =>
      compareVariants(urlState.slotA.variantId, urlState.slotB.variantId),
    [urlState.slotA.variantId, urlState.slotB.variantId],
  );
  const integrity = useMemo(
    () => validateComparisonDataset(COMPARISON_DATASET, allClaims),
    [],
  );

  function setSlot(param: 'a' | 'b', variantId: string) {
    const next = {
      a: param === 'a' ? variantId || null : urlState.slotA.variantId,
      b: param === 'b' ? variantId || null : urlState.slotB.variantId,
    };
    setSearchParams(serializeComparisonSearchParams(next), { replace: false });
  }

  return (
    <div className="space-y-10" data-testid="comparison-page">
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-semibold text-ink">
          Policy Comparison Laboratory
        </h1>
        <p className="max-w-3xl text-sm text-ink-muted">
          Qualitative workspace for comparing published baselines, intervention variants,
          pathways, and outcome assessments across the four casebook investigations. This is
          distinct from two-claim evidence comparison at{' '}
          <Link to="/claims/compare" className="text-accent no-underline hover:underline">
            /claims/compare
          </Link>
          . No policy rankings, composite scores, fabricated probabilities, or effect sizes.
        </p>
        <p className="text-xs text-ink-subtle">
          Dataset {COMPARISON_DATASET.provenance.datasetVersion} · casebook SHA{' '}
          <span className="font-mono">
            {COMPARISON_DATASET.provenance.sourceContentSha256.slice(0, 12)}…
          </span>
          {integrity.ok ? ' · integrity OK' : ` · integrity issues: ${integrity.issues.length}`}
        </p>
      </header>

      <OrientationTable />

      <section className="space-y-4" data-testid="comparison-selector">
        <h2 className="font-display text-xl font-semibold text-ink">
          Select two variants
        </h2>
        <p className="max-w-3xl text-sm text-ink-muted">
          Shareable URL uses <span className="font-mono">a</span> and{' '}
          <span className="font-mono">b</span> variant IDs. Invalid IDs are ignored; identical IDs
          keep both slots with a distinct-variants notice. Refresh and Back/Forward restore the
          selection.
        </p>

        {urlState.notices.length > 0 ? (
          <ul
            className="space-y-1 border border-line bg-neutral-soft px-3 py-2 text-xs text-warn"
            data-testid="comparison-url-notices"
          >
            {urlState.notices.map((n) => (
              <li key={`${n.code}-${n.param ?? ''}-${n.rawId ?? ''}`}>{n.message}</li>
            ))}
          </ul>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {(['a', 'b'] as const).map((param) => {
            const slot = param === 'a' ? urlState.slotA : urlState.slotB;
            return (
              <label key={param} className="block text-sm">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Variant {param.toUpperCase()}
                </span>
                <select
                  className="mt-1 w-full border border-line bg-paper px-2 py-2 text-sm text-ink"
                  value={slot.variantId ?? ''}
                  onChange={(event) => setSlot(param, event.target.value)}
                  data-testid={`comparison-select-${param}`}
                  aria-label={`Variant ${param.toUpperCase()}`}
                >
                  <option value="">— empty —</option>
                  {CASE_IDS.map((caseId) => (
                    <optgroup key={caseId} label={caseId}>
                      {listVariants(caseId).map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.shortCode} — {v.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <Link
            to={comparisonHref({ a: 'C1-VAR-R', b: 'C1-VAR-E' })}
            className="border border-line px-2 py-1 text-ink-muted no-underline hover:border-accent hover:text-accent"
          >
            Case1 R vs E
          </Link>
          <Link
            to={comparisonHref({ a: 'C2-VAR-CF-A', b: 'C2-VAR-CF-C' })}
            className="border border-line px-2 py-1 text-ink-muted no-underline hover:border-accent hover:text-accent"
          >
            Case2 CF-A vs CF-C
          </Link>
          <Link
            to={comparisonHref({ a: 'C4-VAR-B0', b: 'C4-VAR-CF-STRONGER' })}
            className="border border-line px-2 py-1 text-ink-muted no-underline hover:border-accent hover:text-accent"
          >
            Case4 B0 vs CF-stronger
          </Link>
          <Link
            to="/comparison"
            className="border border-line px-2 py-1 text-ink-muted no-underline hover:border-accent hover:text-accent"
          >
            Clear selection
          </Link>
        </div>
      </section>

      <VariantComparePanel comparison={comparison} />
    </div>
  );
}
