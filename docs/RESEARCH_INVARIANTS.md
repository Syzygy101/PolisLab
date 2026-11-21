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
- Claims Explorer mechanism/outcome/case controls are **exact-tag** filters over parsed identifiers (not silent family expansion).

## No imported foreign magnitudes as calibrated Australian parameters

- Foreign empirical or theoretical magnitudes must not be presented as calibrated Australian parameters.
- External settings remain labelled with their limitations and external-validity constraints.

## No unsupported welfare inference

- Entry counts, planning approvals, or acquisition notifications do not by themselves establish consumer welfare or durable competitive constraint (see contested-claim safeguards such as `ATLAS-CON-003`).

## No policy ranking or quantified forecasting

- The application must not produce policy rankings, welfare forecasts, or simulated economic effects.
- Open thesis questions (e.g. `ATLAS-HYP-003`) remain unresolved hypotheses, not ranked recommendations.

## Publication boundary

- Authoritative published research for the application baseline: `research/10_policy_claims_atlas.csv`, `research/10_policy_assessment_casebook.md`, and `LICENSE`.
- Unpublished local files under `research/01–09` and `references/` must not be staged, committed, or bundled as source files.
