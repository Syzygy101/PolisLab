# Performance baseline — Build 08

Measured with `npm run build` (Vite 8 production, Node 22) on the Build 08 RC working tree.

## Before (Build 07R ledger)

| Chunk | Approx raw | Approx gzip |
| --- | ---: | ---: |
| Main `index-*.js` | ~558 kB | ~161 kB |
| Comparison (lazy) | ~84 kB | — |

Interim Build 07 peak before thinning: ~613 kB main (ClaimDetail → gapsQueries → comparisonDataset).

## After (Build 08 RC)

| Chunk | Raw | Gzip |
| --- | ---: | ---: |
| `index-*.js` (eager shell + Overview + Claims) | 283 kB | 85 kB |
| Shared vendor/research chunk (Vite-named `useDocumentTitle-*.js`) | 224 kB | 66 kB |
| `ClaimDetailPage-*.js` | 19 kB | 5 kB |
| `gapsQueries-*.js` (with claim detail / case / mechanism) | 28 kB | 7 kB |
| `ComparisonPage-*.js` | 86 kB | 22 kB |
| `CasebookMarkdown-*.js` (markdown stack) | 170 kB | 51 kB |
| `casebookDataset-*.js` | 88 kB | 19 kB |

**Initial `/` load (index + shared):** ~507 kB raw / ~151 kB gzip — modest reduction vs Build 07 main ~558 / ~161, with gaps registry and claim detail deferred off the eager path.

## Changes

- Lazy-load `ClaimDetailPage` and `ComparePage` (in addition to casebook / mechanisms / comparison / gaps).
- Gaps registry no longer enters the eager Claims Explorer path solely via claim detail.

## Build 08P (Direction C production adoption)

Measured with `npm run build` after 08P design adoption (same toolchain).

| Chunk | Raw | Gzip |
| --- | ---: | ---: |
| `index-*.js` (eager shell + Overview + Evidence library) | 333 kB | 97 kB |
| Shared vendor/research chunk | 224 kB | 66 kB |
| `index-*.css` (Direction C component system + Tailwind) | 60 kB | 11 kB |
| `ComparisonPage-*.js` | 22 kB | 6 kB |
| `comparisonQueries-*.js` | 66 kB | 18 kB |
| `CasebookMarkdown-*.js` | 169 kB | 51 kB |
| `casebookDataset-*.js` | 88 kB | 19 kB |

**Initial `/` load (index JS + shared):** ~557 kB raw / ~163 kB gzip — higher than Build 08 RC (~507 / ~151) because the adopted design-system CSS and denser shell/claims/overview land on the eager path. Lazy research routes remain split. No `chunkSizeWarningLimit` increase. Design-exploration prototypes and screenshots are not bundled.

## Limitations

- Chunk names are Vite-assigned; the large shared chunk is not literally the title hook.
- Gzip sizes from Vite build report / local measurement; CDN Brotli may differ.
- Default Playwright e2e uses the Vite **dev** server on 4173; production-preview journeys use `playwright.preview.config.ts` against `vite preview`.
- No artificial `chunkSizeWarningLimit` increase was applied.
