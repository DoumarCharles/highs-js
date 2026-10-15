# Research build: highs-js on HiGHS `latest` (2026-10-15)

Research-only. Not for release: `main`, the npm version (1.15.3), tags and
releases are untouched. Benchmarking is out of scope here.

## Solver versions

| | HiGHS commit | `highs.version` |
|---|---|---|
| Reference (`main`, npm `highs@1.15.3`) | `04024d701f79feb8e2f18bc3df0dffc04ef05088` (v1.15.1) | `1.15.1`, gitHash `04024d7` |
| This branch | `3fa5161b1f3fc3f6cd346a864ecc30cef21f3508` (`latest`, +1613 commits, fast-forward) | `1.15.1`, gitHash `3fa5161` |

Upstream `latest` has not bumped `Version.txt`, so `version.string` is still
`1.15.1`; only `version.gitHash` distinguishes the builds. The submodule is
pinned to the exact SHA; nothing tracks the branch.

## Changes required

1. **`api/highs-c-api.json`** (+ regenerated `api/highs-c-api.generated.json`).
   `check:api` refuses unclassified symbols. New stable functions
   `Highs_passHessianOracle` and `Highs_checkHessianOracle` (native
   function-pointer Hessian oracle) are classified `excluded`; 34 new constants
   (`kHighsModelStatusMemoryLimit`=18, `kHighsModelStatusHighsInterrupt`=19,
   `kHighsPresolveStatusException`=9, `kHighsCallbackQpFirstFeasiblePoint`=10,
   `kHighsCallbackQpInterrupt`=11, `kHighsHessianOracleCallType*`,
   `kHighsPresolveRule*`) are excluded from the JS constants contract.
   `exported_functions.json` is unchanged; no existing C signature changed.
2. **`src/post.js`** (legacy `solve()`). `Highs_getSolution` now returns
   `kHighsStatusError` when no primal solution exists; `solve()` threw
   "Unable to get solution" on every infeasible model. The status is now read
   directly and an error means "no primal values". Output for
   Infeasible/error/Empty statuses is identical to 1.15.3; for a limit status
   with no primal solution, `Primal`/`Dual`/`Status` are omitted instead of
   being read from buffers HiGHS never wrote.

No change was needed to `build.sh`, the C++ bridge, `extended.ts`,
`types.d.ts`, tests, or the CMake flags. The bridge also compiles cleanly
natively against the new headers.

Research tooling (not compatibility changes): `.github/workflows/research-highs-latest.yml`
and `research/*.mjs|cjs` run the requested commands on the canonical toolchain
(`.env`: Node 24, emsdk 6.0.3) and report via check annotations.

## Test results (CI, Node 24.21.0, emcc 6.0.3)

| Command | Result |
|---|---|
| `npm run check:api` | pass (154 functions, 114 constants, 151 WASM exports) |
| `npm run build` | pass |
| `npm test` | **fail** — type checks pass; `tests/test.js` stops at `test_exceeds_stack` |
| extended suite (`node --test tests/extended/*.test.cjs`) | 80/80 pass |
| legacy cases, each in a fresh runtime (`research/legacy-matrix.cjs`) | 16/18 pass |
| `npm run test:package` | pass |
| LP + MIP smoke (`research/smoke.mjs`, CJS + ESM, legacy + persistent) | pass, gitHash `3fa5161` |
| Same smoke on `highs@1.15.3` | pass, gitHash `04024d7` |

Legacy failures (tests not modified or skipped):

- `test_exceeds_stack`: upstream replaced the LP reader (`highs/io/LpReader.cpp`,
  "Write a new LP reader"). It is stricter: `tests/exceeds_stack.lp` wraps
  bounds across lines (`0 <= x_0` / `<= 32 0 <= x_1`) and is rejected with
  "expected a new line … each bound must be on its own line". The reader
  signals parse errors with a C++ throw; this WASM build has exceptions
  disabled (unchanged from 1.15.3), so the throw becomes
  `RuntimeError: Aborted` rather than a clean error status. Natively the same
  file returns `kHighsStatusError`.
