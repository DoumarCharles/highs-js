## Builds

```
variant: baseline
extra cmake args: (none)
extra link flags: (none)
JS glue guarded to main runtime thread: 0
extended API option rule: /thread|parallel|concurr/i.test(name)
emcc: emcc (Emscripten gcc/clang-like replacement + linker emulating GNU ld) 6.0.3 (283e2d130132859fde6a4e4c87fd254b38127651)
HiGHS commit: 04024d701f79feb8e2f18bc3df0dffc04ef05088
-- Build type: Release
-- IPO / LTO supported by compiler: YES
-- IPO / LTO: disabled by default when building a static library; set CMAKE_INTERPROCEDURAL_OPTIMIZATION=ON to enable
CMAKE_CXX_FLAGS (cache): 
CMAKE_CXX_FLAGS_RELEASE (cache): -O3 -DNDEBUG
HighsMipSolver.cpp.o magic:  \0 a s m
HighsMipSolver.cpp.o wasm info: {"memories":[{"import":"env.__linear_memory","shared":false,"minPages":1,"maxPages":null,"minMB":0.0625}],"features":["+bulk-memory","+bulk-memory-opt","+call-indirect-overlong","+multivalue","+mutable-globals","+nontrapping-fptoint","+reference-types","+sign-ext","-shared-mem"],"threadImports":["env._ZTHN17HighsTaskExecutor25threadLocalWorkerDequePtrE","env._ZN17HighsLpRelaxation22notifyCutPoolsLpCopiedEi","env._ZNSt3__218condition_variable10notify_oneEv","env._ZNSt3__218condition_variable4waitERNS_11unique_lockINS_5mutexEEE","GOT.func._ZTHN17HighsTaskExecutor25threadLocalWorkerDequePtrE","GOT.mem._ZN17HighsTaskExecutor25threadLocalWorkerDequePtrE"]}
highs.wasm info: {"memories":[{"defined":true,"shared":false,"minPages":324,"maxPages":32768,"minMB":20.25,"maxMB":2048}],"features":[],"threadImports":[]}
HConfig.h threading: #define HIGHS_NO_DEFAULT_THREADS
cmake: -- Found Threads: TRUE
objects in libhighs.a: 216
compile seconds: 133
link seconds: 50
highs.wasm bytes: 3531385
highs.wasm gzip-9 bytes: 1213959
highs.wasm sha256: 528be4365bea1d4188988646b244263f50320df55782e14d6af5bce7cd45c840
GROWABLE_HEAP view checks in highs.js (pthreads + memory growth): 0
PTHREAD_POOL_SIZE in highs.js:
```
```
variant: pthreads
extra cmake args: -DCMAKE_C_FLAGS=-pthread -DCMAKE_CXX_FLAGS=-pthread
extra link flags: -pthread -sPTHREAD_POOL_SIZE=4 -sPTHREAD_POOL_SIZE_STRICT=2 -sDEFAULT_PTHREAD_STACK_SIZE=4194304 -sMAXIMUM_MEMORY=2147483648
JS glue guarded to main runtime thread: 1
extended API option rule: /concurr/i.test(name)
emcc: emcc (Emscripten gcc/clang-like replacement + linker emulating GNU ld) 6.0.3 (283e2d130132859fde6a4e4c87fd254b38127651)
HiGHS commit: 04024d701f79feb8e2f18bc3df0dffc04ef05088
-- Build type: Release
-- IPO / LTO supported by compiler: YES
-- IPO / LTO: disabled by default when building a static library; set CMAKE_INTERPROCEDURAL_OPTIMIZATION=ON to enable
CMAKE_CXX_FLAGS (cache): -pthread
CMAKE_CXX_FLAGS_RELEASE (cache): -O3 -DNDEBUG
HighsMipSolver.cpp.o magic:  \0 a s m
HighsMipSolver.cpp.o wasm info: {"memories":[{"import":"env.__linear_memory","shared":false,"minPages":1,"maxPages":null,"minMB":0.0625}],"features":["+atomics","+bulk-memory","+bulk-memory-opt","+call-indirect-overlong","+multivalue","+mutable-globals","+nontrapping-fptoint","+reference-types","+sign-ext"],"threadImports":["env._ZTHN17HighsTaskExecutor25threadLocalWorkerDequePtrE","env._ZN17HighsLpRelaxation22notifyCutPoolsLpCopiedEi","env._ZNSt3__218condition_variable10notify_oneEv","env._ZNSt3__218condition_variable4waitERNS_11unique_lockINS_5mutexEEE","GOT.mem._ZN17HighsTaskExecutor25threadLocalWorkerDequePtrE","GOT.func._ZTHN17HighsTaskExecutor25threadLocalWorkerDequePtrE"]}
highs.wasm info: {"memories":[{"import":"a.a","shared":true,"minPages":256,"maxPages":32768,"minMB":16,"maxMB":2048}],"features":[],"threadImports":[]}
HConfig.h threading: /* #undef HIGHS_NO_DEFAULT_THREADS */
cmake: emcmake: cmake --fresh /home/runner/work/highs-js/highs-js/HiGHS -DZLIB=OFF -DFAST_BUILD=OFF -DBUILD_SHARED_LIBS=OFF -DHIGHSINT64=OFF -DHIGHS_NO_DEFAULT_THREADS=OFF -DCMAKE_C_FLAGS=-pthread -DCMAKE_CXX_FLAGS=-pthread -DCMAKE_TOOLCHAIN_FILE=/home/runner/work/_temp/0242ad94-c112-4513-b0ba-df5031ee123a/emsdk-main/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DCMAKE_CROSSCOMPILING_EMULATOR=/home/runner/work/_temp/0242ad94-c112-4513-b0ba-df5031ee123a/emsdk-main/node/22.16.0_64bit/bin/node in directory /home/runner/work/highs-js/highs-js/research-build/pthreads
cmake: -- Found Threads: TRUE
cmake: -- Build files have been written to: /home/runner/work/highs-js/highs-js/research-build/pthreads
objects in libhighs.a: 216
compile seconds: 61
link seconds: 28
highs.wasm bytes: 3543192
highs.wasm gzip-9 bytes: 1219931
highs.wasm sha256: 936580aa098a4f728fddcaf31920e5a4afefdd079f50de273ccc24cd437ce859
GROWABLE_HEAP view checks in highs.js (pthreads + memory growth): 0
PTHREAD_POOL_SIZE in highs.js:
```

