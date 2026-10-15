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
| mkp_n250_m10_s1 | Multidimensional knapsack | 250 × 10 | 320 | run 1 only (too easy) |
| gapd_a10_j60_s1 | Generalized assignment, type D | 600 × 70 | 18 | hard (from run 2) |
| mkp_n200_m10_s2 | Multidimensional knapsack | 200 × 10 | 180 | hard (from run 2) |
| lotsize_i8_t15_s3 | Capacitated lot sizing, setup times | 375 × 255 | 10 | medium |
| lotsize_i6_t20_s2 | Capacitated lot sizing, setup times | 380 × 260 | 10 | medium |
| gapd_a5_j50_s4 | Generalized assignment, type D | 250 × 55 | 5 | medium |

All share the property of the target cases: a good incumbent early, most time
spent raising the lower bound.

## 4. Results

Raw results for every run (JSONL per solve, build info, Markdown summary) are
on the `perf-research-results` branch under `runs/<timestamp>-run<id>-<variant>/`.
Runner: GitHub-hosted `ubuntu-latest`, 4 vCPU.

### Experiment 1 — true LTO: **rejected**

Run 38654784298 (commit f85dfb8), 7 models × seeds 0, 1 × 2 repetitions, ABBA order.

- **LTO really applied:** baseline `HighsMipSolver.cpp.o` magic `\0asm` (Wasm
  object), LTO variant `BC 0xC0 0xDE` (LLVM bitcode); cached
  `CMAKE_CXX_FLAGS=-flto`; HiGHS's own IPO stays off in both.
- **Search paths identical** in all 14 model-seed pairs (same nodes, LP
  iterations, root bound, objective, final gap).
- **Time:** geometric mean **+0.9 % slower** (hard tier +1.1 %); per-pair range
  −0.3 % … +2.1 %, consistent across repetitions. Total solve time 367.7 s →
  372.0 s.
- Binary 3,531,385 → 3,407,208 bytes (−3.5 %), gzip 1,213,959 → 1,182,603
  (−2.6 %). Compile 99 → 127 s, link 40 → 74 s. Wasm memory unchanged.
- All solutions valid; every run stopped at its production gap.

Interpretation: cross-file inlining is not where HiGHS spends its time in Wasm;
the hot loops are already within single translation units. Not pursued further.

Native runs in this job did not execute (exit 127: the native binary was linked
against `libhighs.so`, which was not in the artifact). Fixed by linking
statically from run 2 on; no native numbers are taken from run 1.

### Model set change after run 1

On the runner, `mkp_n250_m10_s1` took 2.6 s in Wasm, too easy for the hard
tier. It was replaced by `gapd_a10_j60_s1` (gap 18) and `mkp_n200_m10_s2`
(gap 180). Runs 2+ use 8 models.

### Experiment 2 — WebAssembly SIMD: **rejected**

Run 38658782912 (commit b547b9c), 8 models × seeds 0, 1 × 2 repetitions, ABBA.

- **Build:** with `-O3 -msimd128`, Emscripten 6.0.3's clang **crashes
  (signal 11) compiling `mip/HighsSearch.cpp`** (run 38658172432). That one file
  is compiled without SIMD (`research/simd-exclude.cmake`); every other HiGHS
  file, the bridge and the link use `-msimd128`. A compiler crash in production
  would need a newer Emscripten or an upstream report; not pursued given the
  result.
- **Search paths identical** in all 16 pairs.
- **Time:** geometric mean **−0.7 %** (hard tier −0.7 %); per-pair −2.5 % …
  +2.0 %. Total 677.3 s → 673.7 s.
- Binary 3,531,385 → 3,584,601 bytes (+1.5 %), gzip +1.7 %. Memory unchanged.
- All solutions valid; all runs stopped at the production gap.

Interpretation: HiGHS's MIP time is sparse, index-driven work (bound
propagation, sparse LU, pricing over index lists) that the auto-vectorizer
cannot use. Not a material gain.

### Native HiGHS parallel MIP scaling (run 38658782912)

Same runner (4 vCPU), same HiGHS commit, statically linked native binary,
8 models × 2 seeds × {threads 1, `parallel=on` threads 2, `parallel=on`
threads 4} × 3 repetitions, each solve a fresh process, config order rotated.

