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
HighsMipSolver.cpp.o wasm info: {"memories":[{"import":"env.__linear_memory","shared":false,"minPages":1,"maxPages":null,"minMB":0.0625}],"features":["+bulk-memory","+bulk-memory-opt","+call-indirect-overlong","+multivalue","+mutable-globals","+nontrapping-fptoint","+reference-types","+sign-ext","-shared-mem"],"threadImports":["env._ZTHN17HighsTaskExecutor25threadLocalWorkerDequePtrE","env._ZN17HighsLpRelaxation22notifyCutPoolsLpCopiedEi","env._ZNSt3__218condition_variable10notify_oneEv","env._ZNSt3__218condition_variable4waitERNS_11unique_lockINS_5mutexEEE","GOT.func._ZTHN17HighsTaskExecutor25threadLocalWorkerDequePtrE","GOT.mem._ZN17HighsTaskExecutor25threadLocalWorkerDequePtrE"],"exceptionTags":0}
highs.wasm info: {"memories":[{"defined":true,"shared":false,"minPages":324,"maxPages":32768,"minMB":20.25,"maxMB":2048}],"features":[],"threadImports":[],"exceptionTags":0}
HConfig.h threading: #define HIGHS_NO_DEFAULT_THREADS
cmake: -- Found Threads: TRUE
objects in libhighs.a: 216
compile seconds: 131
link seconds: 48
highs.wasm bytes: 3531385
highs.wasm gzip-9 bytes: 1213959
highs.wasm sha256: 528be4365bea1d4188988646b244263f50320df55782e14d6af5bce7cd45c840
GROWABLE_HEAP view checks in highs.js (pthreads + memory growth): 0
PTHREAD_POOL_SIZE in highs.js:
```
```
variant: pthreads
extra cmake args: -DCMAKE_C_FLAGS=-pthread -fwasm-exceptions -DCMAKE_CXX_FLAGS=-pthread -fwasm-exceptions
extra link flags: -pthread -fwasm-exceptions -sPTHREAD_POOL_SIZE=4 -sPTHREAD_POOL_SIZE_STRICT=2 -sDEFAULT_PTHREAD_STACK_SIZE=4194304 -sMAXIMUM_MEMORY=2147483648
JS glue guarded to main runtime thread: 1
extended API option rule: /concurr/i.test(name)
emcc: emcc (Emscripten gcc/clang-like replacement + linker emulating GNU ld) 6.0.3 (283e2d130132859fde6a4e4c87fd254b38127651)
HiGHS commit: 04024d701f79feb8e2f18bc3df0dffc04ef05088
-- Build type: Release
-- IPO / LTO supported by compiler: YES
-- IPO / LTO: disabled by default when building a static library; set CMAKE_INTERPROCEDURAL_OPTIMIZATION=ON to enable
CMAKE_CXX_FLAGS (cache): -pthread -fwasm-exceptions
CMAKE_CXX_FLAGS_RELEASE (cache): -O3 -DNDEBUG
HighsMipSolver.cpp.o magic:  \0 a s m
HighsMipSolver.cpp.o wasm info: {"memories":[{"import":"env.__linear_memory","shared":false,"minPages":1,"maxPages":null,"minMB":0.0625}],"features":["+atomics","+bulk-memory","+bulk-memory-opt","+call-indirect-overlong","+exception-handling","+multivalue","+mutable-globals","+nontrapping-fptoint","+reference-types","+sign-ext"],"threadImports":["env._ZTHN17HighsTaskExecutor25threadLocalWorkerDequePtrE","env._ZN17HighsLpRelaxation22notifyCutPoolsLpCopiedEi","env._ZNSt3__218condition_variable10notify_oneEv","env._ZNSt3__218condition_variable4waitERNS_11unique_lockINS_5mutexEEE","GOT.mem._ZN17HighsTaskExecutor25threadLocalWorkerDequePtrE","GOT.func._ZTHN17HighsTaskExecutor25threadLocalWorkerDequePtrE"],"exceptionTags":0,"tagImports":1}
highs.wasm info: {"memories":[{"import":"a.a","shared":true,"minPages":256,"maxPages":32768,"minMB":16,"maxMB":2048}],"features":[],"threadImports":[],"exceptionTags":1}
HConfig.h threading: /* #undef HIGHS_NO_DEFAULT_THREADS */
cmake: emcmake: cmake --fresh /home/runner/work/highs-js/highs-js/HiGHS -DZLIB=OFF -DFAST_BUILD=OFF -DBUILD_SHARED_LIBS=OFF -DHIGHSINT64=OFF -DHIGHS_NO_DEFAULT_THREADS=OFF '-DCMAKE_C_FLAGS=-pthread -fwasm-exceptions' '-DCMAKE_CXX_FLAGS=-pthread -fwasm-exceptions' -DCMAKE_TOOLCHAIN_FILE=/home/runner/work/_temp/dd835ccc-6297-4ce9-bb82-41a346ba4683/emsdk-main/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DCMAKE_CROSSCOMPILING_EMULATOR=/home/runner/work/_temp/dd835ccc-6297-4ce9-bb82-41a346ba4683/emsdk-main/node/22.16.0_64bit/bin/node in directory /home/runner/work/highs-js/highs-js/research-build/pthreads
cmake: -- Found Threads: TRUE
cmake: -- Build files have been written to: /home/runner/work/highs-js/highs-js/research-build/pthreads
objects in libhighs.a: 216
compile seconds: 132
link seconds: 52
highs.wasm bytes: 3767382
highs.wasm gzip-9 bytes: 1276075
highs.wasm sha256: eda1040d04bfeee86e679b4d8a9c3c56bf01c57159f853455377d7818e52b682
GROWABLE_HEAP view checks in highs.js (pthreads + memory growth): 0
PTHREAD_POOL_SIZE in highs.js:
```

## Per-variant overview

| variant | threads | parallel | runs | failed | hung | invalid | gap not reached | median load ms | median end-to-end s | median solve s | median CPU/wall | peak Wasm MB (median / max) | max RSS MB (median / max) | RSS after load MB | shared memory | pthread workers after load | max running pthreads | workers after dispose |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

Largest pthread worker count seen in any run: 0 (pool size 4; a larger number would mean Emscripten had to create workers on demand, which deadlocks in a browser).

## Solve time by model and seed (median over repetitions; speed-up = baseline / variant)

| model | tier | seed | baseline s |  | baseline nodes |
|---|---|---|---|---|

## Speed-up summary against the single-thread WebAssembly baseline

| variant | hard pairs faster | hard geo-mean (solve) | hard median | hard range | all pairs geo-mean (solve) | hard geo-mean (end-to-end) | all geo-mean (end-to-end) |
|---|---|---|---|---|---|---|---|

## Repeatability (same variant, model and seed across repetitions)


## JavaScript interface and callback tests (pthreads build)

| test | result | seconds | details |
|---|---|---|---|
| threads-1 | pass | 19.1 | HiGHS header {"threadCount":1,"hardwareThreads":4,"maxWorkers":1,"parallelSearch":"off"} (expected 1 threads, 1 workers); pthreads running during solve 0 (expected 0); CPU/wall 1.10; optimal in 18.8 s, 1179 nodes, 113947 LP iterations; valid true; gap reached true; pthreads after dispose {"running":0,"unused":4,"total":4} |
| threads-2 | pass | 6.2 | HiGHS header {"threadCount":2,"hardwareThreads":4,"maxWorkers":4,"parallelSearch":"on"} (expected 2 threads, 4 workers); pthreads running during solve 1 (expected 1); CPU/wall 1.92; optimal in 6.0 s, 593 nodes, 79062 LP iterations; valid true; gap reached true; pthreads after dispose {"running":0,"unused":4,"total":4} |
| threads-4 | pass | 9.2 | HiGHS header {"threadCount":4,"hardwareThreads":4,"maxWorkers":7,"parallelSearch":"on"} (expected 4 threads, 7 workers); pthreads running during solve 3 (expected 3); CPU/wall 2.86; optimal in 9.0 s, 997 nodes, 116801 LP iterations; valid true; gap reached true; pthreads after dispose {"running":0,"unused":4,"total":4} |
| callbacks-all | pass | 9.2 | status optimal in 9.0 s; calls {"logging":46,"simplexInterrupt":0,"ipmInterrupt":0,"mipSolution":10,"mipImprovingSolution":7,"mipLogging":9,"mipInterrupt":110,"mipCutPool":1,"mipUserSolution":60}; off-main-thread 0; solution vector lengths [250] (model 250); valid true; gap reached true |
| interrupt | pass | 15.4 | status interrupted; interrupt latency 1 ms; solution valid true; pthreads before dispose {"running":3,"unused":1,"total":4}, after {"running":0,"unused":4,"total":4}; next solve optimal valid true |
| repeated-solves | pass | 99.8 | statuses optimal,optimal,optimal,optimal,optimal,optimal,optimal,optimal,optimal,optimal; gap reached true,true,true,true,true,true,true,true,true,true; nodes 2211,2129,1819,1633,1403,2168,1919,1916,1739,1290; pthreads running mid-solve 3,3,3,3,3,3,3,3,3,3; CPU/wall 2.90,2.64,2.75,2.61,2.82,2.83,2.62,2.51,2.76,2.62; ms 12035,9840,9820,9179,9107,11402,9338,10981,8899,8925; dispose ms 0.7,0.1,0.5,0.3,0.2,0.3,1.5,0.3,0.2,0.2; max workers 4; OS threads after 11 |
| rerun-and-thread-change | pass | 30.3 | run1 timeLimit valid true; run2 timeLimit valid true; threads 4→2 without dispose: throws "run failed with HiGHS status -1"; after dispose threads=2: timeLimit valid true, CPU/wall 1.68 |
| two-models | pass | 15.2 | A timeLimit; B (shares A's scheduler) timeLimit valid true; B re-run after A disposed: timeLimit valid true; pthreads now {"running":0,"unused":4,"total":4} |
| interrupt-immediate | pass | 12.2 | status interrupted after 66 ms, 1 interrupt call(s); pthreads after dispose {"running":0,"unused":4,"total":4}; next solve optimal, valid true, gap reached true |
| user-solution | pass | 17.4 | queries 60; first offer {"status":{"status":0}}; injected objective 3089.999999999977; first improving objectives [3503,3231,3113.000000000002]; log lines with source X 0; accepted false; final optimal, valid true |
| solver-reset | **FAIL** | 23.5 | exception: TypeError: model.resetOptions is not a function     at solver-reset (file:///home/runner/work/highs-js/highs-js/research/scripts/pthread-api-test.mjs:196:11)     at file:///home/runner/work/highs-js/highs-js/research/scripts/pthread-api-test.mjs:435:36; stderr:  |
| malformed-lp | pass | 12.3 | malformed LP -> HighsError: readModel failed with HiGHS status -1; next solve optimal valid true gap true |
| oom-threads-1 | recorded | 1.7 | cap 40 MB, threads 1: run threw undefined: [object WebAssembly.Exception]; dispose ok; tiny solve afterwards: Optimal 8; stderr:  |
| oom-threads-4 | recorded | 0.5 | cap 40 MB, threads 4: run threw undefined: [object WebAssembly.Exception]; dispose ok; tiny solve afterwards: Optimal 8; stderr:  |
| legacy-solve | **FAIL** | 20.3 | [{"status":"Time limit reached","obj":58066.999999992324,"ms":10046.236362},{"status":"Time limit reached","obj":58066.999999992324,"ms":10017.088839}]; pthreads {"running":0,"unused":4,"total":4} |
| terminate-worker | pass | 15.1 | OS threads: before 11, during 4-thread solve 16, 1.5 s after terminate 11, at end 11; terminate() resolved in 7 ms (3.0 s into the solve); second Worker: optimal valid true in 8.6 s |
| callback-logging | pass | 9.2 | status optimal in 9.0 s; calls {"logging":46}; off-main-thread 0; solution vector lengths [] (model 250); valid true; gap reached true |
| callback-simplexInterrupt | pass | 9.2 | status optimal in 9.0 s; calls {"simplexInterrupt":0}; off-main-thread 0; solution vector lengths [] (model 250); valid true; gap reached true |
| callback-ipmInterrupt | pass | 9.2 | status optimal in 9.0 s; calls {"ipmInterrupt":0}; off-main-thread 0; solution vector lengths [] (model 250); valid true; gap reached true |
| callback-mipSolution | pass | 9.3 | status optimal in 9.0 s; calls {"mipSolution":10}; off-main-thread 0; solution vector lengths [250] (model 250); valid true; gap reached true |
| callback-mipImprovingSolution | pass | 9.2 | status optimal in 9.0 s; calls {"mipImprovingSolution":7}; off-main-thread 0; solution vector lengths [250] (model 250); valid true; gap reached true |
| callback-mipLogging | pass | 9.2 | status optimal in 9.0 s; calls {"mipLogging":9}; off-main-thread 0; solution vector lengths [] (model 250); valid true; gap reached true |
| callback-mipInterrupt | pass | 9.3 | status optimal in 9.0 s; calls {"mipInterrupt":110}; off-main-thread 0; solution vector lengths [] (model 250); valid true; gap reached true |
| callback-mipCutPool | pass | 9.2 | status optimal in 9.0 s; calls {"mipCutPool":1}; off-main-thread 0; solution vector lengths [] (model 250); valid true; gap reached true |
| callback-mipUserSolution | pass | 9.2 | status optimal in 9.0 s; calls {"mipUserSolution":60}; off-main-thread 0; solution vector lengths [] (model 250); valid true; gap reached true |

## JavaScript interface and callback tests (single-thread baseline build, same build-independent tests)

| test | result | seconds | details |
|---|---|---|---|
| interrupt-immediate | pass | 14.7 | status interrupted after 55 ms, 1 interrupt call(s); pthreads after dispose null; next solve optimal, valid true, gap reached true |
| user-solution | pass | 37.2 | queries 337; first offer {"status":{"status":0}}; injected objective 3090.0000000000005; first improving objectives [3503,3231,3113.000000000002]; log lines with source X 0; accepted false; final optimal, valid true |
| solver-reset | **FAIL** | 31.6 | exception: TypeError: model.resetOptions is not a function     at solver-reset (file:///home/runner/work/highs-js/highs-js/research/scripts/pthread-api-test.mjs:196:11)     at file:///home/runner/work/highs-js/highs-js/research/scripts/pthread-api-test.mjs:435:36; stderr:  |
| malformed-lp | pass | 14.5 | malformed LP -> RuntimeError: Aborted(undefined). Build with -sASSERTIONS for more info.; next solve optimal valid true gap true |
| callback-mipImprovingSolution | pass | 18.4 | status optimal in 18.3 s; calls {"mipImprovingSolution":7}; off-main-thread 0; solution vector lengths [250] (model 250); valid true; gap reached true |
| callback-mipLogging | pass | 18.4 | status optimal in 18.3 s; calls {"mipLogging":12}; off-main-thread 0; solution vector lengths [] (model 250); valid true; gap reached true |

