# PolisLab Development Ledger

Local development record for the interactive application layer. Research artefacts remain authoritative in `research/10_*` and the published v0.1.1 release.

**Checkpoint:** Build 07 accepted (Evidence Gaps and Falsification Laboratory)  
**Branch:** `feat/v0.2-evidence-gaps`  
**Acceptance commit:** local `feat: add source-grounded evidence gaps and falsification laboratory` (record SHA from `git rev-parse HEAD` after commit)  
**Starting checkpoint (Builds 05–06 accepted):** `1bbe1a08ba2f8ce77a1dcb0685083194f24c007a`  
**Starting checkpoint (Build 04F):** `c19ea5f660d7e6f008eea5b6157fface2fc633fa`  
**Claims workspace checkpoint (Build 03F):** `4a502a41f964d08aef5298ac1fbf93550892a085`  
**Overview checkpoint (Build 02F):** `e89735a7af6e4ed733a11365c32798a8421241b0`  
**Foundation checkpoint:** `45d23a1d32547efe7d7d9139c2b5225937872ba0`  
**Research baseline:** v0.1.1 / commit `a1922f8a8d08f59749d34de306e1b7406f9fe10b`  
**Evidence cutoff:** 20 November 2026 · **Correction pass:** 21 November 2026  
**Application version:** development v0.2 (Build 07 accepted)

## Product purpose

PolisLab is an interactive research laboratory for examining competing institutional and economic mechanisms affecting grocery-market entry and competition in Australia. It presents authenticated research claims with provenance and limitations. It is not legal advice, not an economic forecasting tool, and does not rank policies or simulate welfare effects.

## Product horizons (H0–H4)

| Horizon | Intent | Status |
| --- | --- | --- |
| **H0** | Published evidence synthesis (atlas + casebook) as the immutable research baseline | Released as v0.1.1 |
| **H1** | Application foundation + Claims Explorer over the authentic atlas | Accepted (Build 01 / 01R); frozen in Build 01F |
| **H2** | Research Overview as a durable orientation surface for the laboratory | Accepted (Build 02 / 02R → 02F) |
| **H2.5** | Evidence investigation workspace (search, admissibility, compare, related evidence) | Accepted (Build 03 / 03R → 03F) |
| **H3** | Interactive Casebook Explorer | Accepted (Build 04 / 04R → 04F) |
| **H3b** | Mechanism Explorer | **Accepted (Build 05 + audit remediations)** |
| **H4a** | Policy Comparison Laboratory | **Accepted (Build 06)** |
| **H4b** | Evidence Gaps / falsification surfaces | **Accepted (Build 07 / 07R)** |
| **H4b+** | Gated Analytical Sandbox | Deferred — next milestone Build 08 |

## Build 01–06 acceptance (summary)

- Build 01–04: foundation through Casebook. Checkpoints `45d23a1` → `c19ea5f`.
- Build 05–06: Mechanisms + Policy Comparison. Accepted at `1bbe1a0` on `feat/v0.2-mechanisms`.

## Build 07 — Evidence Gaps and Falsification Laboratory — ACCEPTED

### Scope delivered

- Versioned research-requirements registry (`GAPS_REGISTRY`, `2026.11.22-b07`) preserving all **19** numbered casebook §9 source entries with exact wording verified against pinned Markdown
- Distinction between source wording and curated labels / interpretive summaries
- Requirement types and observation roles separating legal/institutional verification from empirical falsification
- Optional organisational research-agenda programmes (not newly published findings)
- Routes `/gaps` and `/gaps/:requirementId`; Evidence Gaps in primary nav
- URL filter contract: `case`, `mechanism`, `mechanism_family`, `outcome`, `status`, `type`, `role`, `agenda`, `claim`
- Cross-links from claims, casebook §9, mechanisms, comparison, Overview
- Independent Python verifier with **content** checks (anchors + registry↔Markdown wording), not counts alone
- Same-case comparison: shared case-wide §9 requirements once; variant-specific separately

### Build 07R acceptance corrections