**Stability:** 144 solves, **0 crashes, 0 hangs, 0 invalid solutions**.
Repetitions were deterministic: the same configuration and seed always gave the
same nodes and LP iterations, with times within about 1–2 %. One model-seed
group differed only because all three `on2` runs hit the 300 s time limit.

| | threads 1 | `parallel=on`, 2 threads | `parallel=on`, 4 threads |
|---|---|---|---|
| Hard pairs faster than threads 1 | — | 5 of 10 | **9 of 10** |
| Speed-up, geometric mean, hard tier | 1.00× | 1.49× | **3.36×** |
| …excluding `mkp_n200_m10_s2` (threads 1 took an unlucky 228–292 s path) | 1.00× | 1.48× (0.43–4.21×) | **2.15× (0.59–5.31×)** |
| Total over all 16 model-seed pairs | 765 s | 563 s | 146 s |
| Median max RSS | 65 MB | 94 MB | 127 MB |
| Stopped short of the gap | 0 | 3 (time limit, `mkp_n200` seed 0, 1.2 GB RSS) | 0 |

- 4 threads helped consistently; 2 threads did not (as often slower as
  faster). HiGHS runs ⌈1.7 × threads⌉ search workers, so 2 threads means 4
  workers sharing 2 cores.
- Parallel search changes the search path, so part of every difference is
  path luck, not throughput. Up to 27.7× on one model shows how large that part
  can be.

**Native vs WebAssembly, single thread.** The two take *different search
paths* on the same model and seed. The standard libraries differ (libstdc++ vs
libc++: sort tie-breaking, hashing), so per-model time comparisons are
misleading: `mkp_n200_m10_s2` seed 0 took 292 s native and 33 s in Wasm.
Throughput is the meaningful comparison. Native does **1.25× the LP iterations
per second** (geometric mean, range 1.10–1.45×) and 1.15× the nodes per second.
So the pure code-generation gap is about 20–25 %, not 2×. No compiler flag can
recover more than that. Any much larger native-vs-Wasm difference seen in
earlier testing is most likely search-path variance (or threads), not raw speed.

**Conclusion for threading:** the only measured mechanism with multi-fold
gains, roughly 2–3× at 4 threads on these models. It is stable and
deterministic natively. It costs about 2× memory at 4 threads. Its value
depends on users having ≥4 cores. 2 threads is not worth it.

### Experiment 3 — 256 MB initial heap: **rejected**

Run 38668387090 (commit b6ead08), `-sINITIAL_MEMORY=256MB` (default 16 MB),
everything else identical to the non-LTO baseline. 8 models × 2 seeds × 2
repetitions, ABBA.

- Every synthetic solve fit in the initial heap (baseline peak 20–126 MB), so
  the candidate did **no** `memory.grow` during any solve: the most favourable
  case for this experiment.
- **Search paths identical** in all 16 pairs.
- **Time:** geometric mean **−0.2 %**; per-pair −1.0 % … +0.5 %.
- **Startup memory:** Wasm memory after load 20 MB → 256 MB; Node process RSS
  after load 70 → 75 MB (pages are committed lazily on 64-bit V8, so the
  256 MB is mostly reserved address space, not resident). On memory-constrained
  devices (mobile browsers, 32-bit hosts) a 256 MB up-front allocation can fail
  where growth would not. Binary size unchanged.

Interpretation: memory growth costs nothing measurable in V8; HiGHS's
allocation pattern is not the bottleneck.

### Experiment 4 — WebAssembly pthreads, 4 threads: **gate passed for 4 threads** (approved 2026-10-14)

**Build (`variant pthreads`, `research/build-variant.sh`).** Baseline unchanged.

- Every HiGHS object, the bridge and the link use `-pthread`. Evidence from
  `build-info`: object target features `+atomics,+bulk-memory` (baseline
  `-shared-mem`); final memory imported as **shared**, 16 MB initial, 2 GB
  maximum; `HConfig.h` has `HIGHS_NO_DEFAULT_THREADS` undefined; CMake
  "Found Threads: TRUE".
- Thread demand: HiGHS's executor creates `threads − 1` pthreads (the calling
  thread is worker 0); the ⌈1.7 × threads⌉ MIP search workers are tasks, not
  threads. `PTHREAD_POOL_SIZE=4` (threads = 4 needs 3), `STRICT=2`, 4 MB thread
  stacks. A research-only post-js (`research/pthreads-probe.js`) reports the
  pool, because in Node Emscripten silently creates extra workers when the pool
  is short, which would deadlock a browser.
