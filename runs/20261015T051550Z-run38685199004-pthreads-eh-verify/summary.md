## Builds

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
cmake: emcmake: cmake --fresh /home/runner/work/highs-js/highs-js/HiGHS -DZLIB=OFF -DFAST_BUILD=OFF -DBUILD_SHARED_LIBS=OFF -DHIGHSINT64=OFF -DHIGHS_NO_DEFAULT_THREADS=OFF '-DCMAKE_C_FLAGS=-pthread -fwasm-exceptions' '-DCMAKE_CXX_FLAGS=-pthread -fwasm-exceptions' -DCMAKE_TOOLCHAIN_FILE=/home/runner/work/_temp/fbbbfa30-5880-4d67-9236-68342c23f7dc/emsdk-main/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DCMAKE_CROSSCOMPILING_EMULATOR=/home/runner/work/_temp/fbbbfa30-5880-4d67-9236-68342c23f7dc/emsdk-main/node/22.16.0_64bit/bin/node in directory /home/runner/work/highs-js/highs-js/research-build/pthreads
cmake: -- Found Threads: TRUE
cmake: -- Build files have been written to: /home/runner/work/highs-js/highs-js/research-build/pthreads
objects in libhighs.a: 216
compile seconds: 91
link seconds: 39
highs.wasm bytes: 3767382
highs.wasm gzip-9 bytes: 1276075
highs.wasm sha256: eda1040d04bfeee86e679b4d8a9c3c56bf01c57159f853455377d7818e52b682
GROWABLE_HEAP view checks in highs.js (pthreads + memory growth): 0
PTHREAD_POOL_SIZE in highs.js:
```
```
variant: pthreads-dbg
extra cmake args: -DCMAKE_C_FLAGS=-pthread -fwasm-exceptions -DCMAKE_CXX_FLAGS=-pthread -fwasm-exceptions
extra link flags: -pthread -fwasm-exceptions -sPTHREAD_POOL_SIZE=4 -sPTHREAD_POOL_SIZE_STRICT=2 -sDEFAULT_PTHREAD_STACK_SIZE=4194304 -sMAXIMUM_MEMORY=2147483648 -sASSERTIONS=2 -sPTHREADS_DEBUG=1 --profiling-funcs
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
cmake: emcmake: cmake --fresh /home/runner/work/highs-js/highs-js/HiGHS -DZLIB=OFF -DFAST_BUILD=OFF -DBUILD_SHARED_LIBS=OFF -DHIGHSINT64=OFF -DHIGHS_NO_DEFAULT_THREADS=OFF '-DCMAKE_C_FLAGS=-pthread -fwasm-exceptions' '-DCMAKE_CXX_FLAGS=-pthread -fwasm-exceptions' -DCMAKE_TOOLCHAIN_FILE=/home/runner/work/_temp/2969e348-35f6-466d-9dd8-65d9149f4651/emsdk-main/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DCMAKE_CROSSCOMPILING_EMULATOR=/home/runner/work/_temp/2969e348-35f6-466d-9dd8-65d9149f4651/emsdk-main/node/22.16.0_64bit/bin/node in directory /home/runner/work/highs-js/highs-js/research-build/pthreads-dbg
cmake: -- Found Threads: TRUE
cmake: -- Build files have been written to: /home/runner/work/highs-js/highs-js/research-build/pthreads-dbg
objects in libhighs.a: 216
compile seconds: 89
link seconds: 39
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

| test | result | details |
|---|---|---|
| threads-1 | pass | HiGHS header {"threadCount":1,"hardwareThreads":4,"maxWorkers":1,"parallelSearch":"off"} (expected 1 threads, 1 workers); pthreads running during solve 0 (expected 0); CPU/wall 1.09; optimal in 15.5 s, 1179 nodes, 113947 LP iterations; valid true; gap reached true; pthreads after dispose {"running":0,"unused":4,"total":4} |
| threads-2 | pass | HiGHS header {"threadCount":2,"hardwareThreads":4,"maxWorkers":4,"parallelSearch":"on"} (expected 2 threads, 4 workers); pthreads running during solve 1 (expected 1); CPU/wall 1.90; optimal in 4.9 s, 593 nodes, 79062 LP iterations; valid true; gap reached true; pthreads after dispose {"running":0,"unused":4,"total":4} |
| threads-4 | pass | HiGHS header {"threadCount":4,"hardwareThreads":4,"maxWorkers":7,"parallelSearch":"on"} (expected 4 threads, 7 workers); pthreads running during solve 3 (expected 3); CPU/wall 2.91; optimal in 7.2 s, 997 nodes, 116801 LP iterations; valid true; gap reached true; pthreads after dispose {"running":0,"unused":4,"total":4} |
| repeated-solves | pass | statuses optimal,optimal,optimal,optimal,optimal,optimal,optimal,optimal,optimal,optimal; gap reached true,true,true,true,true,true,true,true,true,true; nodes 2211,2129,1819,1633,1403,2168,1919,1916,1739,1290; pthreads running mid-solve 3,3,3,3,3,3,3,3,3,3; CPU/wall 2.92,2.65,2.79,2.63,2.83,2.80,2.65,2.52,2.75,2.64; ms 9593,7865,7750,7288,7235,9267,7496,8831,7189,7139; dispose ms 0.6,0.1,0.4,0.1,0.3,0.2,3.0,0.2,0.1,0.4; max workers 4; OS threads after 11 |

