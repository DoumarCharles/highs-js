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
compile seconds: 62
link seconds: 27
highs.wasm bytes: 3531385
highs.wasm gzip-9 bytes: 1213959
highs.wasm sha256: 528be4365bea1d4188988646b244263f50320df55782e14d6af5bce7cd45c840
```
```
variant: initmem256
extra cmake args: (none)
extra link flags: -sINITIAL_MEMORY=256MB
emcc: emcc (Emscripten gcc/clang-like replacement + linker emulating GNU ld) 6.0.3 (283e2d130132859fde6a4e4c87fd254b38127651)
HiGHS commit: 04024d701f79feb8e2f18bc3df0dffc04ef05088
-- Build type: Release
-- IPO / LTO supported by compiler: YES
-- IPO / LTO: disabled by default when building a static library; set CMAKE_INTERPROCEDURAL_OPTIMIZATION=ON to enable
CMAKE_CXX_FLAGS (cache): 
CMAKE_CXX_FLAGS_RELEASE (cache): -O3 -DNDEBUG
HighsMipSolver.cpp.o magic:  \0 a s m
compile seconds: 128
link seconds: 48
highs.wasm bytes: 3531385
highs.wasm gzip-9 bytes: 1213960
highs.wasm sha256: 4dfaa5a85da77669f67ad4cba18587d3c3e140fc7943769bbb51fea977a4b9d4
```

## WebAssembly A/B

Runs: 64 (0 errors). Each row is one model and random seed; times are solve-only medians over the repetitions, in a fresh Node process per run, variants alternating order. Mandatory: valid solution (independent checker) and stop at the production gap. Identical search path (nodes, LP iterations) is informational.

### initmem256 vs baseline

| model | tier | seed | baseline s | candidate s | change | per-rep range | nodes b/c | LP iters b/c | same path | root bound b/c | objective b/c | abs gap b/c (target) | gap reached | valid | Wasm MB b/c | RSS MB b/c |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| gapd_a8_j48_s2 | hard | 0 | 17.20 | 17.13 | **−0.4%** | −0.7% … −0.2% | 611/611 | 135535/135535 | yes | 3049.3/3049.3 | 3066.0/3066.0 | 8.000/8.000 (10) | yes | yes | 105/256 | 206/229 |
| gapd_a8_j48_s2 | hard | 1 | 39.82 | 39.73 | **−0.2%** | −0.7% … +0.3% | 2392/2392 | 333372/333372 | yes | 3050.4/3050.4 | 3070.0/3070.0 | 8.000/8.000 (10) | yes | yes | 105/256 | 206/210 |
| gapd_a10_j50_s3 | hard | 0 | 27.23 | 27.12 | **−0.4%** | −0.9% … +0.1% | 1150/1150 | 246575/246575 | yes | 3107.5/3107.5 | 3123.0/3123.0 | 7.000/7.000 (20) | yes | yes | 61/256 | 189/175 |
| gapd_a10_j50_s3 | hard | 1 | 29.03 | 29.05 | **+0.1%** | −0.2% … +0.4% | 1396/1396 | 290464/290464 | yes | 3107.6/3107.6 | 3123.0/3123.0 | 5.000/5.000 (20) | yes | yes | 88/256 | 194/194 |
| mkp_n150_m10_s1 | hard | 0 | 7.24 | 7.25 | **+0.1%** | −0.4% … +0.6% | 1326/1326 | 31643/31643 | yes | 64196.3/64196.3 | 63745.0/63745.0 | 359.0/359.0 (360) | yes | yes | 24/256 | 161/155 |
| mkp_n150_m10_s1 | hard | 1 | 14.00 | 13.93 | **−0.5%** | −0.7% … −0.4% | 2650/2650 | 55668/55668 | yes | 64196.3/64196.3 | 63793.0/63793.0 | 306.0/306.0 (360) | yes | yes | 29/256 | 153/163 |
| gapd_a10_j60_s1 | hard | 0 | 22.82 | 22.82 | **+0.0%** | −0.1% … +0.1% | 632/632 | 187052/187052 | yes | 3852.6/3852.6 | 3879.0/3879.0 | 17.00/17.00 (18) | yes | yes | 73/256 | 180/192 |
| gapd_a10_j60_s1 | hard | 1 | 17.09 | 17.18 | **+0.5%** | +0.3% … +0.8% | 483/483 | 145124/145124 | yes | 3853.1/3853.1 | 3877.0/3877.0 | 17.00/17.00 (18) | yes | yes | 73/256 | 195/180 |
| mkp_n200_m10_s2 | hard | 0 | 31.83 | 31.93 | **+0.3%** | +0.0% … +0.6% | 6102/6102 | 103941/103941 | yes | 85918.0/85918.0 | 85700.0/85700.0 | 162.0/162.0 (180) | yes | yes | 61/256 | 166/178 |
| mkp_n200_m10_s2 | hard | 1 | 40.73 | 40.33 | **−1.0%** | −1.2% … −0.7% | 8353/8353 | 135151/135151 | yes | 85918.0/85918.0 | 85700.0/85700.0 | 153.0/153.0 (180) | yes | yes | 61/256 | 178/187 |
| lotsize_i8_t15_s3 | medium | 0 | 12.52 | 12.53 | **+0.1%** | −0.0% … +0.2% | 1012/1012 | 92350/92350 | yes | 60129.0/60129.0 | 60952.0/60952.0 | 9.178/9.178 (10) | yes | yes | 20/256 | 151/154 |
| lotsize_i8_t15_s3 | medium | 1 | 11.19 | 11.21 | **+0.2%** | +0.2% … +0.2% | 1085/1085 | 83282/83282 | yes | 60075.7/60075.7 | 60952.0/60952.0 | 9.698/9.698 (10) | yes | yes | 20/256 | 157/160 |
| lotsize_i6_t20_s2 | medium | 0 | 14.37 | 14.33 | **−0.3%** | −0.3% … −0.2% | 1930/1930 | 100172/100172 | yes | 55976.3/55976.3 | 57675.0/57675.0 | 8.528/8.528 (10) | yes | yes | 24/256 | 155/160 |
| lotsize_i6_t20_s2 | medium | 1 | 12.44 | 12.44 | **+0.1%** | −0.3% … +0.4% | 1844/1844 | 95648/95648 | yes | 55886.8/55886.8 | 57675.0/57675.0 | 9.870/9.870 (10) | yes | yes | 20/256 | 151/151 |
| gapd_a5_j50_s4 | medium | 0 | 18.12 | 17.99 | **−0.8%** | −0.8% … −0.7% | 1179/1179 | 113947/113947 | yes | 3083.4/3083.4 | 3090.0/3090.0 | 1.000/1.000 (5) | yes | yes | 73/256 | 192/196 |
| gapd_a5_j50_s4 | medium | 1 | 15.87 | 15.80 | **−0.5%** | −0.8% … −0.1% | 1162/1162 | 101167/101167 | yes | 3083.2/3083.2 | 3090.0/3090.0 | 2.000/2.000 (5) | yes | yes | 126/256 | 228/234 |

**Geometric-mean time ratio initmem256/baseline: 0.998 (−0.2%) over 16 model-seed pairs; hard tier: 0.998 (−0.2%).**

Startup memory right after loading (median): baseline Wasm 20 MB / RSS 70 MB; initmem256 Wasm 256 MB / RSS 75 MB.
Total solve time: baseline 663.04 s, initmem256 661.57 s. Median module load (compile+instantiate): baseline 38 ms, initmem256 40 ms.

### Checks
- Mandatory checks passed: every solution valid against the independent checker, every run stopped at its production gap.
- Every candidate run followed the identical search path (same nodes and LP iterations) as the baseline, so time differences are pure execution speed.

