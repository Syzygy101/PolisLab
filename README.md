# PolisLab — Evidence-Based Australian Grocery Competition Policy Assessment

An open, source-controlled framework for examining competing institutional and economic mechanisms affecting grocery-market entry and competition.

## Research Release v0.1.1

**Evidence foundation cutoff:** 20 November 2026 (institutional/legal).  
**Correction pass:** 21 November 2026.

### Release contents

1. [Policy Claims Atlas](research/10_policy_claims_atlas.csv) — 43 claims with evidence provenance and limitations.
2. [Policy Assessment Casebook](research/10_policy_assessment_casebook.md) — four worked assessments covering undeveloped sites, foreign greenfield investment, differentiated entry, and supermarket acquisition oversight.

### Method

- Legal and institutional baseline.
- Evidence-backed mechanism mapping.
- Competing explanations and possible sign reversals.
- Explicit identification of what cannot be inferred.

### Interpretation

- This is a dated policy synthesis, not legal advice.
- It does not claim original causal identification or a calibrated economic simulation.
- It does not establish that any proposed policy improves Australian consumer welfare.
- Historical or administrative claims are valid only for their stated source dates.

### Known limitations

- No Australian local diversion-ratio or welfare estimates.
- No established causal effects of land-release reforms or Part 3 notification.
- No demonstrated nationwide exclusionary land-banking finding.
- The final Kalgoorlie Tribunal merits outcome was not verified for this release.
- Some primary records and future outcomes remain inaccessible or unobserved.
- One atlas row (`ATLAS-HYP-003`) is internal thesis framing without a public primary URL.

## Licence

Original PolisLab research text and structured claims in this repository are licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). See [LICENSE](LICENSE).

Third-party materials cited or linked here are **not** relicensed. External primary sources remain under their own copyright terms; this release links to them rather than redistributing copyrighted source files.

---

## Application (v0.2 Build 01)

Interactive research laboratory shell with a functional **Claims Explorer** over the authentic v0.1.1 atlas. Other product modules are navigation stubs only.

**Software licensing:** the research artefacts remain under CC BY 4.0 as above. A separate licence decision is still required for the application/software layer; this build does not choose one.

### Requirements

- Node.js `^22.12.0 || >=24` (tested on Node 22.23.1 / npm 10.9.8; matches Vitest 5 / Vite 8 toolchain)
- npm (lockfile committed)

### Commands

```bash
npm install
npx playwright install chromium   # once, for end-to-end tests
npm run ingest                    # regenerate src/data/claims.generated.json from the CSV
npm run validate                  # fail nonzero on atlas integrity violations
npm run dev                       # http://127.0.0.1:5173
npm run typecheck
npm run test                      # Vitest unit / component tests
npm run test:e2e                  # Playwright smoke
npm run build
```

The published CSV at `research/10_policy_claims_atlas.csv` remains the source of truth. Generated JSON is a reproducible consumer artefact and must not be edited by hand.

`npm run validate` re-ingests the CSV **and** fails if `src/data/claims.generated.json` is missing or drifts from the atlas (stale or hand-edited generated data cannot silently pass).

### Claims Explorer filter semantics

- Free-text search is case-insensitive; whitespace-only search is ignored.
- Status filters match the exact published status vocabulary.
- Mechanism / outcome / case controls are **exact-tag** filters over parsed identifiers. Selecting `M1` matches records tagged `M1` only; it does **not** expand to `M1a` / `M1b` / `M1c`. Family-level expansion is intentionally not implemented in Build 01.
- Within one dimension, selected tags combine with OR. Across dimensions (and with search), filters combine with AND.

### Production routing

This is a Vite SPA using `BrowserRouter`. Direct links such as `/claims/ATLAS-EMP-002` require the host to serve `index.html` for unknown paths (HTML5 history fallback). Without that fallback, deep links and refresh on claim routes will 404 on static hosts. Configure the equivalent of “SPA fallback to `index.html`” for your host; Build 01 does not choose a deployment provider.