- Two highs-js glue adaptations, in generated copies only (`src/` untouched):
  1. `post.js` / `extended.js` call native functions as soon as the module
     loads; pthread workers run the same script before they have the Wasm
     instance, so these layers are wrapped in `if (!ENVIRONMENT_IS_PTHREAD)`.
  2. The extended API rejects `thread|parallel|concurr` options by design; the
     threaded copy lifts `thread|parallel` only.

**Failure with threads ≥ 2 and root cause.** Every real solve with
`threads` ≥ 2 threw Emscripten's internal `unwind` out of `model.run()`
(trivial models that presolve away, and `threads = 1`, worked). Diagnostic
build (`pthreads-dbg`: `-sASSERTIONS=2 -sPTHREADS_DEBUG=1 --profiling-funcs`,
run 38684565460) showed:

- a pthread worker aborted with `Exception thrown, but exception catching is
  not enabled`;
- the main thread was waiting for a stolen task —
  `HighsPrimalHeuristics::RENS → solveSubMip → HighsMipSolver::run →
  HighsTaskExecutor::sync_stolen_task → condition_variable::wait →
  emscripten_futex_wait → _emscripten_yield` — noticed the crashed thread and
  threw `unwind` from `emscripten_exit_with_live_runtime()` to tear down its
  stack.

HiGHS's scheduler cancels stolen tasks by **throwing `HighsTask::Interrupt`**
(`TaskGroup` destructor → `HighsSplitDeque::checkInterrupt`, caught in
`runStolenTask`; `HiGHS/highs/parallel/HighsParallel.h`, `HighsSplitDeque.h`).
highs-js builds with Emscripten's default (exception catching disabled), so the
throw aborts the worker. Single-thread solves never steal tasks and never
throw. Ruled out: pool exhaustion (only `threads − 1` workers ever started,
pool never grew), proxying/event-loop blocking (ordinary futex wait), the JS
wrapper (it never sees the error), callbacks (same failure with only
`mipLogging`).

**Fix:** `-fwasm-exceptions` (native WebAssembly exception handling) for every
HiGHS object and the link, pthreads variants only. No HiGHS source change;
`unwind` is not caught anywhere. Evidence: object feature `+exception-handling`,
one exception tag in `highs.wasm`. Side effects: HiGHS's other `try/catch`
blocks also start working (e.g. `bad_alloc` becomes a HiGHS error rather than
`RuntimeError: Aborted()`); requires Wasm exception handling in the browser
(Chrome 95+, Firefox 100+, Safari 15.2+). Binary 3,531,385 → 3,767,382 bytes
(+6.7 %), gzip 1,213,959 → 1,276,075 (+5.1 %).

**Verification (run 38685199004, `gapd_a5_j50_s4` / `lotsize_i6_t20_s2`,
4-vCPU runner):**

| check | result |
|---|---|
| threads = 1 | HiGHS: "Thread count 1 … 1 max workers, parallel search off"; 0 pthreads running; optimal in 15.5 s, 1,179 nodes (same path as the single-thread build); valid; gap reached |
| threads = 2 | "Thread count 2 … 4 max workers, parallel search on"; 1 pthread running; CPU/wall 1.90; optimal in 4.9 s, 593 nodes; valid; gap reached |
| threads = 4 | "Thread count 4 … 7 max workers, parallel search on"; 3 pthreads running; CPU/wall 2.91; optimal in 7.2 s, 997 nodes; valid; gap reached |
| 10 repeated 4-thread create/run/dispose cycles | all optimal, valid, gap reached; 3 pthreads running mid-solve every time; CPU/wall 2.5–2.9; dispose 0.1–3 ms; pool never above 4 workers; 0 running after each dispose |
| diagnostic build (assertions) | same results, no assertion failures, no `unwind` |

The single-solve times above are one model and one seed each, not a benchmark.

**Interface, callback and lifecycle tests** (run 38691878055,
`research/scripts/pthread-api-test.mjs`, each test a fresh process with a
300 s hang limit; models `gapd_a5_j50_s4`, `lotsize_i6_t20_s2`):

