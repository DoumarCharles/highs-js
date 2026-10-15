## Builds

```
variant: baseline
extra cmake args: (none)
extra link flags: (none)
emcc: emcc (Emscripten gcc/clang-like replacement + linker emulating GNU ld) 6.0.3 (283e2d130132859fde6a4e4c87fd254b38127651)
HiGHS commit: 04024d701f79feb8e2f18bc3df0dffc04ef05088
-- Build type: Release
-- IPO / LTO supported by compiler: YES
-- IPO / LTO: disabled by default when building a static library; set CMAKE_INTERPROCEDURAL_OPTIMIZATION=ON to enable
CMAKE_CXX_FLAGS (cache): 
CMAKE_CXX_FLAGS_RELEASE (cache): -O3 -DNDEBUG
HighsMipSolver.cpp.o magic:  \0 a s m
compile seconds: 127
link seconds: 48
highs.wasm bytes: 3531385
highs.wasm gzip-9 bytes: 1213959
highs.wasm sha256: 528be4365bea1d4188988646b244263f50320df55782e14d6af5bce7cd45c840
```
```
variant: simd
extra cmake args: -DCMAKE_C_FLAGS=-msimd128 -DCMAKE_CXX_FLAGS=-msimd128 -DCMAKE_PROJECT_INCLUDE=/home/runner/work/highs-js/highs-js/research/simd-exclude.cmake
extra link flags: -msimd128
emcc: emcc (Emscripten gcc/clang-like replacement + linker emulating GNU ld) 6.0.3 (283e2d130132859fde6a4e4c87fd254b38127651)
HiGHS commit: 04024d701f79feb8e2f18bc3df0dffc04ef05088
-- Build type: Release
-- IPO / LTO supported by compiler: YES
-- IPO / LTO: disabled by default when building a static library; set CMAKE_INTERPROCEDURAL_OPTIMIZATION=ON to enable
-- perf-research: mip/HighsSearch.cpp compiled without -msimd128
CMAKE_CXX_FLAGS (cache): -msimd128
CMAKE_CXX_FLAGS_RELEASE (cache): -O3 -DNDEBUG
HighsMipSolver.cpp.o magic:  \0 a s m
compile seconds: 79
link seconds: 32
highs.wasm bytes: 3584601
highs.wasm gzip-9 bytes: 1234424
highs.wasm sha256: 8ebc8406c0948e08acb84ca1eab178bc75acdc542b4565e6598ea1cbecb18024
```

## WebAssembly A/B

Runs: 64 (0 errors). Each row is one model and random seed; times are solve-only medians over the repetitions, in a fresh Node process per run, variants alternating order. Mandatory: valid solution (independent checker) and stop at the production gap. Identical search path (nodes, LP iterations) is informational.

### simd vs baseline