- `test_mip_presolve_is_not_suboptimal`: objective is `8.999999` vs the test's
  `strictEqual(…, 9)`. Within MIP tolerances but not bit-identical.

## C API and callback behaviour changes observed

- `Highs_getSolution` returns error when `primal_solution_status` is none;
  `Highs_getBasis` returns error when the basis is invalid. Through the
  persistent API, `model.getSolution()` and `model.getBasis()` now **throw**
  `HighsError` for an infeasible LP, and `getBasis()` throws after any MIP
  solve (1.15.3 returned status 0 with filler values).
- `HighsCallbackDataOut` gained `qpasm_iteration_count` (inserted after
  `pdlp_iteration_count`, shifting later offsets), `qp_solution` and
  `qp_solution_size`. highs-js reads fields by name via
  `Highs_getCallbackDataOutItem` and the bridge assigns by name, so no change
  was required. `HighsCallbackDataIn` is unchanged (`user_interrupt` at offset 0).
- On a knapsack MIP probe, payload keys and controls are identical to 1.15.3
  for MIP solution, improving solution, interrupt, cut pool and user solution
  (`mip_solution` length = numCols); logging callbacks pass the extended
  suite. Firing counts and the incumbent sequence differ because the search
  differs; the final objective matched.
- New callback types 10/11 (QP) are rejected by the JS adapter, as before.
- `Highs_destroy` and the one-shot `Highs_*Call` no longer reset the global
  scheduler; `Highs_resetGlobalScheduler` stays excluded in this
  single-threaded build.
- Presolve rule bit positions moved (ZeroCostSingleton inserted at 18,
  DualFixProbing, FourierMotzkin, WeaklyDominatedCol added; ColStuffing 18→19,
  InitialSweep 19→21). Any `presolve_rule_off` mask using bits ≥ 18 changes meaning.
- New options: `presolve_light` (default "choose"), `presolve_fm_obj_reformulation`,
  `hipo_factor`, `hipo_parallel_force`, `hipo_parallel_forbid`, `test_qp_oracle`.
- Log header has an extra third-party-notice line.
- `BUILD_SHARED_EXTRAS_LIB` defaults ON, so HiGHS tries to `dlopen`
  `libhighs_extras.so` (HiPO/BLAS extras). Emscripten's stub returns NULL and
  HiGHS treats extras as unavailable — the same feature set as 1.15.3 (HiPO off).

The `mipUserSolution` copy-back bug fixed on `fix-mip-user-solution` is in the
highs-js bridge, which is unchanged here, so the bug is still present. The
probe was inconclusive on this build only because HiGHS found a better
incumbent of its own before the second callback.

## Building and loading both versions side by side

Build from source (devcontainer):

```sh
git clone https://github.com/DoumarCharles/highs-js.git highs-js-ref
git clone -b research/highs-latest-20261015 https://github.com/DoumarCharles/highs-js.git highs-js-latest
for d in highs-js-ref highs-js-latest; do
  (cd $d && git submodule update --init && docker compose run --rm tests bash -c "npm ci && npm run build")
done
node highs-js-latest/research/smoke.mjs highs-js-ref/build    # gitHash 04024d7
node highs-js-latest/research/smoke.mjs highs-js-latest/build # gitHash 3fa5161
```

Or install prebuilt packages: the reference from npm and the research build
from the `highs-research-latest` artifact of the "Research HiGHS latest"
workflow run on this branch (contains `highs-research-latest.tgz`):

```sh
npm install highs-ref@npm:highs@1.15.3 highs-latest@file:./highs-research-latest.tgz
```

```js
const loadRef = require("highs-ref");
const loadLatest = require("highs-latest");
// Pass a fresh options object to each loader: Emscripten uses it as that
// instance's Module object, and reusing one throws "Cannot redefine property".
const ref = await loadRef({ print() {}, printErr() {} });
const latest = await loadLatest({ print() {}, printErr() {} });
console.log(ref.version.gitHash, latest.version.gitHash); // 04024d7 3fa5161
```
