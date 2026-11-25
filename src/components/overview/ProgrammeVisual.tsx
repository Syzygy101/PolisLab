/** Original explanatory visual — programme structure, not a causal identification diagram. */

interface ProgrammeVisualProps {
  /** Published atlas claim count (derived from the dataset by the caller). */
  claimCount: number;
  /** Published research-requirement entry count (derived from the gaps registry). */
  requirementCount: number;
}

export function ProgrammeVisual({ claimCount, requirementCount }: ProgrammeVisualProps) {
  return (
    <figure className="programme-visual" data-testid="programme-visual">
      <svg viewBox="0 0 560 220" role="img" aria-labelledby="pv-title pv-desc">
        <title id="pv-title">Research programme structure</title>
        <desc id="pv-desc">
          Institutional baselines and published claims feed four policy investigations.
          Qualitative comparison of interventions sits beside documented research gaps.
          Arrows show analytical workflow, not estimated causal effects.
        </desc>
        <rect x="8" y="24" width="150" height="72" fill="#ffffff" stroke="#205449" strokeWidth="1.5" />
        <text x="20" y="52" fontFamily="Source Sans 3, sans-serif" fontSize="13" fill="#192622" fontWeight="600">
          Institutional baselines
        </text>
        <text x="20" y="72" fontFamily="Source Sans 3, sans-serif" fontSize="12" fill="#59675F">
          Dated legal / admin facts
        </text>

        <rect x="8" y="124" width="150" height="72" fill="#ffffff" stroke="#426F88" strokeWidth="1.5" />
        <text x="20" y="152" fontFamily="Source Sans 3, sans-serif" fontSize="13" fill="#192622" fontWeight="600">
          Evidence atlas
        </text>
        <text x="20" y="172" fontFamily="Source Sans 3, sans-serif" fontSize="12" fill="#59675F">
          {claimCount} claims · qualifications
        </text>

        <path d="M158 60 H198" stroke="#D4DAD2" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <path d="M158 160 H198" stroke="#D4DAD2" strokeWidth="1.5" markerEnd="url(#arrow)" />

        <rect x="200" y="40" width="180" height="140" fill="#E6EFEC" stroke="#205449" strokeWidth="1.5" />
        <text x="214" y="68" fontFamily="Source Serif 4, serif" fontSize="15" fill="#192622" fontWeight="700">
          Four investigations
        </text>
        <text x="214" y="92" fontFamily="Source Sans 3, sans-serif" fontSize="12" fill="#59675F">
          Sites · FDI · Entry · Mergers
        </text>
        <text x="214" y="118" fontFamily="Source Sans 3, sans-serif" fontSize="12" fill="#192622">
          Research questions
        </text>
        <text x="214" y="138" fontFamily="Source Sans 3, sans-serif" fontSize="12" fill="#192622">
          Mechanisms &amp; pathways
        </text>
        <text x="214" y="158" fontFamily="Source Sans 3, sans-serif" fontSize="12" fill="#59675F">
          Limits on inference retained
        </text>

        <path d="M380 80 H418" stroke="#D4DAD2" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <path d="M380 140 H418" stroke="#D4DAD2" strokeWidth="1.5" markerEnd="url(#arrow)" />

        <rect x="420" y="24" width="132" height="72" fill="#ffffff" stroke="#88632E" strokeWidth="1.5" />
        <text x="432" y="52" fontFamily="Source Sans 3, sans-serif" fontSize="13" fill="#192622" fontWeight="600">
          Policy comparison
        </text>
        <text x="432" y="72" fontFamily="Source Sans 3, sans-serif" fontSize="12" fill="#59675F">
          Qualitative only
        </text>

        <rect x="420" y="124" width="132" height="72" fill="#ffffff" stroke="#D4DAD2" strokeWidth="1.5" />
        <text x="432" y="152" fontFamily="Source Sans 3, sans-serif" fontSize="13" fill="#192622" fontWeight="600">
          Research gaps
        </text>
        <text x="432" y="172" fontFamily="Source Sans 3, sans-serif" fontSize="12" fill="#59675F">
          {requirementCount} requirements
        </text>

        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="none" stroke="#59675F" strokeWidth="1" />
          </marker>
        </defs>
      </svg>
      <figcaption>
        Analytical workflow for the grocery competition programme. Connecting lines indicate
        how published materials are organised for investigation — they do not represent
        estimated causal effects or identification strategies.
      </figcaption>
    </figure>
  );
}