| model | tier | seed | baseline s | candidate s | change | per-rep range | nodes b/c | LP iters b/c | same path | root bound b/c | objective b/c | abs gap b/c (target) | gap reached | valid | Wasm MB b/c | RSS MB b/c |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| gapd_a8_j48_s2 | hard | 0 | 17.49 | 17.26 | **−1.3%** | −1.8% … −0.8% | 611/611 | 135535/135535 | yes | 3049.3/3049.3 | 3066.0/3066.0 | 8.000/8.000 (10) | yes | yes | 105/105 | 210/214 |
| gapd_a8_j48_s2 | hard | 1 | 40.94 | 40.64 | **−0.7%** | −1.2% … −0.3% | 2392/2392 | 333372/333372 | yes | 3050.4/3050.4 | 3070.0/3070.0 | 8.000/8.000 (10) | yes | yes | 105/105 | 204/210 |
| gapd_a10_j50_s3 | hard | 0 | 27.50 | 27.36 | **−0.5%** | −1.1% … +0.2% | 1150/1150 | 246575/246575 | yes | 3107.5/3107.5 | 3123.0/3123.0 | 7.000/7.000 (20) | yes | yes | 61/61 | 181/175 |
| gapd_a10_j50_s3 | hard | 1 | 29.84 | 29.28 | **−1.9%** | −2.8% … −0.9% | 1396/1396 | 290464/290464 | yes | 3107.6/3107.6 | 3123.0/3123.0 | 5.000/5.000 (20) | yes | yes | 88/88 | 204/199 |
| mkp_n150_m10_s1 | hard | 0 | 7.59 | 7.63 | **+0.5%** | +0.1% … +0.9% | 1326/1326 | 31643/31643 | yes | 64196.3/64196.3 | 63745.0/63745.0 | 359.0/359.0 (360) | yes | yes | 24/24 | 161/157 |
| mkp_n150_m10_s1 | hard | 1 | 14.55 | 14.54 | **−0.1%** | −0.2% … −0.1% | 2650/2650 | 55668/55668 | yes | 64196.3/64196.3 | 63793.0/63793.0 | 306.0/306.0 (360) | yes | yes | 29/29 | 166/170 |
| gapd_a10_j60_s1 | hard | 0 | 23.30 | 22.72 | **−2.5%** | −2.9% … −2.1% | 632/632 | 187052/187052 | yes | 3852.6/3852.6 | 3879.0/3879.0 | 17.00/17.00 (18) | yes | yes | 73/73 | 192/183 |
| gapd_a10_j60_s1 | hard | 1 | 17.50 | 17.19 | **−1.8%** | −2.1% … −1.5% | 483/483 | 145124/145124 | yes | 3853.1/3853.1 | 3877.0/3877.0 | 17.00/17.00 (18) | yes | yes | 73/73 | 186/190 |
| mkp_n200_m10_s2 | hard | 0 | 32.70 | 32.59 | **−0.3%** | −1.7% … +1.0% | 6102/6102 | 103941/103941 | yes | 85918.0/85918.0 | 85700.0/85700.0 | 162.0/162.0 (180) | yes | yes | 61/61 | 169/189 |
| mkp_n200_m10_s2 | hard | 1 | 41.35 | 42.17 | **+2.0%** | +1.2% … +2.8% | 8353/8353 | 135151/135151 | yes | 85918.0/85918.0 | 85700.0/85700.0 | 153.0/153.0 (180) | yes | yes | 61/61 | 179/182 |
| lotsize_i8_t15_s3 | medium | 0 | 12.71 | 12.52 | **−1.5%** | −1.5% … −1.5% | 1012/1012 | 92350/92350 | yes | 60129.0/60129.0 | 60952.0/60952.0 | 9.178/9.178 (10) | yes | yes | 20/20 | 158/162 |
| lotsize_i8_t15_s3 | medium | 1 | 11.35 | 11.19 | **−1.4%** | −1.9% … −0.9% | 1085/1085 | 83282/83282 | yes | 60075.7/60075.7 | 60952.0/60952.0 | 9.698/9.698 (10) | yes | yes | 20/20 | 150/151 |
| lotsize_i6_t20_s2 | medium | 0 | 14.46 | 14.28 | **−1.3%** | −1.7% … −0.9% | 1930/1930 | 100172/100172 | yes | 55976.3/55976.3 | 57675.0/57675.0 | 8.528/8.528 (10) | yes | yes | 24/24 | 156/149 |
| lotsize_i6_t20_s2 | medium | 1 | 12.66 | 12.44 | **−1.8%** | −2.0% … −1.5% | 1844/1844 | 95648/95648 | yes | 55886.8/55886.8 | 57675.0/57675.0 | 9.870/9.870 (10) | yes | yes | 20/20 | 167/154 |
| gapd_a5_j50_s4 | medium | 0 | 18.59 | 18.70 | **+0.6%** | −0.6% … +1.8% | 1179/1179 | 113947/113947 | yes | 3083.4/3083.4 | 3090.0/3090.0 | 1.000/1.000 (5) | yes | yes | 73/73 | 187/206 |
| gapd_a5_j50_s4 | medium | 1 | 16.11 | 16.30 | **+1.2%** | +0.9% … +1.5% | 1162/1162 | 101167/101167 | yes | 3083.2/3083.2 | 3090.0/3090.0 | 2.000/2.000 (5) | yes | yes | 126/126 | 236/233 |

**Geometric-mean time ratio simd/baseline: 0.993 (−0.7%) over 16 model-seed pairs; hard tier: 0.993 (−0.7%).**

Total solve time: baseline 677.30 s, simd 673.66 s. Median module load (compile+instantiate): baseline 39 ms, simd 40 ms.

### Checks
- Mandatory checks passed: every solution valid against the independent checker, every run stopped at its production gap.
- Every candidate run followed the identical search path (same nodes and LP iterations) as the baseline, so time differences are pure execution speed.

## Native HiGHS reference (same commit, same runner, after the Wasm runs; one fresh process per solve)