## Per-variant overview

| variant | threads | parallel | runs | failed | hung | invalid | gap not reached | median load ms | median end-to-end s | median solve s | median CPU/wall | peak Wasm MB (median / max) | max RSS MB (median / max) | RSS after load MB | shared memory | pthread workers after load | max running pthreads | workers after dispose |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| pt2 | default | default | 3 | 3 | 0 | 0 | 0 | NaN | – | – | NaN | – / – | NaN / -Infinity | NaN | – | – | 0 | – |

Largest pthread worker count seen in any run: 0 (pool size 4; a larger number would mean Emscripten had to create workers on demand, which deadlocks in a browser).

## Solve time by model and seed (median over repetitions; speed-up = baseline / variant)

| model | tier | seed | baseline s | pt2 s | pt2 speed-up | pt2 nodes | baseline nodes |
|---|---|---|---|---|---|---|---|

## Speed-up summary against the single-thread WebAssembly baseline

| variant | hard pairs faster | hard geo-mean (solve) | hard median | hard range | all pairs geo-mean (solve) | hard geo-mean (end-to-end) | all geo-mean (end-to-end) |
|---|---|---|---|---|---|---|---|

## Repeatability (same variant, model and seed across repetitions)

- **pt2**: search path differed between repetitions in 0 of 0 model-seed groups; median (max − min)/median time spread NaN %, worst 0.0 %.

## Failures

- pt2 lotsize_i8_t15_s3 seed 0 rep 0: exit 1 signal null

```

node:internal/modules/run_main:107
    triggerUncaughtException(
    ^
unwind
Thrown at:
    at asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:107:5)


Node.js v24.21.0

```
- pt2 lotsize_i6_t20_s2 seed 0 rep 0: exit 1 signal null

```

node:internal/modules/run_main:107
    triggerUncaughtException(
    ^
unwind
Thrown at:
    at asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:107:5)


Node.js v24.21.0

```
- pt2 gapd_a5_j50_s4 seed 0 rep 0: exit 1 signal null

```

node:internal/modules/run_main:107
    triggerUncaughtException(
    ^
unwind
Thrown at:
    at asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:107:5)


Node.js v24.21.0

```

