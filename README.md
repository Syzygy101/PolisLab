# PolisLab — Evidence-Based Australian Grocery Competition Policy Assessment

An open, source-controlled interactive research laboratory for examining competing institutional and economic mechanisms affecting grocery-market entry and competition in Australia.

## Research Release v0.1.1

**Evidence foundation cutoff:** 20 November 2026 (institutional/legal).  
**Correction pass:** 21 November 2026.  
**Pinned commit:** `a1922f8a8d08f59749d34de306e1b7406f9fe10b`.

### Release contents

1. [Policy Claims Atlas](research/10_policy_claims_atlas.csv) — 43 claims with evidence provenance and limitations.
2. [Policy Assessment Casebook](research/10_policy_assessment_casebook.md) — four worked assessments covering undeveloped sites, foreign greenfield investment, differentiated entry, and supermarket acquisition oversight.

### Method

- Legal and institutional baseline (Layers A–D).
- Evidence-backed mechanism mapping (M1–M6).
- Competing explanations and possible sign reversals.
- Explicit identification of what cannot be inferred (O1–O6 assessability).

### Interpretation

- This is a dated policy synthesis, not legal advice.
- It does not claim original causal identification or a calibrated economic simulation.
- It does not establish that any proposed policy improves Australian consumer welfare.
- Historical or administrative claims are valid only for their stated source dates.
- **No established policy winner** across instruments.

### Known limitations

- No Australian local diversion-ratio or welfare estimates.
- No established causal effects of land-release reforms or Part 3 notification.
- No demonstrated nationwide exclusionary land-banking finding.
- The final Kalgoorlie Tribunal merits outcome was not verified for this release.
- Some primary records and future outcomes remain inaccessible or unobserved.
- One atlas row (`ATLAS-HYP-003`) is internal thesis framing without a public primary URL.

### Licence (research)

Original PolisLab research text and structured claims in this repository are licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). See [LICENSE](LICENSE).

Third-party materials cited or linked here are **not** relicensed. External primary sources remain under their own copyright terms; this release links to them rather than redistributing copyrighted source files.

---

## Application (v0.2.1 Field Guide candidate)

Interactive research laboratory over the authentic v0.1.1 atlas and published casebook. **Application v0.2.1 candidate** is distinct from **research v0.1.1**. Visiting later does not refresh the institutional/legal cutoff. This README describes the Field Guide release candidate. The production release requires separate approval.

### What PolisLab is

A browser application for investigating published research claims, case narratives, mechanisms, qualitative policy variants and open research requirements. It preserves provenance, status, admissibility and limitations. It is **not** a validated economic forecasting engine, **not** a calibrated simulator, and does not rank policies or declare a policy winner.

**Coverage:** six laboratory modules · **43** atlas claims · **4** cases · **40** case sections · **6** mechanism families · **12** registered submechanisms · **12** policy variants · **19** casebook §9 research requirements · **deterministic** claims search (substring + same-field whole-word fallback) · **dated** institutional/legal evidence scope.

### Research modules

| Module | Route | Role |
| --- | --- | --- |
| Overview | `/` | Orientation, coverage, insights, methodology, provenance |
| Claims Explorer | `/claims`, `/claims/:claimId` (e.g. `/claims/ATLAS-CON-001`), `/claims/compare` | Filterable evidence, claim detail, **evidence** comparison |
| Casebook Explorer | `/casebook`, `/casebook/Case1`, `/casebook/source` | Four investigations and published source |
| Mechanism Explorer | `/mechanisms`, `/mechanisms/M1c` | M1–M6 families and profiles |
| Policy Comparison Laboratory | `/comparison?a=C1-VAR-R&b=C1-VAR-E` | Qualitative **policy-variant** comparison |
| Evidence Gaps | `/gaps`, `/gaps/REQ-C1-01` | 19 casebook §9 research requirements |

**Evidence comparison** (`/claims/compare`) compares atlas claims. **Policy comparison** (`/comparison`) compares casebook intervention variants. They are not interchangeable.

The opt-in Analytical Sandbox at `/sandbox` compares hypothetical retail-funded development scenarios. See the [model methods and replay](docs/RETAIL_DEVELOPMENT_METHODS.md).

Route inventory: [docs/ROUTE_INVENTORY.md](docs/ROUTE_INVENTORY.md).

### Evidence status and admissibility

- Atlas `status` is the published evidentiary classification (e.g. verified legal fact, empirical finding, absence of finding).
- `admissible_in_policy_comparison` is a separate field (`yes` / `no` / `conditional`). It is **not** a truth verdict.
- Mechanism co-tags are metadata associations unless the research states otherwise.

### O1–O6 and Layers A–D

- **O1–O6** are outcome stages (access → capacity → … → welfare). Assessability is case- and evidence-specific; many O5/O6 rows remain not assessable.
- **Layers A–D** distinguish law in force, administrative practice, announced reforms and hypothetical instruments. Announced reforms are not entitlements.