| Finding | Remediation |
| --- | --- |
| Independent verifier tested counts more than wording | Extended `independent_verify_gaps.py` to parse registry `sourceText`, soft-match Markdown, and check content anchors |
| `REQ-C4-03` listed all Case4 variants (looked variant-assigned) | Set `comparisonVariantIds: null` (case-wide) |
| `REQ-C2-04` cited `ATLAS-GAP-002` without §9 support | Replaced with `ATLAS-LIT-005` (mode non-interchangeability) |
| `REQ-C4-01` cited `ATLAS-ADM-002` as if establishing tribunal merits | Cleared claim refs; qualification notes ADM-002 is not substituted |
| Same-case comparison duplicated case-wide §9 on both sides | `partitionComparisonRequirements` + shared panel once |
| Main bundle ~613 kB via ClaimDetail → gapsQueries → comparisonDataset | Removed comparison dataset from gapsQueries; thinned gapsUrl → gapsSchema; main ~558 kB |

### Classification semantics (v0.1.1, dynamic)

| Group | Count |
| --- | ---: |
| Numbered §9 source entries | **19** |
| GAP-prefixed atlas claims | **4** |
| `absence_of_finding` | **6** |
| `unresolved_hypothesis` | **4** |

Preserved: `ATLAS-HYP-004` = `absence_of_finding`; `ATLAS-HYP-002` = unresolved + admissibility `no`. All 43 atlas rows carry `observation_that_would_alter_assessment`.

### Acceptance gates (Build 07R — final)

| Gate | Result |
| --- | --- |
| Starting checkpoint | `1bbe1a0` → `feat/v0.2-evidence-gaps` |
| Independent Python atlas / casebook / mechanisms / gaps | PASS |
| Atlas / casebook / LICENSE | Unchanged vs `a1922f8` |
| `validate` before regeneration | PASS |
| `validate:release` | PASS |
| Typecheck | PASS |
| Vitest | PASS (**241**) |
| Playwright (port 4173, workers=1) | PASS (**38**) |
| Production build | PASS |
| Screenshots (local, **unstaged**) | `docs/screenshots/build-07/` |

**Bundle (production):** main `index-*.js` ~558 kB / gzip ~161 kB (down from interim ~613 kB); Comparison ~84 kB lazy; Gaps pages lazy. Remaining main-bundle gaps registry (~via ClaimDetail cross-links) reserved for Build 08 optimisation if needed.

**Verdict:** Build 07 **accepted**.

## Remaining uncertainty

- Schema/structural validation ≠ substantive research review.
- Curated associations are organisational aids; they do not expand public research claims.
- Interactive assumption-testing remains deferred.
- Application/software licence and SPA host fallback remain separate release decisions.

## Technical architecture

- **Source of truth:** `research/10_policy_claims_atlas.csv` + `research/10_policy_assessment_casebook.md`
- **Gaps registry:** `src/research/gapsRequirements.ts` (+ schema / parse / queries / URL)
- **Ingest / validate / verify:** `npm run ingest`, `validate`, `validate:release`, `verify:research` (includes gaps)
- **UI:** Overview + Claims + Casebook/Mechanisms/Comparison/Gaps (lazy); Sandbox stub deferred

## Outstanding technical debt

- Main bundle still >500 kB; ClaimDetail eagerly loads gaps registry for cross-links — candidate for Build 08 code-splitting.
- Application/software licence undecided (research remains CC BY 4.0).
- Hosting SPA fallback not packaged.
- Local screenshots under `docs/screenshots/` intentionally unstaged.
- Invalid `#section-*` hashes soft-fail.
- Interactive assumption-testing deferred.
- Occasional Vitest fake-timer flake in `navigation-commit` when run in full parallel suite (passes in isolation / re-run).

## Deferred features

- Analytical Sandbox (gated) — **Build 08**
- Interactive assumption-testing extension for comparison variants
- Numerical simulation, policy rankings, composite scores (out of scope)
- Automatic research ingestion / public deployment

## Next milestone

**Build 08 — gated Analytical Sandbox** (only when explicitly requested). Leave pushing, merging, deployment, retagging and publication for separate authorization.
