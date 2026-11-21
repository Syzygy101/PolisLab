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

## Application (development v0.2 — Build 03)

Interactive research laboratory with a **Research Overview**, an evidence **Claims Explorer** (search, status/admissibility/case/mechanism/outcome/literature filters, shareable URLs), full claim inspection, **two-claim comparison** (`/claims/compare`), and related-evidence navigation over the authentic v0.1.1 atlas. Casebook Explorer, Mechanism Explorer, Policy Comparison Laboratory, Evidence Gaps, and the Analytical Sandbox remain deferred navigation stubs only.

**Software licensing:** the research artefacts remain under CC BY 4.0 as above. A separate licence decision is still required for the application/software layer; this build does not choose one.

**Versioning:** application development v0.2 is distinct from research release v0.1.1. The institutional/legal cutoff remains 20 November 2026 (correction pass 21 November 2026); visiting the app later does not refresh that baseline.

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

- Free-text search is case-insensitive substring match; whitespace-only search is ignored. Searched fields include claim ID, exact claim, source title, what the source establishes, limitations, competing mechanisms, admissibility conditions, literature IDs, plus related discoverability fields (see `CLAIM_SEARCH_FIELDS` in `src/research/queries.ts`). No fuzzy or semantic search.
- Status filters match the exact published evidentiary-status vocabulary.
- Admissibility filters match `yes` / `no` / `conditional` and are **not** truth scores.
- Mechanism / outcome / case / literature controls are **exact-tag** filters over parsed identifiers. Selecting `M1` matches records tagged `M1` only; it does **not** expand to `M1a` / `M1b` / `M1c`. Family-level expansion is intentionally not implemented.
- `source_url` requires an exact trimmed match against the stored primary source URL.
- Within one dimension, selected tags combine with OR. Across dimensions (and with search), filters combine with AND.
- Default sort is `claim_id`; optional `sort=primary_source_title` (claim ID tie-break).

### Claims Explorer URL filter contract

Filters on `/claims` are mirrored in the query string (shareable and history-friendly):

| Parameter | Meaning | Example |
| --- | --- | --- |
| `q` | Free-text search | `/claims?q=land+banking` |
| `status` | Evidentiary status (repeatable) | `/claims?status=absence_of_finding` |
| `admissibility` | Policy-comparison admissibility (repeatable) | `/claims?admissibility=no` |
| `case` | Casebook case ID (repeatable) | `/claims?case=Case1` |
| `outcome` | Exact outcome tag (repeatable) | `/claims?outcome=O6` |
| `mechanism` | Exact mechanism tag (repeatable) | `/claims?mechanism=M1` |
| `literature` | Exact literature-source ID (repeatable) | `/claims?literature=SRC-ACCC-INQ` |
| `source_url` | Exact primary source URL | `/claims?source_url=https%3A%2F%2F…` |
| `sort` | `claim_id` (default, omitted) or `primary_source_title` | `/claims?sort=primary_source_title` |

- Resetting filters removes the corresponding parameters.
- **Invalid values:** unknown `status`, `admissibility`, `case`, `outcome`, and `sort` values are **ignored**; an on-page notice lists them. Unknown `mechanism` / `literature` tags are **retained and applied** as exact-tag filters (may match zero claims). Duplicates are deduplicated.
- Committed filter state is the URL. Search typing uses a short local draft then updates `q` (replace).
- Direct claim-detail routes `/claims/:claimId` are unchanged.
- Overview case / status / outcome actions deep-link into this contract.

### Two-claim comparison URL contract

| Route / parameter | Meaning |
| --- | --- |
| `/claims/compare` | Evidence comparison workspace |
| `a`, `b` | Claim IDs for slots A and B |

Missing IDs leave a slot empty; invalid IDs show a not-found state for that slot; identical IDs show both records with a distinct-claims notice. Comparison presents original fields side by side and does not adjudicate truth or recommend policy.

### Production routing

This is a Vite SPA using `BrowserRouter`. Direct links such as `/claims/ATLAS-EMP-002` require the host to serve `index.html` for unknown paths (HTML5 history fallback). Without that fallback, deep links and refresh on claim routes will 404 on static hosts. Configure the equivalent of “SPA fallback to `index.html`” for your host; Build 01 does not choose a deployment provider.
