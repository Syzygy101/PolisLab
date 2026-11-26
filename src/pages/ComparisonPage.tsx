import { useLayoutEffect, useMemo, useRef } from 'react';
import { FIELD_GUIDE } from '@/components/field-guide/content';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
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
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const QUICK_LINK_CLASS =
  'border border-line px-2 py-1 text-ink-muted no-underline hover:border-accent hover:text-accent';

export function ComparisonPage() {
  useDocumentTitle('Policy Comparison Laboratory');

  const location = useLocation();
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
  const hasSelection = Boolean(urlState.slotA.variantId || urlState.slotB.variantId);

  const pendingSelection = useRef<Record<'a' | 'b', string | null> | null>(null);
  useLayoutEffect(() => {
    // Committed navigation, including Back and Forward, restores the URL as the source of truth.
    pendingSelection.current = null;
  }, [location.key]);

  function setSlot(param: 'a' | 'b', variantId: string) {
    // Consecutive changes can arrive before React Router renders the next URL.
    const current = pendingSelection.current ?? {
      a: urlState.slotA.variantId,
      b: urlState.slotB.variantId,
    };
    const next = { ...current, [param]: variantId || null };
    pendingSelection.current = next;
    setSearchParams(serializeComparisonSearchParams(next), { replace: false });
  }

  const aName = comparison.a?.variant.label;
  const bName = comparison.b?.variant.label;

  return (
    <div className="research-module" data-testid="comparison-page">
      <header className="research-module-header">
        <h1 className="page-title">
          Policy Comparison Laboratory
        </h1>
        <p className="lede">
          Compare published policy proposals and dated baselines side by side. Explore where
          each approach could help, fail or make little difference. The assessment is qualitative.
        </p>
        <p><Link to="/claims/compare" className="underline underline-offset-2">Compare two evidence claims</Link></p>
        <details className="guide-disclosure">
          <summary>Comparison method and source version</summary>
          <p>The comparison aligns pathways and outcomes by section. The laboratory provides no
            rankings, composite scores, probabilities or effect sizes.</p>
          <p className="meta-line">
            Dataset {COMPARISON_DATASET.provenance.datasetVersion} · casebook SHA{' '}
            <span className="font-mono">{COMPARISON_DATASET.provenance.sourceContentSha256.slice(0, 12)}…</span>
            {integrity.ok ? ' · integrity OK' : ` · integrity issues: ${integrity.issues.length}`}
            {' · '}<span className="font-mono">policyWinnerDeclared={String(comparison.policyWinnerDeclared)}</span>
          </p>
        </details>
      </header>

      <div className="compare-sticky" data-testid="comparison-selector">
        <div className="compare-selectors">
          {(['a', 'b'] as const).map((param) => {
            const slot = param === 'a' ? urlState.slotA : urlState.slotB;
            return (
              <label key={param} className="block">
                <span className="meta-line text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Policy {param.toUpperCase()}
                </span>
                <select
                  className="control-select"
                  value={slot.variantId ?? ''}
                  onChange={(event) => setSlot(param, event.target.value)}
                  data-testid={`comparison-select-${param}`}
                  aria-label={`Variant ${param.toUpperCase()}`}
                >
                  <option value="">— empty —</option>
                  {CASE_IDS.map((caseId) => (
                    <optgroup key={caseId} label={FIELD_GUIDE[caseId].topic}>
                      {listVariants(caseId).map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
            );
          })}
        </div>
        {hasSelection ? (
          <p
            className="meta-line mt-2 text-xs text-ink-muted"
            data-testid="compare-sticky-names"
          >
            <strong>{aName ?? bName}</strong>
            {aName && bName ? (
              <>
                {' '}
                vs <strong>{bName}</strong>
              </>
            ) : null}
          </p>
        ) : null}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-ink-subtle">Examples:</span>
        <Link to={comparisonHref({ a: 'C1-VAR-R', b: 'C1-VAR-E' })} className={QUICK_LINK_CLASS}>
          Site access proposals
        </Link>
        <Link
          to={comparisonHref({ a: 'C2-VAR-CF-A', b: 'C2-VAR-CF-C' })}
          className={QUICK_LINK_CLASS}
        >
          Foreign investment proposals
        </Link>
        <Link
          to={comparisonHref({ a: 'C4-VAR-B0', b: 'C4-VAR-CF-STRONGER' })}
          className={QUICK_LINK_CLASS}
        >
          Acquisition oversight proposals
        </Link>
        <Link
          to={comparisonHref({ a: 'C3-VAR-SITE-FDI', b: 'C3-VAR-FDI-ONLY' })}
          className={QUICK_LINK_CLASS}
        >
          Entry and scale comparisons
        </Link>
        <Link to="/comparison" className={QUICK_LINK_CLASS}>
          Clear selection
        </Link>
      </div>

      {urlState.notices.length > 0 ? (
        <ul className="notice mb-4 space-y-1" data-testid="comparison-url-notices">
          {urlState.notices.map((n) => (
            <li key={`${n.code}-${n.param ?? ''}-${n.rawId ?? ''}`}>{n.message}</li>
          ))}
        </ul>
      ) : null}

      {hasSelection ? (
        <VariantComparePanel comparison={comparison} />
      ) : (
        <p className="notice" data-testid="comparison-empty-prompt">
          Select two policies above, or open a direct comparison URL such as{' '}
          <Link className="mono" to={comparisonHref({ a: 'C1-VAR-R', b: 'C1-VAR-E' })}>
            R/E (Case 1)
          </Link>
          . Shareable URLs use <span className="font-mono">a</span> and{' '}
          <span className="font-mono">b</span> variant IDs; refresh and Back/Forward restore the
          selection.
        </p>
      )}

      <div className="mt-8">
        <OrientationTable defaultOpen={!hasSelection} />
      </div>
    </div>
  );
}
