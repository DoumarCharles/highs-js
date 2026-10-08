# Why highs-js ignored solutions handed in from the `mipUserSolution` callback

Branch: `fix-callback-user-solution`. Base: `main` at 741e02d (v1.15.3, bundled
HiGHS 1.15.1 at submodule commit 04024d7).

## TL;DR

* **Root cause (highs-js):** `src/highs_js_bridge.cpp` copies a C snapshot of
  HiGHS's `HighsCallbackInput` back over the live object after every callback
  (`*data_in = c_data_in`). `Highs_setCallbackSolution`,
  `Highs_setCallbackSparseSolution` and `Highs_repairCallbackSolution` set
  `user_has_solution = true` on the **live C++ object** (reached through
  `c_data_in.cbdata`), not on the snapshot, so the copy-back resets the flag to
  `false` and `HighsMipSolverData::queryExternalSolution` never sees a
  solution. The submitted vector itself survives (it is written straight into
  the live object's buffer); only the flag is lost.
* **Fix (2 lines, `src/highs_js_bridge.cpp`):** OR the live flag into the
  snapshot before copying it back.
* **Same defect upstream in HiGHS:** HiGHS's own C-callback wrapper,
  `Highs::setCallback(HighsCCallbackType, void*)` (`HiGHS/highs/lp_data/Highs.cpp:2639-2651`),
  does the identical snapshot/copy-back, so every plain C-API consumer
  (not just highs-js) loses the solution too. A fix for the C API plus a C API
  test is in `upstream-highs/` (see "Upstream HiGHS" below). highs-js does not
  depend on it: the bridge fix alone resolves the bug with the currently
  bundled HiGHS.
* **Verified** natively (C harnesses linked against native HiGHS, log visible)
  and through highs-js (Emscripten build of this branch): the submitted
  solution becomes HiGHS's first incumbent (`X` line in the MIP log), the new
  test fails on the unfixed bridge and passes on the fixed one, and the whole
  suite passes (legacy tests + 81/81 extended tests).

## 1. Standalone repro (published `highs` 1.15.3 build)

`repro/mip-user-solution.cjs` builds a deterministic 300×10 binary
multi-dimensional knapsack (maximize), gets a good feasible solution from a
2 s time-limited solve, then runs fresh (4 s limit) five ways:

```
Summary (submitted objective 11388):
  A no submission              : incumbent at 2nd firing = undefined, first improving incumbent = 0
  B callback setSolution       : incumbent at 2nd firing = 99,  first improving incumbent = 0 -> IGNORED
  C callback setSolution (all) : incumbent at 2nd firing = 99,  first improving incumbent = 0 -> IGNORED
  D callback sparse + repair   : incumbent at 2nd firing = 99,  first improving incumbent = 0 -> IGNORED
  E start before run()         : first improving incumbent = 11388
```

Runs B–D have exactly the same incumbent trajectory as A
(0 → 99 → 11168 → 11183 → 11226 → 11229 → 11384 → 11388), every
`setSolution()` / `repairSolution()` returns `{status: 0}`, and `E` (the same
vector via `model.setSolution({colValue})` before `run()`) is taken as the first
incumbent. Note that the published 1.15.3 bundle used here is the one CI built
from the `Release v1.15.3` commit (fetched from the `gh-pages` branch, which
ships it for the demo), because the npm registry is not reachable from this
sandbox; it reports `HiGHS 1.15.1 (04024d7)`, the same as `npm`'s package.

With the fixed build (this branch):

```
Summary (submitted objective 11388):
  B callback setSolution       : incumbent at 2nd firing = 11388, first improving incumbent = none -> USED
  C callback setSolution (all) : incumbent at 2nd firing = 11388, first improving incumbent = none -> USED
  D callback sparse + repair   : incumbent at 2nd firing = 11388, first improving incumbent = none -> USED
```

and HiGHS's log shows the user solution as the first incumbent:

```
Src  Proc. InQueue |  Leaves   Expl. | BestBound       BestSol              Gap | ...
 X       0       0         0   0.00%   inf             11388              Large ...
```

(`X => User solution`.) A user-supplied incumbent is not reported through the
`mipImprovingSolution` callback — `addIncumbent` skips the solution callbacks
when `is_user_solution` is set (`HiGHS/highs/mip/HighsMipSolverData.cpp:1504-1508`)
— which is why the repro and the test look at `mip_primal_bound` at the next
`mipUserSolution` query instead.

### Why "HiGHS's log is invisible"

Two independent things, neither of them the bug:

* `src/pre.js` replaces Emscripten's default `print`/`printErr` with no-ops
  unless the loader is given handlers. HiGHS's `log_to_console` output goes to
  stdout, so it only appears if you load with
  `loader({ print: console.log, printErr: console.error })`. The repro does
  this when `SHOW_LOG=1`.
* The logging callback (type 0) does fire with `output_flag: true` — but while
  it is registered HiGHS routes log lines to the callback instead of stdout.
  (`repro/` was checked both ways against the published build.)

So no source build is needed to see HiGHS's log; the Emscripten build below
was done to show the bridge fix working through highs-js.

## 2. Root cause, with references

### The callback path

1. **JS** (`src/extended.ts:2517-2554`): for type 9 the trampoline exposes
   `event.setSolution(v)` → `Highs_setCallbackSolution(dataIn, numCols, v)`
   (or `Highs_setCallbackSparseSolution`), and `event.repairSolution()` →
   `Highs_repairCallbackSolution(dataIn)`. `dataIn` is the pointer HiGHS's
   callback passed to the trampoline. Note how `event.interrupt()`
   (`src/extended.ts:2556-2559`) works differently: it writes
   `heap32()[dataIn >> 2] = 1` **directly into the struct at `dataIn`**.
2. **highs-js bridge** (`src/highs_js_bridge.cpp:152-168` before the fix).
   highs-js does not use `Highs_setCallback`; it installs its own
   `std::function` wrapper through `Highs_js_setCallback`, which for every
   callback:
   ```cpp
   HighsCallbackDataIn c_data_in{};                       // local C struct
   if (data_in) c_data_in = static_cast<HighsCallbackDataIn>(*data_in);  // snapshot
   callback(type, message.c_str(), &c_data_out, &c_data_in, user_data);  // -> JS trampoline, dataIn = &c_data_in
   if (data_in) *data_in = c_data_in;                     // copy-back  <-- the bug
   ```
3. **HiGHS C API** (`HiGHS/highs/interfaces/highs_c_api.cpp:1604-1630`):
   `Highs_setCallbackSolution(data_in, …)` does
   `static_cast<HighsCallbackInput*>(data_in->cbdata)->setSolution(…)`, i.e.
   it acts on the **live** `HighsCallbackInput` (the `cbdata` pointer is set
   by the conversion operator, `HiGHS/highs/lp_data/HighsCallback.cpp:142-153`).
   `HighsCallbackInput::setSolution` (`HighsCallback.cpp:164-181`, sparse
   variant `183-238`, `repairSolution` `240-324`) writes the values into
   `user_solution` (whose buffer the snapshot also points at) and sets
   `user_has_solution = true` **on the live object only**. The C struct
   `c_data_in.user_has_solution` stays `0`.
4. **Copy-back**: `*data_in = c_data_in` invokes
   `HighsCallbackInput::operator=(const HighsCallbackDataIn&)`
   (`HighsCallback.cpp:156-162`), which does
   `user_has_solution = data_in.user_has_solution != 0;` → **false again**.
5. **Consumer**: `HighsMipSolverData::queryExternalSolution`
   (`HiGHS/highs/mip/HighsMipSolverData.cpp:2753-2817`) calls
   `clearHighsCallbackInput()`, fires the callback via `callbackAction`
   (`HighsCallback.cpp:77-95`), then checks
   `if (callback->data_in.user_has_solution)` (line 2769) before the
   feasibility check and `addIncumbent`. The flag is false, so the solution is
   silently dropped — no log line, no error, and `setSolution()` had already
   returned `kOk`.

`interrupt()` is unaffected because the JS writes into the snapshot itself,
which the copy-back then propagates. The reading in the task description was
right about the consumer side; the loss happens one step earlier, in the
wrapper, before `queryExternalSolution` ever looks at the flag.

### Why presolving first / sparse + repair / resubmitting did not help

They all go through the same `Highs_*CallbackSolution(data_in, …)` →
copy-back path; the flag is cleared on every firing regardless of what was
submitted. The feasibility check in `queryExternalSolution` is never reached.

### The same defect in HiGHS itself

`Highs::setCallback(HighsCCallbackType c_callback, void*)`
(`HiGHS/highs/lp_data/Highs.cpp:2639-2651`) — the wrapper behind the C API's
`Highs_setCallback` — is the template the bridge copied:

```cpp
HighsCallbackDataIn cc_in;
if (cb_in) cc_in = static_cast<HighsCallbackDataIn>(*cb_in);
c_callback(a, b.c_str(), &cc_out, &cc_in, e);
if (cb_in) *cb_in = cc_in;  // copy the data in
```

So a plain C program using `Highs_setCallback` + `Highs_setCallbackSolution`
loses the solution the same way (verified natively, see §4). HiGHS's own tests
only exercise the C++ path (`check/TestCallbacks.cpp` sets
`data_in->user_has_solution = true` on the C++ object directly, or calls
`data_in->setSolution`), and `check/TestCAPI.c` has no user-solution test, so
it went unnoticed. HiGHS `master` (fetched 2026-10-08) still has both the
wrapper and the C API functions unchanged.

## 3. The fix

### highs-js (`src/highs_js_bridge.cpp`, this branch)

```cpp
if (data_in) {
  // Highs_setCallbackSolution, Highs_setCallbackSparseSolution and
  // Highs_repairCallbackSolution write to *data_in through
  // c_data_in.cbdata, so the snapshot taken before the callback no
  // longer reflects user_has_solution. Copying the stale snapshot
  // back verbatim would discard the submitted solution.
  c_data_in.user_has_solution |= data_in->user_has_solution ? 1 : 0;
  *data_in = c_data_in;
}
```

OR-ing (rather than overwriting) keeps the existing semantics for a raw
callback that sets the C struct's flag itself, keeps `user_interrupt` flowing
through the snapshot exactly as before, and still honours a failed
`repairSolution()` (which sets the live flag back to `false`; the snapshot's
is `0` too, so the OR is `0`). No change to the JS runtime, the exported
function list, `types.d.ts`, or the API manifest (`npm run check:api` passes).

Alternative considered: writing `1` into the C struct from JS after a
successful `Highs_setCallbackSolution` (offset 12 of `HighsCallbackDataIn`,
the same trick `interrupt()` uses at offset 0). Rejected because it hard-codes
struct layout in JS; the bridge already owns the snapshot and is the right
place.

### Upstream HiGHS (`upstream-highs/0001-Keep-user_has_solution-in-sync-for-C-API-callback-so.patch`)

Mirror the live flag into the C struct inside the three C API functions:

```cpp
const HighsStatus status = obj->setSolution(num_entries, value);
data_in->user_has_solution = obj->user_has_solution ? 1 : 0;
return static_cast<int>(status);
```

(and the same for the sparse and repair variants), plus a new
`testCallbackUserSolution()` in `check/TestCAPI.c` that submits a greedy
feasible knapsack solution from the first `kHighsCallbackMipUserSolution`
firing and asserts it is the primal bound at the second firing. This fixes
`Highs_setCallback` users and, once highs-js bumps its bundled HiGHS, would
also have fixed highs-js on its own (verified: unfixed bridge + patched HiGHS
→ USED). The branch keeps the submodule pointer at 04024d7; the patch is a
`git format-patch` file to apply on a HiGHS checkout. `upstream-highs/PR-DRAFT-HiGHS.md`
is the PR text for ERGO-Code/HiGHS.

Both fixes are independent and compatible; applying both is fine.

## 4. Test

`tests/extended/callbacks.test.cjs`, test
"a solution submitted from the mipUserSolution callback becomes the incumbent"
(line 210). It builds a deterministic 200×10 binary knapsack, computes a
greedy feasible solution (profit-per-weight order; objective 7309), submits it
at the first `mipUserSolution` firing, records `mip_primal_bound` at later
firings and every `mipImprovingSolution` objective, and interrupts the search
from `mipInterrupt` once the second firing has happened (≈0.5 s). Assertions:

* at least two firings;
* `mip_primal_bound` at the second firing ≥ submitted objective (HiGHS adopted
  the submission);
* every improving solution HiGHS reports afterwards beats the submission;
* the final solution is at least as good as the submission.

Results:

| build | result |
|---|---|
| published 1.15.3 bundle (`gh-pages`) | **fails**: `the primal bound at the second firing (99) should be at least the submitted objective (7309)` |
| this branch, bridge from `main`, local Emscripten build | **fails**, same message |
| this branch, fixed bridge, local Emscripten build | **passes** (0.5 s); full suite: `node tests/test.js` ok, `node --test tests/extended/*.test.cjs` 81/81 |

### Native evidence (scratch harnesses, not on the branch)

Linked against a native (g++/cmake) build of the bundled HiGHS with the log on:

| harness | HiGHS | result |
|---|---|---|
| `Highs_setCallback` + `Highs_setCallbackSolution` (pure C API) | 04024d7 | `data_in->user_has_solution` after the call = 0; primal bound at 2nd query 99 → **IGNORED** |
| same, but the callback also sets `data_in->user_has_solution = 1` | 04024d7 | `X … 11395` first incumbent → USED (proves the copy-back is the loss) |
| same as first | + upstream patch | flag = 1 after the call; `X … 11395` → **USED** |
| `Highs_js_setCallback` (bridge from `main`), dense and sparse+repair | 04024d7 | 2nd query primal bound 99 → **IGNORED** |
| `Highs_js_setCallback` (fixed bridge), dense and sparse+repair | 04024d7 | `X … 11395`, 2nd query 11395 → **USED** |
| `Highs_js_setCallback` (bridge from `main`) | + upstream patch | **USED** |
| `check/TestCAPI.c` with the new `testCallbackUserSolution()` | 04024d7 / + patch | assertion fails / whole `TestCAPI` passes |

## 5. Build and test steps

### What was actually run here

The sandbox cannot reach the npm registry, emsdk's download host or Docker
Hub, so `npm ci`, `npm run build` (emsdk 6.0.3) and the dev container were not
usable. The build was reproduced with:

* Emscripten **3.1.50** from `github.com/emscripten-core/emscripten` (the last
  line that expects LLVM 18), driving the system **clang 18.1.3** (`wasm32`
  target + `wasm-ld`) and **binaryen version_116** built from source
  (`wasm-opt`, `wasm-emscripten-finalize`, `wasm-metadce`), configured via
  `EM_CONFIG`; `acorn` copied from a local node tool install.
* `src/extended.ts` → `build/generated/extended.js` with Node 22's
  `module.stripTypeScriptTypes` (no `tsc`).
* The two `emcc` links from `build.sh` with the same flags except: `-flto`
  dropped, `-s WASM_ASYNC_COMPILATION=0` added (under 3.1.50 the `--post-js`
  runtime would otherwise run before the wasm is instantiated — the real
  build uses a newer Emscripten where this is not an issue), and the local
  acorn optimizer allowed ES2022 (the stripped `extended.js` keeps class
  fields that `tsc --target ES2020` would have lowered).
* `node scripts/generate-highs-api.mjs --check` passes; the `tsc`-based steps
  of `npm test` (`tsc`, `tsconfig.runtime.json`, `test-dts`) could not be run.

None of these deviations touch the bridge or the test, and the resulting
`highs.wasm` embeds the exact bundled HiGHS. CI will do the canonical build.

### Canonical steps (dev container / CI)

```sh
git checkout fix-callback-user-solution
npm ci
npm run build                      # or: docker compose run --rm tests npm run build
npm test                           # includes tests/extended/callbacks.test.cjs
node repro/mip-user-solution.cjs   # trajectory with/without submission, fixed build
node repro/mip-user-solution.cjs node_modules/highs/build/highs.js   # vs the published package (IGNORED)
SHOW_LOG=1 node repro/mip-user-solution.cjs   # with HiGHS's log
```

To see the test fail before the fix: `git stash push src/highs_js_bridge.cpp`
(or check out `main`'s copy), rebuild, run
`node --test --test-name-pattern="mipUserSolution callback becomes" tests/extended/callbacks.test.cjs`.

### Upstream HiGHS patch

```sh
git clone https://github.com/ERGO-Code/HiGHS && cd HiGHS
git am <highs-js>/upstream-highs/0001-Keep-user_has_solution-in-sync-for-C-API-callback-so.patch
cmake -S . -B build -DBUILD_TESTING=ON && cmake --build build -j
./build/bin/capi_unit_tests        # runs testCallbackUserSolution() among the C API tests
```

The patch applies cleanly to 04024d7 and to `master` as of 2026-10-08
(`highs_c_api.cpp` and the wrapper in `Highs.cpp` are unchanged there).

## 6. Uncertain / not covered

* The suite's TypeScript steps (`tsc`, `test-dts`) were not run here; the
  branch changes no `.ts`/`.d.ts` file, so they should be unaffected.
* The local build is not byte-identical to CI's (older Emscripten, no LTO,
  sync instantiation). The bridge fix is 2 lines of C++ with no toolchain
  dependence; CI's build is the one to trust for size/benchmark gates.
* `repro/mip-user-solution.cjs` uses time limits (2 s + 5×4 s); exact
  incumbent values depend on timing, but IGNORED/USED did not vary across runs.
  The committed test avoids this by interrupting after the second query.
* In the test, "HiGHS reports it as an improving solution" cannot be asserted
  directly: by design `addIncumbent` does not run the solution callbacks for
  user solutions, so the test asserts the incumbent jump via `mip_primal_bound`.
* The HiGHS test's `user_solution_values[40]` / knapsack sizes are small so it
  runs in ~0.07 s; the second query (`EvaluateRootNode0`) always happens for
  this model with `presolve=off`, but if a future HiGHS solved it during setup
  the `>= 2 firings` assertion would need a larger model.
* The `gh-pages` bundle stands in for the npm tarball of 1.15.3; both are the
  CI build of commit 96981da, but the tarball itself was not downloaded.
