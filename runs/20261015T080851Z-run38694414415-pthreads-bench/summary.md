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
compile seconds: 70
link seconds: 29
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
cmake: emcmake: cmake --fresh /home/runner/work/highs-js/highs-js/HiGHS -DZLIB=OFF -DFAST_BUILD=OFF -DBUILD_SHARED_LIBS=OFF -DHIGHSINT64=OFF -DHIGHS_NO_DEFAULT_THREADS=OFF '-DCMAKE_C_FLAGS=-pthread -fwasm-exceptions' '-DCMAKE_CXX_FLAGS=-pthread -fwasm-exceptions' -DCMAKE_TOOLCHAIN_FILE=/home/runner/work/_temp/4dddcbd4-406b-4a9c-b597-5c8a542e816a/emsdk-main/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -DCMAKE_CROSSCOMPILING_EMULATOR=/home/runner/work/_temp/4dddcbd4-406b-4a9c-b597-5c8a542e816a/emsdk-main/node/22.16.0_64bit/bin/node in directory /home/runner/work/highs-js/highs-js/research-build/pthreads
cmake: -- Found Threads: TRUE
cmake: -- Build files have been written to: /home/runner/work/highs-js/highs-js/research-build/pthreads
objects in libhighs.a: 216
compile seconds: 134
link seconds: 53
highs.wasm bytes: 3767382
highs.wasm gzip-9 bytes: 1276075
highs.wasm sha256: eda1040d04bfeee86e679b4d8a9c3c56bf01c57159f853455377d7818e52b682
GROWABLE_HEAP view checks in highs.js (pthreads + memory growth): 0
PTHREAD_POOL_SIZE in highs.js:
```

## Per-variant overview

| variant | threads | parallel | runs | failed | hung | invalid | gap not reached | median load ms | median end-to-end s | median solve s | median CPU/wall | peak Wasm MB (median / max) | max RSS MB (median / max) | RSS after load MB | shared memory | pthread workers after load | max running pthreads | workers after dispose |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| baseline | default | default | 48 | 0 | 0 | 0 | 1 | 24 | 11.48 | 11.41 | 1.12 | 67 / 314 | 186 / 408 | 70 | false | – | 0 | – |
| pt1 | 1 | default | 48 | 0 | 0 | 0 | 1 | 84 | 11.69 | 11.54 | 1.11 | 63 / 298 | 253 / 484 | 146 | true | 4 | 0 | 0 running / 4 total |
| pt2 | 2 | on | 48 | 0 | 0 | 0 | 4 | 84 | 7.06 | 6.92 | 1.79 | 83 / 1479 | 276 / 1605 | 146 | true | 4 | 1 | 0 running / 4 total |
| pt4 | 4 | on | 48 | 0 | 0 | 0 | 0 | 85 | 7.03 | 6.89 | 2.74 | 144 / 207 | 319 / 397 | 146 | true | 4 | 3 | 0 running / 4 total |

Largest pthread worker count seen in any run: 4 (pool size 4; a larger number would mean Emscripten had to create workers on demand, which deadlocks in a browser).

## Solve time by model and seed (median over repetitions; speed-up = baseline / variant)

| model | tier | seed | baseline s | pt1 s | pt1 speed-up | pt1 nodes | pt2 s | pt2 speed-up | pt2 nodes | pt4 s | pt4 speed-up | pt4 nodes | baseline nodes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| gapd_a8_j48_s2 | hard | 0 | 11.41 | 11.56 | 0.99× | 611 | 6.87 | 1.66× | 584 | 11.96 | 0.95× | 1168 | 611 |
| gapd_a8_j48_s2 | hard | 1 | 26.50 | 26.99 | 0.98× | 2392 | 10.40 | 2.55× | 1113 | 7.12 | 3.72× | 691 | 2392 |
| gapd_a8_j48_s2 | hard | 2 | 14.78 | 15.39 | 0.96× | 968 | 5.63 | 2.62× | 372 | 7.63 | 1.94× | 858 | 968 |
| gapd_a10_j50_s3 | hard | 0 | 17.90 | 18.25 | 0.98× | 1150 | 11.94 | 1.50× | 742 | 6.29 | 2.85× | 312 | 1150 |
| gapd_a10_j50_s3 | hard | 1 | 19.16 | 19.22 | 1.00× | 1396 | 31.52 | 0.61× | 2351 | 9.29 | 2.06× | 573 | 1396 |
| gapd_a10_j50_s3 | hard | 2 | 26.64 | 27.23 | 0.98× | 1799 | 11.64 | 2.29× | 813 | 7.97 | 3.34× | 569 | 1799 |
| mkp_n150_m10_s1 | hard | 0 | 5.04 | 4.99 | 1.01× | 1326 | 5.48 | 0.92× | 2086 | 2.72 | 1.85× | 1038 | 1326 |
| mkp_n150_m10_s1 | hard | 1 | 9.86 | 9.97 | 0.99× | 2650 | 6.09 | 1.62× | 2317 | 2.23 | 4.42× | 904 | 2650 |
| mkp_n150_m10_s1 | hard | 2 | 1.05 | 1.06 | 0.99× | 50 | 1.30 | 0.81× | 298 | 8.39 | 0.13× | 3992 | 50 |
| gapd_a10_j60_s1 | hard | 0 | 14.66 | 15.15 | 0.97× | 632 | 16.01 | 0.92× | 1159 | 5.41 | 2.71× | 339 | 632 |
| gapd_a10_j60_s1 | hard | 1 | 11.39 | 11.54 | 0.99× | 483 | 23.24 | 0.49× | 1373 | 5.77 | 1.97× | 392 | 483 |
| gapd_a10_j60_s1 | hard | 2 | 33.29 | 34.32 | 0.97× | 1558 | 15.34 | 2.17× | 750 | 13.33 | 2.50× | 992 | 1558 |
| mkp_n200_m10_s2 | hard | 0 | 22.49 | 23.12 | 0.97× | 6102 | **fail** | – | – | 16.89 | 1.33× | 3601 | 6102 |
| mkp_n200_m10_s2 | hard | 1 | 28.22 | 29.66 | 0.95× | 8353 | **fail** | – | – | 7.47 | 3.78× | 827 | 8353 |
| mkp_n200_m10_s2 | hard | 2 | 288.92 | 290.99 | 0.99× | 84207 | 89.05 | 3.24× | 41736 | 23.67 | 12.20× | 4523 | 84207 |
| lotsize_i8_t15_s3 | medium | 0 | 8.36 | 8.44 | 0.99× | 1012 | 6.67 | 1.25× | 1247 | 6.11 | 1.37× | 878 | 1012 |
| lotsize_i8_t15_s3 | medium | 1 | 7.38 | 7.28 | 1.01× | 1085 | 6.57 | 1.12× | 1050 | 5.74 | 1.28× | 1028 | 1085 |
| lotsize_i8_t15_s3 | medium | 2 | 8.26 | 8.25 | 1.00× | 907 | 6.93 | 1.19× | 935 | 5.92 | 1.40× | 1054 | 907 |
| lotsize_i6_t20_s2 | medium | 0 | 9.54 | 9.54 | 1.00× | 1930 | 6.92 | 1.38× | 1575 | 7.80 | 1.22× | 2211 | 1930 |
| lotsize_i6_t20_s2 | medium | 1 | 8.13 | 8.27 | 0.98× | 1844 | 6.98 | 1.16× | 2030 | 6.86 | 1.19× | 2129 | 1844 |
| lotsize_i6_t20_s2 | medium | 2 | 9.26 | 9.23 | 1.00× | 1868 | 6.50 | 1.42× | 1866 | 6.68 | 1.39× | 1819 | 1868 |
| gapd_a5_j50_s4 | medium | 0 | 11.99 | 12.31 | 0.97× | 1179 | 3.90 | 3.07× | 593 | 5.95 | 2.01× | 997 | 1179 |
| gapd_a5_j50_s4 | medium | 1 | 10.77 | 11.12 | 0.97× | 1162 | 3.65 | 2.95× | 522 | 6.97 | 1.55× | 1311 | 1162 |
| gapd_a5_j50_s4 | medium | 2 | 4.10 | 4.21 | 0.97× | 143 | 3.19 | 1.29× | 115 | 3.06 | 1.34× | 111 | 143 |

## Speed-up summary against the single-thread WebAssembly baseline

| variant | hard pairs faster | hard geo-mean (solve) | hard median | hard range | all pairs geo-mean (solve) | hard geo-mean (end-to-end) | all geo-mean (end-to-end) |
|---|---|---|---|---|---|---|---|
| pt1 | 1 of 15 | 0.98× | 0.98× | 0.95× – 1.01× | 0.98× | 0.97× | 0.98× |
| pt2 | 8 of 13 | 1.41× | 1.62× | 0.49× – 3.24× | 1.46× | 1.39× | 1.44× |
| pt4 | 13 of 15 | 2.17× | 2.50× | 0.13× – 12.20× | 1.84× | 2.14× | 1.82× |

## Repeatability (same variant, model and seed across repetitions)

- **baseline**: search path differed between repetitions in 1 of 24 model-seed groups; median (max − min)/median time spread 1.4 %, worst 6.4 %.
- **pt1**: search path differed between repetitions in 1 of 24 model-seed groups; median (max − min)/median time spread 1.8 %, worst 5.5 %.
- **pt2**: search path differed between repetitions in 2 of 24 model-seed groups; median (max − min)/median time spread 1.6 %, worst 6.6 %.
- **pt4**: search path differed between repetitions in 0 of 24 model-seed groups; median (max − min)/median time spread 1.6 %, worst 6.9 %.
- pt1 (pthreads build, threads=1) followed the baseline's exact search path in 23 of 24 model-seed groups.

## Failures

- pt1 mkp_n200_m10_s2 seed 2: 1 of 2 runs failed or were invalid

## Outcomes per configuration

| configuration | runs | good | censored (time limit) | failed / invalid / hung | total solve time s | total end-to-end time s (incl. Node start, load, parse, check, dispose) | total CPU time s | CPU / wall (total) | median active pthreads during solve |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 48 | 47 | 1 | 0 | 1229.3 | 1232.7 | 1291.9 | 1.05 | 0 (max 0) |
| pt1 | 48 | 47 | 1 | 0 | 1245.2 | 1252.0 | 1303.9 | 1.05 | 0 (max 0) |
| pt2 | 48 | 44 | 4 | 0 | 1772.3 | 1779.3 | 3140.3 | 1.77 | 1 (max 1) |
| pt4 | 48 | 48 | 0 | 0 | 382.4 | 389.3 | 1045.9 | 2.73 | 3 (max 3) |

## Paired speed-up against the single-thread WebAssembly baseline

Pairs are model × seed; each side is the median of its repetitions. Only pairs where both sides are good enter the statistics. Speed-up = baseline time / configuration time (> 1 is faster).

| configuration | tier | pairs used | geo-mean (solve) | median | worst (largest slowdown) | best | geo-mean (end-to-end) | pairs faster | censored / failed pairs excluded |
|---|---|---|---|---|---|---|---|---|---|
| pt1 | hard | 14 | **0.98×** | 0.98× | 0.95× | 1.01× | 0.97× | 1 of 14 | 1 |
| pt1 | medium | 9 | **0.99×** | 0.99× | 0.97× | 1.01× | 0.98× | 4 of 9 | 0 |
| pt1 | all | 23 | **0.98×** | 0.98× | 0.95× | 1.01× | 0.98× | 5 of 23 | 1 |
| pt2 | hard | 12 | **1.32×** | 1.56× | 0.49× | 2.62× | 1.30× | 7 of 12 | 3 |
| pt2 | medium | 9 | **1.52×** | 1.29× | 1.12× | 3.07× | 1.50× | 9 of 9 | 0 |
| pt2 | all | 21 | **1.40×** | 1.38× | 0.49× | 3.07× | 1.38× | 16 of 21 | 3 |
| pt4 | hard | 14 | **1.92×** | 2.28× | 0.13× | 4.42× | 1.89× | 12 of 14 | 1 |
| pt4 | medium | 9 | **1.40×** | 1.37× | 1.19× | 2.01× | 1.38× | 9 of 9 | 0 |
| pt4 | all | 23 | **1.70×** | 1.85× | 0.13× | 4.42× | 1.67× | 21 of 23 | 1 |

## Per model (medians over seeds and repetitions; seconds)

| model | tier | gap | baseline solve | pt1 solve | pt2 solve | pt4 solve | baseline end-to-end | pt1 end-to-end | pt2 end-to-end | pt4 end-to-end | pt1 speed-up per seed | pt2 speed-up per seed | pt4 speed-up per seed |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| gapd_a8_j48_s2 | hard | 10 | 14.8 | 15.4 | 6.9 | 7.6 | 14.9 | 15.5 | 7.0 | 7.8 | 0: 0.99×, 1: 0.98×, 2: 0.96× | 0: 1.66×, 1: 2.55×, 2: 2.62× | 0: 0.95×, 1: 3.72×, 2: 1.94× |
| gapd_a10_j50_s3 | hard | 20 | 19.2 | 19.2 | 11.9 | 8.0 | 19.2 | 19.4 | 12.1 | 8.1 | 0: 0.98×, 1: 1.00×, 2: 0.98× | 0: 1.50×, 1: 0.61×, 2: 2.29× | 0: 2.85×, 1: 2.06×, 2: 3.34× |
| mkp_n150_m10_s1 | hard | 360 | 5.0 | 5.0 | 5.5 | 2.7 | 5.1 | 5.1 | 5.6 | 2.9 | 0: 1.01×, 1: 0.99×, 2: 0.99× | 0: 0.92×, 1: 1.62×, 2: 0.81× | 0: 1.85×, 1: 4.42×, 2: 0.13× |
| gapd_a10_j60_s1 | hard | 18 | 14.7 | 15.2 | 16.0 | 5.8 | 14.7 | 15.3 | 16.2 | 5.9 | 0: 0.97×, 1: 0.99×, 2: 0.97× | 0: 0.92×, 1: 0.49×, 2: 2.17× | 0: 2.71×, 1: 1.97×, 2: 2.50× |
| mkp_n200_m10_s2 | hard | 180 | 28.2 | 29.7 | 300.2 | 16.9 | 28.3 | 29.8 | 300.3 | 17.0 | 0: 0.97×, 1: 0.95× | – | 0: 1.33×, 1: 3.78× |
| lotsize_i8_t15_s3 | medium | 10 | 8.3 | 8.2 | 6.7 | 5.9 | 8.3 | 8.4 | 6.8 | 6.1 | 0: 0.99×, 1: 1.01×, 2: 1.00× | 0: 1.25×, 1: 1.12×, 2: 1.19× | 0: 1.37×, 1: 1.28×, 2: 1.40× |
| lotsize_i6_t20_s2 | medium | 10 | 9.3 | 9.2 | 6.9 | 6.9 | 9.3 | 9.4 | 7.0 | 7.0 | 0: 1.00×, 1: 0.98×, 2: 1.00× | 0: 1.38×, 1: 1.16×, 2: 1.42× | 0: 1.22×, 1: 1.19×, 2: 1.39× |
| gapd_a5_j50_s4 | medium | 5 | 10.8 | 11.1 | 3.7 | 6.0 | 10.8 | 11.3 | 3.8 | 6.1 | 0: 0.97×, 1: 0.97×, 2: 0.97× | 0: 3.07×, 1: 2.95×, 2: 1.29× | 0: 2.01×, 1: 1.55×, 2: 1.34× |

## 2 threads versus 4 threads (paired, both good)

- hard: 4 threads faster than 2 in 10 of 13 pairs; time(2 threads)/time(4 threads) geo-mean 1.53×, median 1.90×, range 0.16× – 4.03×.
- medium: 4 threads faster than 2 in 5 of 9 pairs; time(2 threads)/time(4 threads) geo-mean 0.92×, median 1.02×, range 0.52× – 1.17×.
- all: 4 threads faster than 2 in 15 of 22 pairs; time(2 threads)/time(4 threads) geo-mean 1.24×, median 1.15×, range 0.16× – 4.03×.

## Search effort and results (medians over repetitions)

| model | seed | gap target | baseline nodes / LP iters | pt1 nodes / LP iters | pt2 nodes / LP iters | pt4 nodes / LP iters | objective range across configurations | largest final abs gap |
|---|---|---|---|---|---|---|---|---|
| gapd_a8_j48_s2 | 0 | 10 | 611 / 135535 | 611 / 135535 | 584 / 136962 | 1168 / 232740 | 3065.000000000025 – 3068.9999999999955 | 9.000 |
| gapd_a8_j48_s2 | 1 | 10 | 2392 / 333372 | 2392 / 333372 | 1113 / 197195 | 691 / 170051 | 3065.9999999999877 – 3070.999999999999 | 9.000 |
| gapd_a8_j48_s2 | 2 | 10 | 968 / 167342 | 968 / 167342 | 372 / 129407 | 858 / 187576 | 3065.000000000027 – 3071 | 9.000 |
| gapd_a10_j50_s3 | 0 | 20 | 1150 / 246575 | 1150 / 246575 | 742 / 252532 | 312 / 151475 | 3123 – 3139 | 19.00 |
| gapd_a10_j50_s3 | 1 | 20 | 1396 / 290464 | 1396 / 290464 | 2351 / 634237 | 573 / 207874 | 3122.999999999999 – 3141.999999999984 | 19.00 |
| gapd_a10_j50_s3 | 2 | 20 | 1799 / 375167 | 1799 / 375167 | 813 / 246317 | 569 / 187214 | 3136 – 3138.0000000000173 | 19.00 |
| mkp_n150_m10_s1 | 0 | 360 | 1326 / 31643 | 1326 / 31643 | 2086 / 47395 | 1038 / 28249 | 63744.99999999997 – 63793 | 359.0 |
| mkp_n150_m10_s1 | 1 | 360 | 2650 / 55668 | 2650 / 55668 | 2317 / 52044 | 904 / 24296 | 63748 – 63793 | 359.0 |
| mkp_n150_m10_s1 | 2 | 360 | 50 / 5838 | 50 / 5838 | 298 / 13393 | 3992 / 84918 | 63757 – 63793 | 359.0 |
| gapd_a10_j60_s1 | 0 | 18 | 632 / 187052 | 632 / 187052 | 1159 / 289125 | 339 / 131491 | 3874 – 3880 | 17.00 |
| gapd_a10_j60_s1 | 1 | 18 | 483 / 145124 | 483 / 145124 | 1373 / 401144 | 392 / 136908 | 3873.9999999999986 – 3877 | 17.00 |
| gapd_a10_j60_s1 | 2 | 18 | 1558 / 398429 | 1558 / 398429 | 750 / 222514 | 992 / 260191 | 3879 – 3880.999999999996 | 17.00 |
| mkp_n200_m10_s2 | 0 | 180 | 6102 / 103941 | 6102 / 103941 | 128545.5 / 2139479.5 (censored) | 3601 / 76693 | 85588.00000000736 – 85700.00000000001 | 199.0 |
| mkp_n200_m10_s2 | 1 | 180 | 8353 / 135151 | 8353 / 135151 | 130570 / 2165861 (censored) | 827 / 32772 | 85602 – 85700 | 182.5 |
| mkp_n200_m10_s2 | 2 | 180 | 83834.5 / 1445298.5 (censored) | 83562.5 / 1440669 (censored) | 41736 / 675113 | 4523 / 107622 | 85605.5000000021 – 85700.00000000176 | 193.5 |
| lotsize_i8_t15_s3 | 0 | 10 | 1012 / 92350 | 1012 / 92350 | 1247 / 116315 | 878 / 127180 | 60951.99999999999 – 60952 | 9.992 |
| lotsize_i8_t15_s3 | 1 | 10 | 1085 / 83282 | 1085 / 83282 | 1050 / 125668 | 1028 / 140036 | 60952 – 60952.00000000001 | 9.809 |
| lotsize_i8_t15_s3 | 2 | 10 | 907 / 97098 | 907 / 97098 | 935 / 125397 | 1054 / 136416 | 60952 – 60952.00000000002 | 9.751 |
| lotsize_i6_t20_s2 | 0 | 10 | 1930 / 100172 | 1930 / 100172 | 1575 / 123974 | 2211 / 204963 | 57667.99999999942 – 57674.99999999999 | 9.960 |
| lotsize_i6_t20_s2 | 1 | 10 | 1844 / 95648 | 1844 / 95648 | 2030 / 138655 | 2129 / 156972 | 57667.99999999964 – 57675.00000000003 | 9.870 |
| lotsize_i6_t20_s2 | 2 | 10 | 1868 / 104263 | 1868 / 104263 | 1866 / 141265 | 1819 / 156471 | 57667.999999992324 – 57675 | 9.745 |
| gapd_a5_j50_s4 | 0 | 5 | 1179 / 113947 | 1179 / 113947 | 593 / 79062 | 997 / 116801 | 3089.999999999977 – 3090.0000000000005 | 2.000 |
| gapd_a5_j50_s4 | 1 | 5 | 1162 / 101167 | 1162 / 101167 | 522 / 65451 | 1311 / 126005 | 3089.999999999994 – 3090 | 2.000 |
| gapd_a5_j50_s4 | 2 | 5 | 143 / 43108 | 143 / 43108 | 115 / 45509 | 111 / 49676 | 3093.999999999999 – 3093.999999999999 | 4.000 |

Largest objective difference between any two configurations on the same model/seed, as a fraction of that model's stopping gap: 0.950 (each configuration stops anywhere within its gap, so up to 1.0 is expected; > 1 would indicate a wrong answer).

## Memory and start-up

| configuration | peak Wasm memory MB (median / max) | max process RSS MB (median / max) | Wasm memory after load MB | RSS after load MB | load + instantiate ms (median / p90 / max) | dispose ms (median / max) |
|---|---|---|---|---|---|---|
| baseline | 67 / 314 | 186 / 408 | 20 | 70 | 24 / 27 / 47 | 0.1 / 0.2 |
| pt1 | 63 / 298 | 253 / 484 | 16 | 146 | 84 / 94 / 110 | 0.1 / 0.2 |
| pt2 | 83 / 1479 | 276 / 1605 | 16 | 146 | 84 / 90 / 99 | 0.4 / 0.4 |
| pt4 | 144 / 207 | 319 / 397 | 16 | 146 | 85 / 93 / 104 | 0.5 / 0.7 |

- pt1: load/start-up 60 ms more than the baseline (median), which includes starting the 4-worker pthread pool.
- pt2: load/start-up 60 ms more than the baseline (median), which includes starting the 4-worker pthread pool.
- pt4: load/start-up 60 ms more than the baseline (median), which includes starting the 4-worker pthread pool.

## Errors, hangs, time-outs, invalid results

- pt2 mkp_n200_m10_s2 seed 0 rep 0: censored status timeLimit, valid true, abs gap 198.99999999263673
- pt2 mkp_n200_m10_s2 seed 0 rep 1: censored status timeLimit, valid true, abs gap 198.99999999263673
- pt2 mkp_n200_m10_s2 seed 1 rep 0: censored status timeLimit, valid true, abs gap 183
- pt2 mkp_n200_m10_s2 seed 1 rep 1: censored status timeLimit, valid true, abs gap 182
- baseline mkp_n200_m10_s2 seed 2 rep 0: censored status timeLimit, valid true, abs gap 210.9999999957945
- pt1 mkp_n200_m10_s2 seed 2 rep 0: censored status timeLimit, valid true, abs gap 210.9999999957945