| area | result |
|---|---|
| threads actually used | threads 1/2/4 → HiGHS "Thread count 1/2/4 … 1/4/7 max workers"; 0/1/3 pthreads running mid-solve; CPU/wall 1.10/1.91/2.84 |
| callbacks: logging, mipSolution, mipImprovingSolution, mipLogging, mipInterrupt, mipCutPool, mipUserSolution (each alone and all together, 4 threads) | all called only on the main JS thread (0 off-thread calls); solution vectors full length; valid; production gap reached. simplexInterrupt / ipmInterrupt are not called during MIP (same as single-thread) |
| mipInterrupt stopping a running solve | status `interrupted`, 1–2 ms latency, solution still valid, all pthreads released; next solve normal. Interrupt at the first call (before any incumbent) also clean |
| mipUserSolution injection | callback fires and `setSolution` returns OK, but the injected optimum is **not adopted** — identical on the single-thread baseline: the known highs-js `main` issue fixed on branch `fix-callback-user-solution`, not a threading effect |
| 10 repeated create/run/dispose cycles, 4 threads | all valid at the gap; 3 pthreads running every time; dispose 0.1–1.5 ms; pool never above 4 workers |
| solver reset | `clearSolver` + new seed, and `options.reset()`: valid at the gap |
| changing `threads` on a live model | fails cleanly (HiGHS status −1: the global scheduler is fixed until every model using it is disposed); works after dispose. Two live models share one scheduler |
| legacy `highs.solve()` with 4 threads | optimal, valid |
| terminating the hosting Worker mid-solve (nested workers) | OS thread count back to the pre-solve value; a new Worker solves normally |
| C++ exception in HiGHS (malformed LP: reader throws and catches) | proper `HighsError`; the single-thread baseline **aborts** (`RuntimeError: Aborted()`) |
| **out of memory** (shared memory capped at 40/64/96 MB; uncapped control fine) | **not safe.** Allocation failing on the main thread: a raw C++ exception (`WebAssembly.Exception`) escapes `model.run()` — HiGHS does not convert it to an error status. On a worker thread: `RuntimeError: unreachable` / `Aborted()`, then `dispose()` throws `unwind`. Diagnostic build at 64 MB: hung until killed (300 s). The runtime sometimes still solves a tiny model afterwards, but its state cannot be trusted. Treat any OOM as fatal for that solver instance (recreate the worker/module). The single-thread baseline always aborts |


**Benchmark** (run 38694414415, commit 649b5d7; raw data and full tables on
`perf-research-results` under `runs/20261015T080851Z-run38694414415-pthreads-bench/`,
`analysis.md`). 8 synthetic models × seeds 0, 1, 2 × 2 repetitions × 4
configurations = 192 solves, one at a time in fresh Node processes on one
4-vCPU runner, configuration order rotating. Configurations: `baseline` (the
production single-thread build, unchanged options), `pt1` (threaded build,
`threads=1`), `pt2` (`threads=2, parallel=on`), `pt4` (`threads=4,
parallel=on`). 300 s time limit; a run stopped by it is *censored* and never
counted as solved.

Outcomes: no crashes, hangs, invalid solutions or objective mismatches in any
of the 192 runs. Six censored runs, all on `mkp_n200_m10_s2`: baseline and pt1
seed 2 (one of two repetitions each — that path takes ~290 s and ends either
just inside or just outside the limit), and pt2 seeds 0 and 1 (both
repetitions). Every solution passed the independent checker; objectives of
different configurations differ by at most 0.95 × the stopping gap (each stops
anywhere inside its gap).

| | baseline | pt1 | pt2 | pt4 |
|---|---|---|---|---|
| good / censored / failed runs | 47 / 1 / 0 | 47 / 1 / 0 | 44 / 4 / 0 | **48 / 0 / 0** |
| total solve time, all 48 runs | 1,229 s | 1,245 s | 1,772 s | **382 s** |
| total end-to-end time (Node start, load, parse, solve, check, dispose) | 1,233 s | 1,252 s | 1,779 s | **389 s** |
| sum of the 24 model/seed medians, censored counted as 300 s | 615 s | 623 s | 886 s | **191 s** |
| total CPU time / solve wall time | 1.05 | 1.05 | 1.77 | 2.73 |
| active pthreads during solve (median, max) | 0, 0 | 0, 0 | 1, 1 | 3, 3 |
| peak Wasm memory MB, median / max | 67 / 314 | 63 / 298 | 83 / 1,479 | 144 / 207 |
| max process RSS MB, median / max | 186 / 408 | 253 / 484 | 276 / 1,605 | 319 / 397 |
| RSS right after loading | 70 MB | 146 MB | 146 MB | 146 MB |
| load + instantiate (median / max) | 24 / 47 ms | 84 / 110 ms | 84 / 99 ms | 85 / 104 ms |
| dispose (median) | 0.1 ms | 0.1 ms | 0.4 ms | 0.5 ms |