## JavaScript interface and callback tests (pthreads build)

| test | result | details |
|---|---|---|
| threads-1 | pass | HiGHS header {"threadCount":1,"hardwareThreads":4,"maxWorkers":1,"parallelSearch":"off"} (expected 1 threads, 1 workers); pthreads running during solve 0 (expected 0); CPU/wall 1.10; optimal in 18.4 s; valid true |
| threads-2 | **FAIL** | process exit 1 signal null:  node:internal/modules/run_main:107     triggerUncaughtException(     ^ unwind Thrown at:     at asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:107:5)   Node.js v24.21.0  |
| threads-4 | **FAIL** | process exit 1 signal null:  node:internal/modules/run_main:107     triggerUncaughtException(     ^ unwind Thrown at:     at asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:107:5)   Node.js v24.21.0  |
| callbacks-all | **FAIL** | process exit 1 signal null:  node:internal/modules/run_main:107     triggerUncaughtException(     ^ unwind Thrown at:     at asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:107:5)   Node.js v24.21.0  |
| interrupt | **FAIL** | process exit 1 signal null:  node:internal/modules/run_main:107     triggerUncaughtException(     ^ unwind Thrown at:     at asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:107:5)   Node.js v24.21.0  |
| repeated-solves | **FAIL** | process exit 1 signal null:  node:internal/modules/run_main:107     triggerUncaughtException(     ^ unwind Thrown at:     at asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:107:5)   Node.js v24.21.0  |
| rerun-and-thread-change | **FAIL** | process exit 1 signal null:  node:internal/modules/run_main:107     triggerUncaughtException(     ^ unwind Thrown at:     at asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:107:5)   Node.js v24.21.0  |
| two-models | **FAIL** | process exit 1 signal null:  node:internal/modules/run_main:107     triggerUncaughtException(     ^ unwind Thrown at:     at asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:107:5)   Node.js v24.21.0  |
| legacy-solve | **FAIL** | HUNG: killed after 300 s |
| terminate-worker | **FAIL** | process exit 1 signal null:  node:internal/modules/run_main:107     triggerUncaughtException(     ^ unwind Thrown at:     at asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:107:5)   Node.js v24.21.0  |
| callback-logging | **FAIL** | process exit 1 signal null:  node:internal/modules/run_main:107     triggerUncaughtException(     ^ unwind Thrown at:     at asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:107:5)   Node.js v24.21.0  |
| callback-simplexInterrupt | **FAIL** | process exit 1 signal null:  node:internal/modules/run_main:107     triggerUncaughtException(     ^ unwind Thrown at:     at asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:107:5)   Node.js v24.21.0  |
| callback-ipmInterrupt | **FAIL** | process exit 1 signal null:  node:internal/modules/run_main:107     triggerUncaughtException(     ^ unwind Thrown at:     at asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:107:5)   Node.js v24.21.0  |
| callback-mipSolution | **FAIL** | process exit 1 signal null:  node:internal/modules/run_main:107     triggerUncaughtException(     ^ unwind Thrown at:     at asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:107:5)   Node.js v24.21.0  |
| callback-mipImprovingSolution | **FAIL** | process exit 1 signal null:  node:internal/modules/run_main:107     triggerUncaughtException(     ^ unwind Thrown at:     at asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:107:5)   Node.js v24.21.0  |
| callback-mipLogging | **FAIL** | process exit 1 signal null:  node:internal/modules/run_main:107     triggerUncaughtException(     ^ unwind Thrown at:     at asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:107:5)   Node.js v24.21.0  |
| callback-mipInterrupt | **FAIL** | process exit 1 signal null:  node:internal/modules/run_main:107     triggerUncaughtException(     ^ unwind Thrown at:     at asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:107:5)   Node.js v24.21.0  |
| callback-mipCutPool | **FAIL** | process exit 1 signal null:  node:internal/modules/run_main:107     triggerUncaughtException(     ^ unwind Thrown at:     at asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:107:5)   Node.js v24.21.0  |
| callback-mipUserSolution | **FAIL** | process exit 1 signal null:  node:internal/modules/run_main:107     triggerUncaughtException(     ^ unwind Thrown at:     at asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:107:5)   Node.js v24.21.0  |

