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

## Application (development v0.2 — Build 07)

Interactive research laboratory with a **Research Overview**, an evidence **Claims Explorer** (search, status/admissibility/case/mechanism/outcome/literature filters, shareable URLs), full claim inspection, **two-claim comparison** (`/claims/compare`), related-evidence navigation, an interactive **Casebook Explorer**, a **Mechanism Explorer** (`/mechanisms`), a qualitative **Policy Comparison Laboratory** (`/comparison?a=&b=`), and an **Evidence Gaps and Falsification** laboratory (`/gaps`, `/gaps/:requirementId`) over the authentic v0.1.1 atlas and published casebook Markdown. The Analytical Sandbox remains a deferred, gated navigation stub only.

**Software licensing:** the research artefacts remain under CC BY 4.0 as above. A separate licence decision is still required for the application/software layer; this build does not choose one.

**Versioning:** application development v0.2 is distinct from research release v0.1.1. The institutional/legal cutoff remains 20 November 2026 (correction pass 21 November 2026); visiting the app later does not refresh that baseline.

### Requirements

- Node.js `^22.12.0 || >=24` (tested on Node 22.23.1 / npm 10.9.8; matches Vitest 5 / Vite 8 toolchain)
- npm (lockfile committed)

### Commands

```bash
npm install
npx playwright install chromium   # once, for end-to-end tests
npm run ingest                    # regenerate claims + casebook generated JSON from published research
npm run validate                  # fail nonzero on atlas/casebook integrity violations
npm run validate:release          # pin atlas/casebook/LICENSE to release commit; reject source drift
npm run dev                       # http://127.0.0.1:5173
npm run typecheck
npm run test                      # Vitest unit / component tests
npm run test:e2e                  # Playwright (serial workers; dedicated port 4173)
npm run build
npm run verify:research           # independent atlas + casebook + mechanism + gaps Python verifiers
npm run verify:gaps               # Evidence Gaps §9 / classification verifier only
```


End-to-end tests use a **dedicated Vite server on port 4173** with `reuseExistingServer: false` and `--workers=1`. Do not treat intermittent parallel runs on port 5173 as reliable.

The published CSV at `research/10_policy_claims_atlas.csv` and Markdown casebook at `research/10_policy_assessment_casebook.md` remain the sources of truth. Generated JSON under `src/data/` is a reproducible consumer artefact and must not be edited by hand.

`npm run validate` parses both published sources freshly **and** fails if generated JSON is missing or drifts (stale or hand-edited generated data cannot silently pass). It does not rewrite generated artefacts — run `npm run ingest` to regenerate.

### Mechanism Explorer routes

| Route | Meaning |
| --- | --- |
| `/mechanisms` | Family taxonomy overview, coverage counts, 6×6 mechanism–outcome matrix, curated pathways |
| `/mechanisms/:mechanismId` | Profile for a family (`M1`…`M6`) or exact atlas submechanism (`M1a`…`M6b`) |

Coverage counts are research association tallies, not causal importance. Contextual Case 2 subdivisions `M5a-1` / `M5a-2` are documented on the M5a profile and are not atlas tags or standalone routes.

### Casebook Explorer routes

| Route | Meaning |
| --- | --- |
| `/casebook` | Directory of the four published investigations |
| `/casebook/:caseId` | Individual case investigation (`Case1`…`Case4`) with `#section-1`…`#section-10` anchors |
| `/casebook/source` | Front matter, cross-case comparison table, and closing methodological sections |

Cited-claim membership is the atlas `casebook_cases` field (direct citation, including common front-matter rules). Memberships overlap and are not evidence-quality or policy-performance scores. Inline `ATLAS-*` IDs and published mechanism tags in case text link to claim detail / mechanism profiles. Two cited claims can be selected for the existing `/claims/compare` workspace — there is no second comparison engine.

### Claims Explorer filter semantics

- Free-text search is case-insensitive substring match; whitespace-only search is ignored. Searched fields include claim ID, exact claim, source title, what the source establishes, limitations, competing mechanisms, admissibility conditions, literature IDs, plus related discoverability fields (see `CLAIM_SEARCH_FIELDS` in `src/research/queries.ts`). No fuzzy or semantic search.
- Status filters match the exact published evidentiary-status vocabulary.
- Admissibility filters match `yes` / `no` / `conditional` and are **not** truth scores.
- `mechanism=` remains **exact-tag** (selecting `M1` matches records tagged `M1` only).
- `mechanism_family=` expands via an explicit parent–child registry (family `M1` → unique records tagged `M1`, `M1a`, `M1b`, or `M1c`). Exact and family selections within the mechanism dimension combine with OR.
- Outcome / case / literature controls remain exact-tag. Related-evidence overlap remains exact-match.
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
| `mechanism_family` | Family-expanded mechanism (repeatable) | `/claims?mechanism_family=M1` |
| `literature` | Exact literature-source ID (repeatable) | `/claims?literature=SRC-ACCC-INQ` |
| `source_url` | Exact primary source URL | `/claims?source_url=https%3A%2F%2F…` |
| `sort` | `claim_id` (default, omitted) or `primary_source_title` | `/claims?sort=primary_source_title` |

- Resetting filters removes the corresponding parameters.
- **Invalid values:** unknown `status`, `admissibility`, `case`, `outcome`, `mechanism_family`, and `sort` values are **ignored**; an on-page notice lists them. Unknown `mechanism` / `literature` tags are **retained and applied** as exact-tag filters (may match zero claims). Duplicates are deduplicated.
- Committed filter state is the URL. Search typing uses a short local draft then updates `q` (replace).
- Direct claim-detail routes `/claims/:claimId` are unchanged.
- Overview case / status / outcome actions and Mechanism Explorer deep-links use this contract.

### Two-claim comparison URL contract

| Route / parameter | Meaning |
| --- | --- |
| `/claims/compare` | Evidence comparison workspace |
| `a`, `b` | Claim IDs for slots A and B |

Missing IDs leave a slot empty; invalid IDs show a not-found state for that slot; identical IDs show both records with a distinct-claims notice. Comparison presents original fields side by side and does not adjudicate truth or recommend policy.

### Policy Comparison Laboratory URL contract

| Route / parameter | Meaning |
| --- | --- |
| `/comparison` | Qualitative policy-variant workspace (distinct from `/claims/compare`) |
| `a`, `b` | Intervention variant IDs (e.g. `C1-VAR-R`, `C1-VAR-E`) |

Defaults are empty slots. Invalid IDs are ignored with a notice; identical IDs keep both slots with a distinct-variants notice. The workspace compares definitions, baselines, conditions, pathways, and O1–O6 assessability qualitatively — no rankings, scores, probabilities, or effect sizes.

### Production routing

This is a Vite SPA using `BrowserRouter`. Direct links such as `/claims/ATLAS-EMP-002` require the host to serve `index.html` for unknown paths (HTML5 history fallback). Without that fallback, deep links and refresh on claim routes will 404 on static hosts. Configure the equivalent of “SPA fallback to `index.html`” for your host; Build 01 does not choose a deployment provider.
