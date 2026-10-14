# HiGHS WebAssembly performance research

Branch `perf-research` of the highs-js fork. Experimental only: nothing here is
merged, released or used by any production build. `build.sh`, `src/` and the
existing workflows are untouched.

All benchmark models are synthetic, generated from fixed seeds from textbook
problem classes (`research/models/generate.mjs`). No application model,
formulation, test case or customer data is in this branch, its workflow logs or
its artifacts.

## 1. Inspection of the production build (main @ 741e02d)

| Item | Finding |
|---|---|
| HiGHS | 1.15.1, submodule `04024d701f79feb8e2f18bc3df0dffc04ef05088` (2026-07-02) |
| Emscripten | 6.0.3 (pinned in `.env`; 6.0.9 is the latest tag on 2026-10-14) |
| Node | 24 |
| CMake configure | `-DFAST_BUILD=OFF -DBUILD_SHARED_LIBS=OFF -DHIGHSINT64=OFF -DHIGHS_NO_DEFAULT_THREADS=ON -DZLIB=OFF`, no build type → HiGHS forces `Release` |
| HiGHS object code | Clang `-O3 -DNDEBUG` (CMake's Clang Release default; Emscripten 6.0.3's toolchain file does not override it) |
| LTO | **Not applied to HiGHS.** HiGHS's CMake disables IPO/LTO for static libraries unless `CMAKE_INTERPROCEDURAL_OPTIMIZATION` is set, so `libhighs.a` holds Wasm object files. The final `emcc -O3 -flto` only LTO-compiles the bridge and Emscripten's system libraries; there is no cross-file optimization inside HiGHS. Verified per build by the object magic bytes in `build-info.txt`. |
| SIMD | Not enabled (`-msimd128` absent) |
| Memory | `ALLOW_MEMORY_GROWTH=1`, 16 MB initial, default 2 GB maximum. C++ exception catching is off, so `bad_alloc` aborts (`RuntimeError: Aborted()`). |
| Stack | 4 MB |
| Threads | Compiled out (`HIGHS_NO_DEFAULT_THREADS`, no `-pthread`) |
| Callbacks | Bridge copies scalar MIP data per call; solution vectors only for solution-type callbacks. HiGHS calls back only for registered types. |

### Native vs WebAssembly

Native builds differ in: real hardware SIMD paths (none are hand-written in
HiGHS's MIP code, but the compiler auto-vectorizes), x86 `popcnt`, a thread pool
(HiGHS uses it for some presolve/clique work even with serial tree search),
and native code generation instead of a JIT over Wasm. The search itself is the
same algorithm.

### Threads: HiGHS 1.15 has a parallel MIP tree search

`HighsMipSolver` runs up to ⌈1.7 × threads⌉ search workers when
`parallel = on` and more than one thread is available
(`HighsMipSolver::getMaxNumWorkers`). It is off with `parallel = choose`
(the default). This is the only mechanism likely to give multi-fold speed-ups,
so it is measured natively first (section 3) before any Wasm threading work.

Wasm threading requirements, for the record: `-pthread`, a fixed maximum shared
memory, `SharedArrayBuffer`, which needs cross-origin isolation
(`Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy:
require-corp`); GitHub Pages cannot set these headers, so a service-worker shim
would be needed. Emscripten pthreads are Web Workers (nested inside the app's
solver worker). HiGHS invokes callbacks from whichever thread runs the event,
and JS callbacks registered with `addFunction` live on one thread, so the
bridge would need to proxy callbacks to the calling runtime thread.

## 2. Candidate experiments, ranked

1. **True LTO for HiGHS** (`variant lto`): compile HiGHS to LLVM bitcode so the
   existing `-flto` link step optimizes across HiGHS translation units. Build
   change only; no runtime, browser or deployment change. Wasm floating point
   is deterministic and LTO does not enable fast-math, so the search path must
   be bit-identical: identical node and LP iteration counts are checked.
2. **Wasm pthreads + parallel MIP search**: highest potential, highest cost.
   Gated on the native thread-scaling measurement.
3. **Wasm SIMD** (`variant simd`): auto-vectorization; bit-identical without
   fast-math; universally supported by current browsers (Safari ≥ 16.4).

Lower priority: 4 GB memory ceiling (`mem4g`, robustness against the 2 GB
abort, not speed), `mimalloc`, Emscripten 6.0.9, `mipInterrupt` callback
overhead. Rejected: relaxed SIMD / FMA contraction / fast-math (change results,
and differently on different hardware).

## 3. Benchmark method

- Workflow `.github/workflows/perf-research.yml` (triggers only on pushes to
  this branch touching `research/**`). Settings in `research/bench-config.json`.
- Baseline and candidate are built by `research/build-variant.sh` from the same
  checkout, HiGHS commit and Emscripten version; `baseline` adds no flags, i.e.
  it is `build.sh`'s configuration.
- All timed runs happen in one job on one runner, strictly one at a time, each
  in a fresh Node process. For each model and seed the two variants run back to
  back and the order alternates (A B, B A, …).
- Same models, options, absolute stopping gap, random seed and time limit for
  both. Options mirror a production-style solve: persistent API, `mip_rel_gap =
  0`, `mip_abs_gap` = the instance's stopping gap (well short of exact proof),
  `output_flag` on with the improving-solution and MIP-logging callbacks
  registered, nothing printed.
- Recorded: solve wall time, nodes, LP iterations, final absolute gap, status,
  Wasm memory size (= peak), process max RSS, binary and gzip size.
- Every solution is re-checked by an independent checker
  (`research/scripts/check.mjs`) against the generated model: bounds,
  integrality, rows, and the objective recomputed.
- Native HiGHS (same commit) then runs the same models on the same runner with
  threads 1, and `parallel = on` with 2 and 4 threads.

### Models (`research/models/generate.mjs`)

| Name | Class | Size (cols × rows) | Stopping abs gap | Tier |
|---|---|---|---|---|
| gapd_a8_j48_s2 | Generalized assignment, type D | 384 × 56 | 10 | hard |
| gapd_a10_j50_s3 | Generalized assignment, type D | 500 × 60 | 20 | hard |
| mkp_n150_m10_s1 | Multidimensional knapsack | 150 × 10 | 360 | hard |
| mkp_n250_m10_s1 | Multidimensional knapsack | 250 × 10 | 320 | hard |
| lotsize_i8_t15_s3 | Capacitated lot sizing, setup times | 375 × 255 | 10 | medium |
| lotsize_i6_t20_s2 | Capacitated lot sizing, setup times | 380 × 260 | 10 | medium |
| gapd_a5_j50_s4 | Generalized assignment, type D | 250 × 55 | 5 | medium |

All share the property of the target cases: a good incumbent early, most time
spent raising the lower bound.

## 4. Results

(Filled in from workflow runs below.)

## 5. Reproducing

```sh
git checkout perf-research && git submodule update --init
npm ci
# Emscripten 6.0.3 active (emsdk), then:
bash research/build-variant.sh baseline dist/baseline
bash research/build-variant.sh lto dist/lto
node research/models/generate.mjs models
node research/scripts/bench.mjs --variants baseline=dist/baseline/highs.js,lto=dist/lto/highs.js \
  --models models --seeds 0,1 --reps 2 --time-limit 300 --out results/wasm.jsonl
node research/scripts/summarize.mjs --wasm results/wasm.jsonl
```

In GitHub Actions: edit `research/bench-config.json` (candidate variant, seeds,
repetitions, tiers) on this branch and push.