Paired speed-up against the baseline (model × seed, each side the median of
its repetitions; > 1 is faster):

| | pairs | geo-mean | median | worst | best | faster |
|---|---|---|---|---|---|---|
| pt1, all, both sides solved | 23 | 0.98× | 0.98× | 0.95× | 1.01× | 5 of 23 |
| pt2, all, both solved | 21 | 1.40× | 1.38× | 0.49× | 3.07× | 16 of 21 |
| pt2, hard, both solved | 12 | 1.32× | 1.56× | 0.49× | 2.62× | 7 of 12 |
| pt4, all, both solved | 23 | **1.70×** | 1.85× | 0.13× | 4.42× | 21 of 23 |
| pt4, hard, both solved | 14 | **1.92×** | **2.28×** | 0.13× | 4.42× | 12 of 14 |
| pt4, medium, both solved | 9 | 1.40× | 1.37× | 1.19× | 2.01× | 9 of 9 |

Censored pairs (excluded above, reported with bounds): `mkp_n200_m10_s2`
seed 2 — baseline ≥ 294 s, pt4 23.7 s (≥ 12.4×), pt2 89 s (≥ 3.3×); seeds 0
and 1 — baseline 22.5 s and 28.2 s, **pt2 did not finish in 300 s (≤ 0.07×,
≤ 0.09×)**, with up to 1.5 GB Wasm memory. Counting censored runs at 300 s
(a bound in each direction), pt4 over all 24 pairs: geo-mean 1.84×, hard
2.18×, faster in 22 of 24; pt2: geo-mean 1.15×, hard 0.97×, slower than 0.9×
in 5 of 24.

Worst pt4 cases: `mkp_n150_m10_s1` seed 2 (baseline 1.0 s on a lucky 50-node
path, pt4 8.4 s, 0.13×) and `gapd_a8_j48_s2` seed 0 (0.95×). All other pt4
pairs are 1.19× or better.

2 versus 4 threads (paired, both solved): 4 threads faster in 10 of 13 hard
pairs (time ratio pt2/pt4 geo-mean 1.53×, median 1.90×) but only 5 of 9
medium pairs (0.92×); counting censored at 300 s, pt4 faster in 17 of 24
(geo-mean 1.60×). 2 threads is not a smaller version of 4: HiGHS runs ⌈1.7 ×
threads⌉ = 4 search workers on 2 threads, and on `mkp_n200` that search
wandered (≥ 128,000 nodes vs 3,600 at 4 threads).

Effort: pt1 reproduces the baseline's exact search (identical nodes and LP
iterations in every pair that finished; the censored seed-2 pair stopped at
slightly different node counts because the time limit fell at a different
moment); its cost is 2 % (median 0.98×), the price of the
threaded build itself (atomics, shared memory, Wasm exception handling).
Threaded runs change the search path, as expected, but are deterministic:
pt4 took the same path in both repetitions of all 24 pairs (time spread
median 1.6 %, max 6.9 %).

Start-up: the threaded build loads in ~85 ms instead of ~24 ms (+60 ms,
starting four pthread workers) and uses ~76 MB more RSS before solving.

### Decision gate (WebAssembly pthreads)

**Passed for 4 threads.** On these synthetic models, 4-thread WebAssembly is
substantially and repeatably faster than the production single-thread build:
~1.9–2.2× (geo-mean, hard models, with and without censored bounds), 2.3–2.5×
median, faster in 12 of 14 hard pairs, all 48 runs solved, deterministic, no
stability problems, production callbacks (mipLogging, mipImprovingSolution,
mipInterrupt) correct and on the main thread. This matches native HiGHS's
scaling on the same models (run 38658782912: 2.15–3.36× at 4 threads).

Not passed for 2 threads: inconsistent, with two > 10× regressions.

Recommendation: proceed to a **separate browser-compatibility experiment**,
with these conditions carried forward:

- `threads = 4`, `parallel = on` only; fall back to the existing
  single-thread build when fewer than 4 cores are available, or when
  cross-origin isolation / SharedArrayBuffer / Wasm exception handling is
  unavailable. Never 2 threads.
