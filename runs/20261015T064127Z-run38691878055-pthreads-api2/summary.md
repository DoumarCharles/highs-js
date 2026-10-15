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
compile seconds: 65
link seconds: 28
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
cmake: emcmake: cmake --fresh /home/runner/work/highs-js/highs-js/HiGHS -DZLIB=OFF -DFAST_BUILD=OFF -DBUILD_SHARED_LIBS=OFF -DHIGHSINT64=OFF -DHIGHS_NO_DEFAULT_THREADS=OFF '-DCMAKE_C_FLAGS=-pthread -fwasm-exceptions' '-DCMAKE_CXX_FLAGS=-pthread -fwasm-exceptions' -DCMAKE_TOOLCHAIN_FILE=/home/runner/work/_temp/c853840c-22f9-473d-88a5-b7fc29b9f800/emsdk-main/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DCMAKE_CROSSCOMPILING_EMULATOR=/home/runner/work/_temp/c853840c-22f9-473d-88a5-b7fc29b9f800/emsdk-main/node/22.16.0_64bit/bin/node in directory /home/runner/work/highs-js/highs-js/research-build/pthreads
cmake: -- Found Threads: TRUE
cmake: -- Build files have been written to: /home/runner/work/highs-js/highs-js/research-build/pthreads
objects in libhighs.a: 216
compile seconds: 130
link seconds: 50
highs.wasm bytes: 3767382
highs.wasm gzip-9 bytes: 1276075
highs.wasm sha256: eda1040d04bfeee86e679b4d8a9c3c56bf01c57159f853455377d7818e52b682
GROWABLE_HEAP view checks in highs.js (pthreads + memory growth): 0
PTHREAD_POOL_SIZE in highs.js:
```
```
variant: pthreads-dbg
extra cmake args: -DCMAKE_C_FLAGS=-pthread -fwasm-exceptions -DCMAKE_CXX_FLAGS=-pthread -fwasm-exceptions
extra link flags: -pthread -fwasm-exceptions -sPTHREAD_POOL_SIZE=4 -sPTHREAD_POOL_SIZE_STRICT=2 -sDEFAULT_PTHREAD_STACK_SIZE=4194304 -sMAXIMUM_MEMORY=2147483648 -sASSERTIONS=2 -sPTHREADS_DEBUG=1 --profiling-funcs -sEXPORT_EXCEPTION_HANDLING_HELPERS=1
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
highs.wasm info: {"memories":[{"import":"env.memory","shared":true,"minPages":256,"maxPages":32768,"minMB":16,"maxMB":2048}],"features":[],"threadImports":["env._emscripten_thread_set_strongref","env._emscripten_init_main_thread_js","env._emscripten_thread_mailbox_await","env._emscripten_receive_on_main_thread_js","env.__pthread_create_js","env._emscripten_thread_cleanup","env._emscripten_notify_mailbox_postmessage"],"exceptionTags":1}
HConfig.h threading: /* #undef HIGHS_NO_DEFAULT_THREADS */
cmake: emcmake: cmake --fresh /home/runner/work/highs-js/highs-js/HiGHS -DZLIB=OFF -DFAST_BUILD=OFF -DBUILD_SHARED_LIBS=OFF -DHIGHSINT64=OFF -DHIGHS_NO_DEFAULT_THREADS=OFF '-DCMAKE_C_FLAGS=-pthread -fwasm-exceptions' '-DCMAKE_CXX_FLAGS=-pthread -fwasm-exceptions' -DCMAKE_TOOLCHAIN_FILE=/home/runner/work/_temp/90f1a276-ca6f-4ed3-bba2-f6a9708e83e9/emsdk-main/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DCMAKE_CROSSCOMPILING_EMULATOR=/home/runner/work/_temp/90f1a276-ca6f-4ed3-bba2-f6a9708e83e9/emsdk-main/node/22.16.0_64bit/bin/node in directory /home/runner/work/highs-js/highs-js/research-build/pthreads-dbg
cmake: -- Found Threads: TRUE
cmake: -- Build files have been written to: /home/runner/work/highs-js/highs-js/research-build/pthreads-dbg
objects in libhighs.a: 216
compile seconds: 65
link seconds: 31
highs.wasm bytes: 4623007
highs.wasm gzip-9 bytes: 1372003
highs.wasm sha256: 4e130be9bbff9842a37279ab510dd605e2801cc999c085d6dff13ed164c140df
GROWABLE_HEAP view checks in highs.js (pthreads + memory growth): 0
PTHREAD_POOL_SIZE in highs.js: PTHREAD_POOL_SIZE=...`.")
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
| threads-1 | pass | 18.8 | HiGHS header {"threadCount":1,"hardwareThreads":4,"maxWorkers":1,"parallelSearch":"off"} (expected 1 threads, 1 workers); pthreads running during solve 0 (expected 0); CPU/wall 1.10; optimal in 18.6 s, 1179 nodes, 113947 LP iterations; valid true; gap reached true; pthreads after dispose {"running":0,"unused":4,"total":4} |
| threads-2 | pass | 6.1 | HiGHS header {"threadCount":2,"hardwareThreads":4,"maxWorkers":4,"parallelSearch":"on"} (expected 2 threads, 4 workers); pthreads running during solve 1 (expected 1); CPU/wall 1.91; optimal in 5.9 s, 593 nodes, 79062 LP iterations; valid true; gap reached true; pthreads after dispose {"running":0,"unused":4,"total":4} |
| threads-4 | pass | 9.1 | HiGHS header {"threadCount":4,"hardwareThreads":4,"maxWorkers":7,"parallelSearch":"on"} (expected 4 threads, 7 workers); pthreads running during solve 3 (expected 3); CPU/wall 2.84; optimal in 8.9 s, 997 nodes, 116801 LP iterations; valid true; gap reached true; pthreads after dispose {"running":0,"unused":4,"total":4} |
| callbacks-all | pass | 9.2 | status optimal in 9.0 s; calls {"logging":46,"simplexInterrupt":0,"ipmInterrupt":0,"mipSolution":10,"mipImprovingSolution":7,"mipLogging":9,"mipInterrupt":110,"mipCutPool":1,"mipUserSolution":60}; off-main-thread 0; solution vector lengths [250] (model 250); valid true; gap reached true |
| interrupt | pass | 15.4 | status interrupted; interrupt latency 2 ms; solution valid true; pthreads before dispose {"running":3,"unused":1,"total":4}, after {"running":0,"unused":4,"total":4}; next solve optimal valid true |
| repeated-solves | pass | 99.4 | statuses optimal,optimal,optimal,optimal,optimal,optimal,optimal,optimal,optimal,optimal; gap reached true,true,true,true,true,true,true,true,true,true; nodes 2211,2129,1819,1633,1403,2168,1919,1916,1739,1290; pthreads running mid-solve 3,3,3,3,3,3,3,3,3,3; CPU/wall 2.91,2.65,2.79,2.60,2.81,2.83,2.63,2.52,2.75,2.63; ms 11978,9814,9647,9162,9048,11415,9341,10934,8949,8868; dispose ms 0.6,0.2,0.2,0.3,0.2,0.2,0.1,0.2,0.2,0.2; max workers 4; OS threads after 11 |
| rerun-and-thread-change | pass | 34.1 | run1 optimal valid true; run2 optimal valid true; threads 4→2 without dispose: throws "run failed with HiGHS status -1"; after dispose threads=2: optimal valid true, CPU/wall 1.67 |
| two-models | pass | 15.2 | A timeLimit; B (shares A's scheduler) timeLimit valid true; B re-run after A disposed: timeLimit valid true; pthreads now {"running":0,"unused":4,"total":4} |
| interrupt-immediate | pass | 12.2 | status interrupted after 72 ms, 1 interrupt call(s); pthreads after dispose {"running":0,"unused":4,"total":4}; next solve optimal, valid true, gap reached true |
| user-solution | pass | 17.4 | queries 60; first offer {"status":{"status":0}}; injected objective 3089.999999999977; first improving objectives [3503,3231,3113.000000000002]; log lines with source X 0; accepted false; final optimal, valid true |
| solver-reset | pass | 34.6 | [{"label":"first","status":"optimal","valid":true,"gap":true,"nodes":2211},{"label":"clearSolver+seed7","status":"optimal","valid":true,"gap":true,"nodes":1916},{"label":"options.reset","status":"optimal","valid":true,"gap":true,"nodes":2211}]; pthreads after dispose {"running":0,"unused":4,"total":4} |
| malformed-lp | pass | 12.2 | malformed LP -> HighsError: readModel failed with HiGHS status -1; next solve optimal valid true gap true |
| oom-threads-1-cap40 | recorded | 1.7 | cap 40 MB, threads 1: run threw Exception: [object WebAssembly.Exception] after 1473 ms (0 MIP log lines, last node count 0; peak pthreads {"running":0,"unused":4,"total":4}); dispose ok; tiny solve afterwards: Optimal 8; stderr:  |
| oom-threads-4-cap40 | recorded | 0.5 | cap 40 MB, threads 4: run threw Exception: [object WebAssembly.Exception] after 298 ms (0 MIP log lines, last node count 0; peak pthreads {"running":3,"unused":1,"total":4}); dispose ok; tiny solve afterwards: Optimal 8; stderr:  |
| oom-threads-4-cap64 | recorded | 1.5 | cap 64 MB, threads 4: run threw RuntimeError: unreachable after 1341 ms (0 MIP log lines, last node count 0; peak pthreads {"running":3,"unused":1,"total":4}); dispose threw unwind; tiny solve afterwards: Optimal 8; stderr: Aborted() |
| oom-threads-4-cap96 | recorded | 3.8 | cap 96 MB, threads 4: run threw Exception: [object WebAssembly.Exception] after 3548 ms (0 MIP log lines, last node count 0; peak pthreads {"running":3,"unused":1,"total":4}); dispose ok; tiny solve afterwards: Optimal 8; stderr:  |
| oom-threads-4-nocap | recorded | 26.3 | cap none (2 GB), threads 4: run returned optimal after 26082 ms (0 MIP log lines, last node count 0; peak pthreads {"running":3,"unused":1,"total":4}); dispose ok; tiny solve afterwards: Optimal 8; stderr:  |
| legacy-solve | pass | 23.9 | [{"status":"Optimal","obj":57667.99999999942,"valid":true,"ms":12084},{"status":"Optimal","obj":57667.99999999942,"valid":true,"ms":11632}]; pthreads {"running":0,"unused":4,"total":4} |
| terminate-worker | pass | 15.1 | OS threads: before 11, during 4-thread solve 16, 1.5 s after terminate 11, at end 11; terminate() resolved in 12 ms (3.0 s into the solve); second Worker: optimal valid true in 8.6 s |
| callback-logging | pass | 9.4 | status optimal in 9.2 s; calls {"logging":46}; off-main-thread 0; solution vector lengths [] (model 250); valid true; gap reached true |
| callback-simplexInterrupt | pass | 9.2 | status optimal in 9.0 s; calls {"simplexInterrupt":0}; off-main-thread 0; solution vector lengths [] (model 250); valid true; gap reached true |
| callback-ipmInterrupt | pass | 9.1 | status optimal in 8.9 s; calls {"ipmInterrupt":0}; off-main-thread 0; solution vector lengths [] (model 250); valid true; gap reached true |
| callback-mipSolution | pass | 9.2 | status optimal in 9.0 s; calls {"mipSolution":10}; off-main-thread 0; solution vector lengths [250] (model 250); valid true; gap reached true |
| callback-mipImprovingSolution | pass | 9.2 | status optimal in 9.0 s; calls {"mipImprovingSolution":7}; off-main-thread 0; solution vector lengths [250] (model 250); valid true; gap reached true |
| callback-mipLogging | pass | 9.3 | status optimal in 9.1 s; calls {"mipLogging":9}; off-main-thread 0; solution vector lengths [] (model 250); valid true; gap reached true |
| callback-mipInterrupt | pass | 9.3 | status optimal in 9.1 s; calls {"mipInterrupt":110}; off-main-thread 0; solution vector lengths [] (model 250); valid true; gap reached true |
| callback-mipCutPool | pass | 9.3 | status optimal in 9.0 s; calls {"mipCutPool":1}; off-main-thread 0; solution vector lengths [] (model 250); valid true; gap reached true |
| callback-mipUserSolution | pass | 9.2 | status optimal in 9.0 s; calls {"mipUserSolution":60}; off-main-thread 0; solution vector lengths [] (model 250); valid true; gap reached true |

## JavaScript interface and callback tests (single-thread baseline build, same build-independent tests)

| test | result | seconds | details |
|---|---|---|---|
| interrupt-immediate | pass | 14.4 | status interrupted after 58 ms, 1 interrupt call(s); pthreads after dispose null; next solve optimal, valid true, gap reached true |
| user-solution | pass | 35.9 | queries 337; first offer {"status":{"status":0}}; injected objective 3090.0000000000005; first improving objectives [3503,3231,3113.000000000002]; log lines with source X 0; accepted false; final optimal, valid true |
| solver-reset | pass | 45.5 | [{"label":"first","status":"optimal","valid":true,"gap":true,"nodes":1930},{"label":"clearSolver+seed7","status":"optimal","valid":true,"gap":true,"nodes":2386},{"label":"options.reset","status":"optimal","valid":true,"gap":true,"nodes":1930}]; pthreads after dispose null |
| malformed-lp | pass | 14.5 | malformed LP -> RuntimeError: Aborted(undefined). Build with -sASSERTIONS for more info.; next solve optimal valid true gap true |
| legacy-solve | pass | 28.3 | [{"status":"Optimal","obj":57674.99999999999,"valid":true,"ms":14300},{"status":"Optimal","obj":57674.99999999999,"valid":true,"ms":13903}]; pthreads null |
| callback-mipImprovingSolution | pass | 18.3 | status optimal in 18.2 s; calls {"mipImprovingSolution":7}; off-main-thread 0; solution vector lengths [250] (model 250); valid true; gap reached true |
| callback-mipLogging | pass | 18.4 | status optimal in 18.3 s; calls {"mipLogging":12}; off-main-thread 0; solution vector lengths [] (model 250); valid true; gap reached true |

## JavaScript interface and callback tests (pthreads diagnostic build (assertions), out-of-memory tests)

| test | result | seconds | details |
|---|---|---|---|
| oom-threads-1-cap40 | recorded | 1.8 | exception: RuntimeError: unreachable     at highs.wasm.undefined_weak:thread-local initialization routine for HighsTaskExecutor::threadLocalWorkerDequePtr (wasm://wasm/highs.wasm-011a2a7e:wasm-function[33]:0x51db2)     at abort (/home/runner/work/highs-js/highs-js/dist/wasm-pthreads-dbg/highs.js:1:15051)     at Object.get (/home/runner/work/highs-js/highs-js/dist/wasm-pthreads-dbg/highs.js:1:8569)     at oomTest (file:///home/runner/work/highs-js/highs-js/research/scripts/pthread-api-test.mjs:332:103)     at oom-threads-1-cap40 (file:///home/runner/work/highs-js/highs-js/research/scripts/pthread-api-test; stderr: growMemory: Attempted to grow heap from 41943040 bytes to 46137344 bytes, but got error: RangeError: WebAssembly.Memory.grow(): Maximum memory size exceeded / growMemory: Attempted to grow heap from 41943040 bytes to 44892160 bytes, but got error: RangeError: WebAssembly.Memory.grow(): Maximum memory size exceeded / Failed to grow the heap from 41943040 bytes to 44892160 bytes, not enough memory! / growMemory: Attempted to grow heap from 41943040 bytes to 50331648 bytes, but got error: RangeError: WebAssembly.Memory.grow(): Maximum memory size exceeded / growMemory: Attempted to grow heap from 41943040 bytes to 49348608 bytes, but got error: RangeError: WebAssembly.Memory.grow(): Maximum memory size exceeded / growMemory: Attempted to grow heap from 41943040 bytes to 49348608 bytes, but go |
| oom-threads-4-cap40 | recorded | 0.5 | exception: RuntimeError: unreachable     at highs.wasm.undefined_weak:thread-local initialization routine for HighsTaskExecutor::threadLocalWorkerDequePtr (wasm://wasm/highs.wasm-011a2a7e:wasm-function[33]:0x51db2)     at abort (/home/runner/work/highs-js/highs-js/dist/wasm-pthreads-dbg/highs.js:1:15051)     at Object.get (/home/runner/work/highs-js/highs-js/dist/wasm-pthreads-dbg/highs.js:1:8569)     at oomTest (file:///home/runner/work/highs-js/highs-js/research/scripts/pthread-api-test.mjs:332:103)     at oom-threads-4-cap40 (file:///home/runner/work/highs-js/highs-js/research/scripts/pthread-api-test; stderr: growMemory: Attempted to grow heap from 41943040 bytes to 46137344 bytes, but got error: RangeError: WebAssembly.Memory.grow(): Maximum memory size exceeded / growMemory: Attempted to grow heap from 41943040 bytes to 44040192 bytes, but got error: RangeError: WebAssembly.Memory.grow(): Maximum memory size exceeded / Failed to grow the heap from 41943040 bytes to 44040192 bytes, not enough memory! / growMemory: Attempted to grow heap from 41943040 bytes to 50331648 bytes, but got error: RangeError: WebAssembly.Memory.grow(): Maximum memory size exceeded / growMemory: Attempted to grow heap from 41943040 bytes to 46137344 bytes, but got error: RangeError: WebAssembly.Memory.grow(): Maximum memory size exceeded / growMemory: Attempted to grow heap from 41943040 bytes to 44040192 bytes, but go |
| oom-threads-4-cap64 | recorded | 300.1 | HUNG: killed after 300 s |
| oom-threads-4-cap96 | recorded | 4.1 | exception: RuntimeError: unreachable     at highs.wasm.undefined_weak:thread-local initialization routine for HighsTaskExecutor::threadLocalWorkerDequePtr (wasm://wasm/highs.wasm-011a2a7e:wasm-function[33]:0x51db2)     at abort (/home/runner/work/highs-js/highs-js/dist/wasm-pthreads-dbg/highs.js:1:15051)     at Object.get (/home/runner/work/highs-js/highs-js/dist/wasm-pthreads-dbg/highs.js:1:8569)     at oomTest (file:///home/runner/work/highs-js/highs-js/research/scripts/pthread-api-test.mjs:332:103)     at oom-threads-4-cap96 (file:///home/runner/work/highs-js/highs-js/research/scripts/pthread-api-test; stderr: growMemory: Attempted to grow heap from 100663296 bytes to 112132096 bytes, but got error: RangeError: WebAssembly.Memory.grow(): Maximum memory size exceeded / growMemory: Attempted to grow heap from 100663296 bytes to 112132096 bytes, but got error: RangeError: WebAssembly.Memory.grow(): Maximum memory size exceeded / Failed to grow the heap from 100663296 bytes to 112132096 bytes, not enough memory! / growMemory: Attempted to grow heap from 100663296 bytes to 120848384 bytes, but got error: RangeError: WebAssembly.Memory.grow(): Maximum memory size exceeded / growMemory: Attempted to grow heap from 100663296 bytes to 112132096 bytes, but got error: RangeError: WebAssembly.Memory.grow(): Maximum memory size exceeded / growMemory: Attempted to grow heap from 100663296 bytes to 112132096 b |