### Software licensing

| Layer | Licence | File |
| --- | --- | --- |
| Published research (`research/10_*`) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | [LICENSE](LICENSE) |
| Application software | [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) | [LICENSE-SOFTWARE](LICENSE-SOFTWARE) |

Attribution and dependency summary: [NOTICE](NOTICE). Contributing: [CONTRIBUTING.md](CONTRIBUTING.md). Third-party inventory: [docs/THIRD_PARTY_NOTICES.md](docs/THIRD_PARTY_NOTICES.md). Decision record: [docs/SOFTWARE_LICENCE_DECISION.md](docs/SOFTWARE_LICENCE_DECISION.md).

Licence application is complete for this local RC; **public release** still requires hosting verification ([docs/HOSTING_READINESS.md](docs/HOSTING_READINESS.md)), remote CI, and owner authorisation.

### Requirements

- Node.js `^22.22.2 || >=24` (CI pins 22.23.1)
- npm (lockfile committed)

### Commands

```bash
npm ci
npx playwright install chromium   # once, for end-to-end tests
npm run ingest                    # regenerate claims + casebook generated JSON from published research
npm run validate                  # fail nonzero on atlas/casebook integrity violations (detects drift; does not rewrite)
npm run validate:release          # pin atlas/casebook/LICENSE to release commit; reject source drift
npm run dev                       # http://127.0.0.1:5173
npm run typecheck
npm run test                      # Vitest unit / component tests
npm run test:e2e                  # Playwright Chromium (serial workers; dedicated port 4173)
npm run build
npm run verify:research           # independent atlas + casebook + mechanism + gaps Python verifiers
```

End-to-end tests use a **dedicated Vite server on port 4173** with `reuseExistingServer: false` and `--workers=1`.

The published CSV and Markdown casebook remain the sources of truth. Generated JSON under `src/data/` is a reproducible consumer artefact and must not be edited by hand.

`npm run validate` parses published sources freshly **and** fails if generated JSON is missing or drifts. It does not rewrite generated artefacts — run `npm run ingest` to regenerate.

### Claims Explorer filter semantics

- Free-text search is case-insensitive substring match; whitespace-only search is ignored.
- Status and admissibility filters match published vocabularies; admissibility is not a truth score.
- `mechanism=` is exact-tag; `mechanism_family=` expands via the parent–child registry.
- Within one dimension, selected tags combine with OR; across dimensions with AND.
- Shareable URL contract: `q`, `status`, `admissibility`, `case`, `outcome`, `mechanism`, `mechanism_family`, `literature`, `source_url`, `sort`.

### Two-claim comparison

| Route / parameter | Meaning |
| --- | --- |
| `/claims/compare` | Evidence comparison workspace |
| `a`, `b` | Claim IDs for slots A and B |

### Policy Comparison Laboratory

| Route / parameter | Meaning |
| --- | --- |
| `/comparison` | Qualitative policy-variant workspace |
| `a`, `b` | Intervention variant IDs (e.g. `C1-VAR-R`, `C1-VAR-E`) |

No rankings, scores, probabilities, or effect sizes. `policyWinnerDeclared` remains false.

### Evidence Gaps

| Route / parameter | Meaning |
| --- | --- |
| `/gaps` | Directory of 19 §9 requirements |
| `/gaps/:requirementId` | Requirement detail |
| Filters | `case`, `mechanism`, `mechanism_family`, `outcome`, `status`, `type`, `role`, `agenda`, `claim` |

Legal/institutional verification is distinct from empirical falsification.

### Continuous integration

GitHub Actions workflow: [`.github/workflows/verify.yml`](.github/workflows/verify.yml) — checkout with history, `npm ci`, independent Python verification, pre-regeneration validate, release pin, typecheck, Vitest, Playwright Chromium, production build, artifact-safety checks. No automatic deploy or publish.

### Hosting

Static SPA. See [docs/HOSTING_READINESS.md](docs/HOSTING_READINESS.md). Direct routes and refresh require host SPA fallback to `index.html`. Local Vite preview alone does not verify production-host behaviour.

### Development and contribution

- Preserve published research byte-for-byte (`validate:release`).
- Do not ingest or publish `research/01–09` or `references/`.
- Follow [docs/RESEARCH_INVARIANTS.md](docs/RESEARCH_INVARIANTS.md) and [docs/DEVELOPMENT_LEDGER.md](docs/DEVELOPMENT_LEDGER.md).
- Draft release notes (local RC): [docs/RELEASE_NOTES_v0.2.0_DRAFT.md](docs/RELEASE_NOTES_v0.2.0_DRAFT.md).
- Apache 2.0 software licence: [LICENSE-SOFTWARE](LICENSE-SOFTWARE) · [NOTICE](NOTICE) · [CONTRIBUTING.md](CONTRIBUTING.md).

### Production routing

This is a Vite SPA using `BrowserRouter`. Configure SPA fallback for your host; see hosting readiness note.
