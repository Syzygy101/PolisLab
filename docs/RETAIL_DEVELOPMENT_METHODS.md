# Retail-funded development experiment

**Hypothetical computational experiment · retail-1.** Replay at `/sandbox?model=retail-1&scenario=timing&approval=granted&horizon=3`.

Voluntary access permits developer A to retain site B or offer a fixed lease. Required offer obliges A to offer those terms. Developer B may refuse in either arm. A receives the fixed fee immediately if B accepts. In the permit scenario the fresh approval draw resolves after the lease choice at year zero. The interface reports each selected outcome conditional on the same private grant probability.

Developers prepare and commit on years 0, 0.5 and 1. Preparation costs 5 and takes half a year. Commitment triggers works at the preset cost. Opening follows half a year later, has a fit-out cost of 8 and starts an eight-year trading contract. The private discount rate is 8% continuously compounded. Operators are pre-contracted. There are no lapse charges, closing costs or salvage in these presets.

Potential baskets are an annual flow. At price (p), an open site has utility (4-0.35p). The outside alternative has utility zero. Exponentiated utilities normalised by their sum determine basket shares. Consumer surplus is annual potential baskets times the log of the sum of exponentiated utilities divided by 0.35. Symmetric single-store operators price simultaneously and face constant marginal cost of 5. Their gross retail contribution is margin times allocated baskets. The common rent is proportional to each site's own gross retail contribution.

The symmetric pricing equation is solved by bisection. Each development date solves the feasible two-by-two preparation and commitment games backwards. Distribution over game actions is propagated forwards. The B-priority rule selects continuation where the date game admits multiple equilibria. The lease tie accepts for B and retains for A within a numerical tolerance of (10^{-9}). The results depend on these assumptions and selections.

**Theoretical result.** Summing the two developer accounts cancels the upfront lease transfer. Adding operator income cancels rent in the aggregate. Welfare therefore adds consumer surplus and gross retail contribution and deducts development resource costs. The reported accounts apply a continuous 4% social discount rate. They include obligations exactly at the right endpoint. Full run-out of the two prospective contracts ends by year 9.5.

**Published evidence.** The existing v0.1.1 claims atlas and casebook are separate from this synthetic exercise. Their source bytes and attribution are preserved.

## Reproduce locally

Use the Node version range in `package.json`, the committed dependency lock and `npm ci`. Run `npm run validate:release` before regeneration. Run `node --import tsx scripts/replay-retail.ts` to emit all 20 allowed replay combinations with exact model inputs, dated events and account balances. Run `npx vitest run tests/unit/retail-development.test.ts` to compare welfare and openings to the independently checked reference data in `tests/fixtures/retail-1-reference.json`. Playwright exercises the guided sequence and reloads its canonical replay.

The permit example keeps the signing and approval outcomes distinct. At three years, the grant yields +77.63 welfare units and denial yields 0.00, each compared with voluntary access. The five-unit fee survives denial in the required-offer arm. In the opening comparison the two-year change is −38.84 and the three-year change is +59.08 under the same model choices. These units and comparisons belong to the specified synthetic scenarios.

This standalone methods text and the associated standalone reference data use CC BY 4.0. Copyright and attribution are recorded in NOTICE. Model runtime, executable fixtures and verification software use Apache 2.0.
