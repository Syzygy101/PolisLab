# PolisLab Research Invariants

Established safeguards for the interactive application. These constrain Build 01+ behaviour. They do not replace the published atlas, casebook, or correction notes.

**Research release:** v0.1.1  
**Published commit:** `a1922f8a8d08f59749d34de306e1b7406f9fe10b`  
**Evidence cutoff:** 20 November 2026 · **Correction pass:** 21 November 2026

## Source-field preservation

- The atlas CSV is the source of truth.
- All **18** original source fields must remain recoverable and exact in generated data and claim detail views.
- Derived fields (parsed mechanism/outcome/case lists, `hasPrimarySourceUrl`, provenance metadata) may be added but must not alter original values.
- Empty values are preserved; missing primary URLs are not fabricated (notably `ATLAS-HYP-003`).

## Status and admissibility separation

- `status` and `admissible_in_policy_comparison` are distinct fields.
- Admissibility is **not** a truth verdict: `yes` ≠ established fact; `no` ≠ falsity.
- Admissibility conditions must remain visible where users could otherwise misread a claim.
- Example: `ATLAS-HYP-002` is an unresolved hypothesis with admissibility `no` (qualitative caution only).

## Claim ID prefixes do not determine status

- Classification uses the published `status` vocabulary, not ID prefixes such as `HYP`, `CON`, or `EMP`.
- Example: `ATLAS-HYP-004` has status `absence_of_finding`, not `unresolved_hypothesis`.

## Layer A / B / C / D separation

- Distinguish law in force, administrative practice, announced reforms, and hypothetical instruments.
- Do not restate Layer D counterfactuals as current-law baselines (e.g. develop-or-release rules labelled as such).

## Outcomes O1–O6 separation

- Outcome identifiers remain distinct; they are not interchangeable.
- Filters and displays use exact outcome tags from the atlas.

## Direct case membership semantics

- Case filters match claims that list the selected casebook case identifier.
- Claims Explorer `mechanism=` / outcome / case controls are **exact-tag** filters over parsed identifiers.
- Build 05 adds opt-in `mechanism_family=` family-expanded filtering via an explicit parent–child registry (e.g. family M1 → unique records tagged M1, M1a, M1b, or M1c). Exact-tag URLs retain their original meaning. Related-evidence overlap remains exact-match.
- Casebook Explorer membership is the same direct-citation set (case body citations plus common front-matter rules that explicitly apply to all four cases). Do not equate section-explicit citation, case-body citation, common rules, atlas membership, and merely related metadata.

## Mechanism metadata vs causal relationships

- Atlas mechanism/outcome co-tagging is research metadata association, not causal identification.
- Competing explanations (e.g. M1a / M1b / M1c / option value) remain distinct; general family tags do not independently establish a particular submechanism.
- Contextual Case 2 subdivisions M5a-1 / M5a-2 are not atlas tags and must not receive fabricated claim counts.
- Observed ALDI distribution chronology does not establish that logistics was the binding constraint.
- FDI frictions are transaction-specific.

## Casebook source fidelity

- The published Markdown casebook is the authoritative case narrative.
- Application views must preserve all four cases, all ten analytical sections per case, tables, qualifications, and closing methodology/comparison material.
- Derived orientation summaries must remain explicitly separate from original source Markdown.
- Case-specific methodological distinctions (Case 1 R/E; Case 2 transaction pathways; Case 3 chronology vs identification; Case 4 waiver vs clearance / voluntary Kalgoorlie / release-dated Tribunal status) must not be collapsed into a single modelling template.

## No imported foreign magnitudes as calibrated Australian parameters

- Foreign empirical or theoretical magnitudes must not be presented as calibrated Australian parameters.
- External settings remain labelled with their limitations and external-validity constraints.

## No unsupported welfare inference

- Entry counts, planning approvals, or acquisition notifications do not by themselves establish consumer welfare or durable competitive constraint (see contested-claim safeguards such as `ATLAS-CON-003`).

## No policy ranking or quantified forecasting

- The application must not produce policy rankings, welfare forecasts, or simulated economic effects.
- Open thesis questions (e.g. `ATLAS-HYP-003`) remain unresolved hypotheses, not ranked recommendations.
- The Policy Comparison Laboratory (Build 06) is qualitative only: no scores, ranks, invented probabilities, or numerical effect estimates. `policyWinnerDeclared` remains false for every case.

## Policy comparison fidelity (Build 06)

- Comparison variants, baselines, pathways, and outcome assessments must track the pinned casebook narrative (SHA `3da0e29c…` at v0.1.1).
- Case 1 R and E remain separate Layer D instruments; favourable / adverse / null pathway columns retain their published meanings; release does not imply rival acquisition or subsequent productive capacity; `ATLAS-HYP-002` is qualitative caution only (`admissible_in_policy_comparison=no`), never a validated equilibrium result.
- Case 2 CF-A–D remain distinct; case-wide pathways (`variantIds: null`) are not silently reassigned to a single counterfactual; private vs FGI, trigger vs condition, and Layer C vs Layer D stay distinct.
- Case 3 ALDI chronology is an observed O2 benchmark; hypothetical consumer-benefit pathways remain labelled hypothetical; actual welfare remains unidentified; FDI-only and merger-notification-only are analytical comparators, not fully specified legislative instruments.
- Case 4 B0 is the dated institutional baseline; stronger/weaker scenarios keep nested alternatives separate; notification, waiver, determination, completion, and opening remain distinct; Kalgoorlie is a local prospective ACCC assessment, not a general realised causal finding.
- Cross-case variant pairing must not imply mutual exclusivity, direct substitutability, or joint implementability; variants may differ in institutional scope, target actors, policy objective, baseline, and outcome assessment basis.
- Structural dataset validation (claim membership, ref integrity, O5/O6 overclaim bans) is not a substitute for substantive research review and does not verify economic truth.

## Release pin gate (Build 05 remediation)

- `npm run validate:release` must reject drift in the pinned atlas CSV, casebook Markdown, or research LICENSE relative to published commit `a1922f8…`, even when ordinary `validate` would pass after regenerating consumer JSON.
- Acceptance and release workflows run pin/source validation against on-disk artefacts before any regeneration step that could mask source edits.

## Publication boundary

- Authoritative published research for the application baseline: `research/10_policy_claims_atlas.csv`, `research/10_policy_assessment_casebook.md`, and `LICENSE`.
- Unpublished local files under `research/01–09` and `references/` must not be staged, committed, or bundled as source files.
- Local acceptance screenshots under `docs/screenshots/` are working artefacts and must not enter publication commits unless separately authorised.