- Requirements to verify in Chrome, Firefox and Safari: cross-origin isolation
  (COOP/COEP — GitHub Pages needs a service-worker shim), SharedArrayBuffer,
  nested Workers from the app's solver Worker, Wasm exception handling,
  shared-memory growth, terminating the solver Worker.
- Memory: 4 threads roughly doubled peak memory here (~144 vs ~67 MB median).
  The application's full-year models already use ~550 MB single-threaded, so
  the 2 GB maximum (or a 4 GB maximum) must be tested on real models before any
  integration. Out of memory remains fatal to the solver instance (tested).
- mipUserSolution injection is unaffected by threading but still not adopted
  on highs-js `main` (fixed on `fix-callback-user-solution`).
- These are synthetic models; the speed-up on real full-year Form 945 models
  must be measured privately (never in this public repository) before deciding
  on integration.

## 4b. Summary of experiments

| # | Variant | What changed | Time vs baseline (geo-mean) | Paths | Size | Verdict |
|---|---|---|---|---|---|---|
| 1 | `lto` | HiGHS compiled to bitcode, real LTO | +0.9 % (slower) | identical | −3.5 % wasm | rejected |
| 2 | `simd` | `-msimd128` (except HighsSearch.cpp: clang crash) | −0.7 % | identical | +1.5 % | rejected |
| 3 | `initmem256` | 256 MB initial heap | −0.2 % | identical | 0 | rejected |
| — | native threads | `parallel=on`, 4 threads (native) | 2.15–3.36× faster (9/10 hard) | different | — | only material lever |
| 4 | `pthreads`, threads = 4 | Wasm pthreads + `-fwasm-exceptions`, parallel MIP search | **1.92× hard, 1.70× all (paired, solved); 2.18× hard incl. censored bounds** | different, deterministic | +6.7 % wasm | **gate passed** |
| 4 | `pthreads`, threads = 2 | same build, 2 threads | 1.32× hard; two pairs ≥ 10× slower (censored) | different | — | rejected |
| 4 | `pthreads`, threads = 1 | same build, 1 thread | 0.98× (cost of the threaded build) | identical | — | reference |
| — | native threads | `parallel=on`, 2 threads (native) | 1.48× geo-mean, 0.43–4.2× | different | — | inconsistent |

Code-generation ceiling: native single-thread does 1.25× the LP iterations per
second of Wasm. Build-flag work can at most close that ~20 % gap.

## 4c. Recommended next step (superseded by the experiment 4 decision gate above)

Wasm pthreads with `parallel=on` and 4 threads, as a separate experimental
build. Scope of a first feasibility test, synthetic models only:

1. Build variant `pthreads`: `-pthread`, `-sPTHREAD_POOL_SIZE=4`,
   fixed `-sMAXIMUM_MEMORY` (growth with shared memory works but is slower in JS
   glue), HiGHS configured without `HIGHS_NO_DEFAULT_THREADS`.
2. Run in Node first (worker_threads supply pthreads): measure the same
   models at 1 and 4 threads, plus crash/hang checks, memory.
3. Only if it holds the native 2–3× gain: browser test behind cross-origin
   isolation (COOP/COEP via a service-worker shim on GitHub Pages), nested
   workers from the app's solver worker, and proxying HiGHS callbacks to the
   thread that registered them.

A cheaper, separate idea the data supports: because search-path variance is
large, racing independent single-thread solves (different seeds) in separate
ordinary Web Workers needs no SharedArrayBuffer at all. On these synthetic
models a 2-seed race gave only 1.09× (geometric mean), less than the 2–3× from
parallel search, so it is a fallback rather than the main path.

## 5. Reproducing

```sh
git checkout perf-research && git submodule update --init
npm ci
# Emscripten 6.0.3 active (emsdk), then:
bash research/build-variant.sh baseline dist/baseline
bash research/build-variant.sh lto dist/lto        # or simd, initmem256
node research/models/generate.mjs models
node research/scripts/bench.mjs --variants baseline=dist/baseline/highs.js,lto=dist/lto/highs.js \
  --models models --seeds 0,1 --reps 2 --time-limit 300 --out results/wasm.jsonl
node research/scripts/summarize.mjs --wasm results/wasm.jsonl
```

In GitHub Actions: edit `research/bench-config.json` (candidate variant, seeds,
repetitions, tiers) on this branch and push.
