# PolisLab route inventory (Build 08)

Stable URL contracts for the six substantive research modules. Navigation
`location.state` return context does **not** survive direct external links;
shareable filter/compare state lives in the query string where noted.

| Route | Module | Shareable state | Return context |
| --- | --- | --- | --- |
| `/` | Overview | In-page hashes only | — |
| `/claims` | Claims list | Query: `q`, `status*`, `admissibility*`, `case*`, `outcome*`, `mechanism*`, `mechanism_family*`, `literature*`, `source_url`, `sort` | — |
| `/claims/:claimId` | Claim detail | Param only | Optional `location.state.explorerSearch` or `caseReturn` |
| `/claims/compare` | Two-claim comparison | Query: `a`, `b` | Optional `explorerSearch` |
| `/casebook` | Casebook directory | — | — |
| `/casebook/:caseId` | Case investigation | Hash: `#section-1`…`#section-10`, `#cited-evidence` | — |
| `/casebook/source` | Published casebook source | — | — |
| `/mechanisms` | Mechanism directory | — | — |
| `/mechanisms/:mechanismId` | Mechanism profile | Hash anchors (e.g. `#contextual-subdivisions`) | — |
| `/comparison` | Policy Comparison Laboratory | Query: `a`, `b` variant IDs | — |
| `/gaps` | Evidence Gaps directory | Query: `case*`, `mechanism*`, `mechanism_family*`, `outcome*`, `status*`, `type*`, `role*`, `agenda`, `claim` | — |
| `/gaps/:requirementId` | Research requirement | Optional `?from=` encoded gaps QS | Optional `gapsSearch` state |
| `/sandbox` | Future capability stub | — | Not in primary nav |
| `*` | Not found | — | Helpful links; no silent redirect |

**Evidence comparison** = Claims Explorer `/claims/compare` (atlas claims).  
**Policy comparison** = `/comparison` (casebook intervention variants). These are not interchangeable.

Invalid known vocabulary in filter URLs is ignored with notices where implemented. Unknown claim/case/mechanism/requirement IDs show dedicated empty/error states. Browser refresh and Back/Forward preserve shareable query/hash state; do not invent “return” controls when navigation state is absent.