| model | seed | native-t1 s (min–max) | native-on2 s (min–max) | native-on4 s (min–max) | native-t1 nodes | native-on2 nodes | native-on4 nodes | Wasm baseline s | Wasm/native-t1 |
|---|---|---|---|---|---|---|---|---|---|
| gapd_a8_j48_s2 | 0 | 33.60 (32.84–33.70) | 7.98 (7.96–8.04) | 12.21 (12.18–12.22) | 1954 | 433 | 974 | 17.49 | 0.52× |
| gapd_a8_j48_s2 | 1 | 28.67 (28.65–28.88) | 9.77 (9.75–9.82) | 12.81 (12.76–12.87) | 1601 | 453 | 730 | 40.94 | 1.43× |
| gapd_a10_j50_s3 | 0 | 8.13 (8.12–8.17) | 19.08 (18.99–19.14) | 13.68 (13.63–13.75) | 158 | 1430 | 999 | 27.50 | 3.38× |
| gapd_a10_j50_s3 | 1 | 21.31 (21.27–21.51) | 32.19 (32.09–32.50) | 6.27 (6.21–6.27) | 1304 | 1746 | 492 | 29.84 | 1.40× |
| mkp_n150_m10_s1 | 0 | 5.80 (5.78–5.87) | 7.74 (7.62–7.81) | 5.44 (5.36–5.47) | 1392 | 2898 | 2557 | 7.59 | 1.31× |
| mkp_n150_m10_s1 | 1 | 13.92 (13.92–14.02) | 4.99 (4.98–4.99) | 2.62 (2.61–2.66) | 3476 | 2117 | 1172 | 14.55 | 1.05× |
| gapd_a10_j60_s1 | 0 | 48.53 (47.99–49.25) | 11.53 (11.42–11.54) | 16.90 (16.85–16.96) | 2293 | 605 | 1268 | 23.30 | 0.48× |
| gapd_a10_j60_s1 | 1 | 18.32 (18.11–18.36) | 23.98 (23.93–24.29) | 7.99 (7.93–8.01) | 733 | 1337 | 428 | 17.50 | 0.96× |
| mkp_n200_m10_s2 | 0 | 291.85 (290.39–293.73) | 300.00 (300.00–300.00) (gap not reached) | 10.54 (10.31–10.57) | 66237 | 125668, 127995, 123450 | 2897 | 32.70 | 0.11× |
| mkp_n200_m10_s2 | 1 | 228.30 (228.21–232.99) | 97.92 (95.69–97.96) | 15.96 (15.87–16.13) | 51208 | 43765 | 3707 | 41.35 | 0.18× |
| lotsize_i8_t15_s3 | 0 | 13.54 (13.47–13.61) | 9.84 (9.81–9.90) | 7.29 (7.28–7.31) | 1179 | 1250 | 952 | 12.71 | 0.94× |
| lotsize_i8_t15_s3 | 1 | 10.51 (10.45–10.54) | 7.89 (7.88–7.94) | 8.47 (8.46–8.50) | 1360 | 1179 | 1371 | 11.35 | 1.08× |
| lotsize_i6_t20_s2 | 0 | 11.11 (11.08–11.14) | 8.93 (8.92–8.98) | 8.96 (8.94–8.98) | 1671 | 2148 | 1954 | 14.46 | 1.30× |
| lotsize_i6_t20_s2 | 1 | 10.00 (9.95–10.05) | 8.19 (8.09–8.20) | 6.81 (6.79–6.84) | 1644 | 1872 | 1377 | 12.66 | 1.27× |
| gapd_a5_j50_s4 | 0 | 9.30 (9.28–9.35) | 3.71 (3.70–3.73) | 4.60 (4.60–4.63) | 635 | 385 | 706 | 18.59 | 2.00× |
| gapd_a5_j50_s4 | 1 | 12.53 (12.50–12.53) | 9.51 (9.44–9.53) | 5.77 (5.73–5.79) | 705 | 1239 | 608 | 16.11 | 1.29× |

- **native-t1**: 48 runs, 0 solver crashes, 0 harness errors, 0 invalid, 0 stopped short of the gap; repeat runs with different search paths in 0 of 16 model-seed groups (non-determinism); median max RSS 65 MB
- **native-on2**: 48 runs, 0 solver crashes, 0 harness errors, 0 invalid, 3 stopped short of the gap; repeat runs with different search paths in 1 of 16 model-seed groups (non-determinism); median max RSS 94 MB; geometric-mean speed-up over native-t1 1.47× (min 0.43×, max 4.21×)
- **native-on4**: 48 runs, 0 solver crashes, 0 harness errors, 0 invalid, 0 stopped short of the gap; repeat runs with different search paths in 0 of 16 model-seed groups (non-determinism); median max RSS 127 MB; geometric-mean speed-up over native-t1 2.56× (min 0.59×, max 27.69×)
- Wasm baseline / native single-thread: geometric mean 0.90×

