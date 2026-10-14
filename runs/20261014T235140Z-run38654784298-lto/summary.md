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
compile seconds: 99
link seconds: 40
highs.wasm bytes: 3531385
highs.wasm gzip-9 bytes: 1213959
highs.wasm sha256: 528be4365bea1d4188988646b244263f50320df55782e14d6af5bce7cd45c840
```
```
variant: lto
extra cmake args: -DCMAKE_C_FLAGS=-flto -DCMAKE_CXX_FLAGS=-flto
extra link flags: (none)
emcc: emcc (Emscripten gcc/clang-like replacement + linker emulating GNU ld) 6.0.3 (283e2d130132859fde6a4e4c87fd254b38127651)
HiGHS commit: 04024d701f79feb8e2f18bc3df0dffc04ef05088
-- Build type: Release
-- IPO / LTO supported by compiler: YES
-- IPO / LTO: disabled by default when building a static library; set CMAKE_INTERPROCEDURAL_OPTIMIZATION=ON to enable
CMAKE_CXX_FLAGS (cache): -flto
CMAKE_CXX_FLAGS_RELEASE (cache): -O3 -DNDEBUG
HighsMipSolver.cpp.o magic:  B C 300 336
compile seconds: 127
link seconds: 74
highs.wasm bytes: 3407208
highs.wasm gzip-9 bytes: 1182603
highs.wasm sha256: 097ca1ee17e64ae7bcf6a73dc2790c953ce51fb2d4bb42bbaa5086b281b4fda6
```

## WebAssembly A/B

Runs: 56 (0 errors). Each row is one model and random seed; times are solve-only medians over the repetitions, in a fresh Node process per run, variants alternating order. Mandatory: valid solution (independent checker) and stop at the production gap. Identical search path (nodes, LP iterations) is informational.

### lto vs baseline

| model | tier | seed | baseline s | candidate s | change | per-rep range | nodes b/c | LP iters b/c | same path | root bound b/c | objective b/c | abs gap b/c (target) | gap reached | valid | Wasm MB b/c | RSS MB b/c |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| gapd_a8_j48_s2 | hard | 0 | 13.92 | 14.08 | **+1.1%** | +0.8% … +1.4% | 611/611 | 135535/135535 | yes | 3049.3/3049.3 | 3066.0/3066.0 | 8.000/8.000 (10) | yes | yes | 105/105 | 212/250 |
| gapd_a8_j48_s2 | hard | 1 | 32.21 | 32.89 | **+2.1%** | +1.7% … +2.5% | 2392/2392 | 333372/333372 | yes | 3050.4/3050.4 | 3070.0/3070.0 | 8.000/8.000 (10) | yes | yes | 105/105 | 216/223 |
| gapd_a10_j50_s3 | hard | 0 | 21.98 | 22.24 | **+1.2%** | +1.1% … +1.3% | 1150/1150 | 246575/246575 | yes | 3107.5/3107.5 | 3123.0/3123.0 | 7.000/7.000 (20) | yes | yes | 61/61 | 180/192 |
| gapd_a10_j50_s3 | hard | 1 | 23.60 | 23.87 | **+1.1%** | +1.0% … +1.2% | 1396/1396 | 290464/290464 | yes | 3107.6/3107.6 | 3123.0/3123.0 | 5.000/5.000 (20) | yes | yes | 88/87 | 203/206 |
| mkp_n150_m10_s1 | hard | 0 | 6.13 | 6.23 | **+1.6%** | +1.4% … +1.8% | 1326/1326 | 31643/31643 | yes | 64196.3/64196.3 | 63745.0/63745.0 | 359.0/359.0 (360) | yes | yes | 24/24 | 167/173 |
| mkp_n150_m10_s1 | hard | 1 | 12.01 | 12.15 | **+1.2%** | +0.9% … +1.4% | 2650/2650 | 55668/55668 | yes | 64196.3/64196.3 | 63793.0/63793.0 | 306.0/306.0 (360) | yes | yes | 29/29 | 154/174 |
| mkp_n250_m10_s1 | hard | 0 | 2.59 | 2.60 | **+0.5%** | +0.3% … +0.8% | 259/259 | 14240/14240 | yes | 109149.2/109149.2 | 108788.0/108788.0 | 319.0/319.0 (320) | yes | yes | 35/35 | 148/176 |
| mkp_n250_m10_s1 | hard | 1 | 2.72 | 2.71 | **−0.3%** | −0.9% … +0.2% | 259/259 | 14268/14268 | yes | 109149.2/109149.2 | 108788.0/108788.0 | 319.0/319.0 (320) | yes | yes | 35/35 | 153/166 |
| lotsize_i8_t15_s3 | medium | 0 | 10.23 | 10.31 | **+0.8%** | +0.6% … +1.1% | 1012/1012 | 92350/92350 | yes | 60129.0/60129.0 | 60952.0/60952.0 | 9.178/9.178 (10) | yes | yes | 20/20 | 159/166 |
| lotsize_i8_t15_s3 | medium | 1 | 9.04 | 9.05 | **+0.1%** | −0.1% … +0.3% | 1085/1085 | 83282/83282 | yes | 60075.7/60075.7 | 60952.0/60952.0 | 9.698/9.698 (10) | yes | yes | 20/20 | 159/171 |
| lotsize_i6_t20_s2 | medium | 0 | 11.64 | 11.69 | **+0.4%** | +0.2% … +0.5% | 1930/1930 | 100172/100172 | yes | 55976.3/55976.3 | 57675.0/57675.0 | 8.528/8.528 (10) | yes | yes | 24/24 | 151/169 |
| lotsize_i6_t20_s2 | medium | 1 | 10.08 | 10.05 | **−0.3%** | −0.4% … −0.1% | 1844/1844 | 95648/95648 | yes | 55886.8/55886.8 | 57675.0/57675.0 | 9.870/9.870 (10) | yes | yes | 20/20 | 158/175 |
| gapd_a5_j50_s4 | medium | 0 | 14.75 | 15.05 | **+2.0%** | +1.7% … +2.3% | 1179/1179 | 113947/113947 | yes | 3083.4/3083.4 | 3090.0/3090.0 | 1.000/1.000 (5) | yes | yes | 73/73 | 187/197 |
| gapd_a5_j50_s4 | medium | 1 | 12.94 | 13.09 | **+1.1%** | +0.5% … +1.8% | 1162/1162 | 101167/101167 | yes | 3083.2/3083.2 | 3090.0/3090.0 | 2.000/2.000 (5) | yes | yes | 126/126 | 236/233 |

**Geometric-mean time ratio lto/baseline: 1.009 (+0.9%) over 14 model-seed pairs; hard tier: 1.011 (+1.1%).**

Total solve time: baseline 367.69 s, lto 371.99 s. Median module load (compile+instantiate): baseline 30 ms, lto 26 ms.

### Checks
- Mandatory checks passed: every solution valid against the independent checker, every run stopped at its production gap.
- Every candidate run followed the identical search path (same nodes and LP iterations) as the baseline, so time differences are pure execution speed.

## Native HiGHS reference (same commit, same runner, after the Wasm runs; one fresh process per solve)

| model | seed | native-t1 s (min–max) | native-on2 s (min–max) | native-on4 s (min–max) | native-t1 nodes | native-on2 nodes | native-on4 nodes | Wasm baseline s | Wasm/native-t1 |
|---|---|---|---|---|---|---|---|---|---|
| gapd_a8_j48_s2 | 0 | **crashed** | **crashed** | **crashed** |  |  |  | 13.92 |  |
| gapd_a8_j48_s2 | 1 | **crashed** | **crashed** | **crashed** |  |  |  | 32.21 |  |
| gapd_a10_j50_s3 | 0 | **crashed** | **crashed** | **crashed** |  |  |  | 21.98 |  |
| gapd_a10_j50_s3 | 1 | **crashed** | **crashed** | **crashed** |  |  |  | 23.60 |  |
| mkp_n150_m10_s1 | 0 | **crashed** | **crashed** | **crashed** |  |  |  | 6.13 |  |
| mkp_n150_m10_s1 | 1 | **crashed** | **crashed** | **crashed** |  |  |  | 12.01 |  |
| mkp_n250_m10_s1 | 0 | **crashed** | **crashed** | **crashed** |  |  |  | 2.59 |  |
| mkp_n250_m10_s1 | 1 | **crashed** | **crashed** | **crashed** |  |  |  | 2.72 |  |
| lotsize_i8_t15_s3 | 0 | **crashed** | **crashed** | **crashed** |  |  |  | 10.23 |  |
| lotsize_i8_t15_s3 | 1 | **crashed** | **crashed** | **crashed** |  |  |  | 9.04 |  |
| lotsize_i6_t20_s2 | 0 | **crashed** | **crashed** | **crashed** |  |  |  | 11.64 |  |
| lotsize_i6_t20_s2 | 1 | **crashed** | **crashed** | **crashed** |  |  |  | 10.08 |  |
| gapd_a5_j50_s4 | 0 | **crashed** | **crashed** | **crashed** |  |  |  | 14.75 |  |
| gapd_a5_j50_s4 | 1 | **crashed** | **crashed** | **crashed** |  |  |  | 12.94 |  |

- **native-t1**: 42 runs, 42 crashed, 0 invalid, 0 stopped short of the gap; repeat runs with different search paths in 0 of 14 model-seed groups (non-determinism); median max RSS 0 MB
- **native-on2**: 42 runs, 42 crashed, 0 invalid, 0 stopped short of the gap; repeat runs with different search paths in 0 of 14 model-seed groups (non-determinism); median max RSS 0 MB
- **native-on4**: 42 runs, 42 crashed, 0 invalid, 0 stopped short of the gap; repeat runs with different search paths in 0 of 14 model-seed groups (non-determinism); median max RSS 0 MB

### Native crashes
- native-t1 gapd_a8_j48_s2 seed 0 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-0-t1-0.opt --model_file models/gapd_a8_j48_s2.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-0-t1-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 84%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 gapd_a8_j48_s2 seed 0 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-0-on2-0.opt --model_file models/gapd_a8_j48_s2.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-0-on2-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 85%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 gapd_a8_j48_s2 seed 0 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-0-on4-0.opt --model_file models/gapd_a8_j48_s2.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-0-on4-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 35
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 gapd_a8_j48_s2 seed 0 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-0-on2-1.opt --model_file models/gapd_a8_j48_s2.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-0-on2-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 32
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 gapd_a8_j48_s2 seed 0 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-0-on4-1.opt --model_file models/gapd_a8_j48_s2.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-0-on4-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 gapd_a8_j48_s2 seed 0 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-0-t1-1.opt --model_file models/gapd_a8_j48_s2.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-0-t1-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 gapd_a8_j48_s2 seed 0 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-0-on4-2.opt --model_file models/gapd_a8_j48_s2.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-0-on4-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 gapd_a8_j48_s2 seed 0 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-0-t1-2.opt --model_file models/gapd_a8_j48_s2.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-0-t1-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 35
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 gapd_a8_j48_s2 seed 0 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-0-on2-2.opt --model_file models/gapd_a8_j48_s2.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-0-on2-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 85%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 gapd_a8_j48_s2 seed 1 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-1-t1-0.opt --model_file models/gapd_a8_j48_s2.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-1-t1-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 gapd_a8_j48_s2 seed 1 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-1-on2-0.opt --model_file models/gapd_a8_j48_s2.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-1-on2-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 gapd_a8_j48_s2 seed 1 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-1-on4-0.opt --model_file models/gapd_a8_j48_s2.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-1-on4-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 gapd_a8_j48_s2 seed 1 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-1-on2-1.opt --model_file models/gapd_a8_j48_s2.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-1-on2-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 gapd_a8_j48_s2 seed 1 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-1-on4-1.opt --model_file models/gapd_a8_j48_s2.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-1-on4-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 gapd_a8_j48_s2 seed 1 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-1-t1-1.opt --model_file models/gapd_a8_j48_s2.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-1-t1-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 gapd_a8_j48_s2 seed 1 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-1-on4-2.opt --model_file models/gapd_a8_j48_s2.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-1-on4-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 280
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 gapd_a8_j48_s2 seed 1 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-1-t1-2.opt --model_file models/gapd_a8_j48_s2.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-1-t1-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 gapd_a8_j48_s2 seed 1 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-1-on2-2.opt --model_file models/gapd_a8_j48_s2.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a8_j48_s2-1-on2-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 79%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 32
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 gapd_a10_j50_s3 seed 0 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-0-t1-0.opt --model_file models/gapd_a10_j50_s3.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-0-t1-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 gapd_a10_j50_s3 seed 0 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-0-on2-0.opt --model_file models/gapd_a10_j50_s3.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-0-on2-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 gapd_a10_j50_s3 seed 0 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-0-on4-0.opt --model_file models/gapd_a10_j50_s3.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-0-on4-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 gapd_a10_j50_s3 seed 0 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-0-on2-1.opt --model_file models/gapd_a10_j50_s3.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-0-on2-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 gapd_a10_j50_s3 seed 0 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-0-on4-1.opt --model_file models/gapd_a10_j50_s3.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-0-on4-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 88%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 284
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 32
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 gapd_a10_j50_s3 seed 0 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-0-t1-1.opt --model_file models/gapd_a10_j50_s3.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-0-t1-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 gapd_a10_j50_s3 seed 0 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-0-on4-2.opt --model_file models/gapd_a10_j50_s3.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-0-on4-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 77%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 gapd_a10_j50_s3 seed 0 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-0-t1-2.opt --model_file models/gapd_a10_j50_s3.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-0-t1-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 88%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 gapd_a10_j50_s3 seed 0 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-0-on2-2.opt --model_file models/gapd_a10_j50_s3.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-0-on2-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 88%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 gapd_a10_j50_s3 seed 1 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-1-t1-0.opt --model_file models/gapd_a10_j50_s3.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-1-t1-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 gapd_a10_j50_s3 seed 1 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-1-on2-0.opt --model_file models/gapd_a10_j50_s3.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-1-on2-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 gapd_a10_j50_s3 seed 1 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-1-on4-0.opt --model_file models/gapd_a10_j50_s3.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-1-on4-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 gapd_a10_j50_s3 seed 1 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-1-on2-1.opt --model_file models/gapd_a10_j50_s3.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-1-on2-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 gapd_a10_j50_s3 seed 1 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-1-on4-1.opt --model_file models/gapd_a10_j50_s3.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-1-on4-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 85%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 gapd_a10_j50_s3 seed 1 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-1-t1-1.opt --model_file models/gapd_a10_j50_s3.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-1-t1-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 35
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 gapd_a10_j50_s3 seed 1 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-1-on4-2.opt --model_file models/gapd_a10_j50_s3.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-1-on4-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 gapd_a10_j50_s3 seed 1 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-1-t1-2.opt --model_file models/gapd_a10_j50_s3.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-1-t1-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 276
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 32
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 gapd_a10_j50_s3 seed 1 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-1-on2-2.opt --model_file models/gapd_a10_j50_s3.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a10_j50_s3-1-on2-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 mkp_n150_m10_s1 seed 0 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-0-t1-0.opt --model_file models/mkp_n150_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-0-t1-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 mkp_n150_m10_s1 seed 0 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-0-on2-0.opt --model_file models/mkp_n150_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-0-on2-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 73%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 276
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 32
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 mkp_n150_m10_s1 seed 0 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-0-on4-0.opt --model_file models/mkp_n150_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-0-on4-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 mkp_n150_m10_s1 seed 0 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-0-on2-1.opt --model_file models/mkp_n150_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-0-on2-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 mkp_n150_m10_s1 seed 0 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-0-on4-1.opt --model_file models/mkp_n150_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-0-on4-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 mkp_n150_m10_s1 seed 0 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-0-t1-1.opt --model_file models/mkp_n150_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-0-t1-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 84%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 mkp_n150_m10_s1 seed 0 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-0-on4-2.opt --model_file models/mkp_n150_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-0-on4-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 85%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 mkp_n150_m10_s1 seed 0 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-0-t1-2.opt --model_file models/mkp_n150_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-0-t1-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 83%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 mkp_n150_m10_s1 seed 0 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-0-on2-2.opt --model_file models/mkp_n150_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-0-on2-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 mkp_n150_m10_s1 seed 1 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-1-t1-0.opt --model_file models/mkp_n150_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-1-t1-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 mkp_n150_m10_s1 seed 1 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-1-on2-0.opt --model_file models/mkp_n150_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-1-on2-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 mkp_n150_m10_s1 seed 1 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-1-on4-0.opt --model_file models/mkp_n150_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-1-on4-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 mkp_n150_m10_s1 seed 1 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-1-on2-1.opt --model_file models/mkp_n150_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-1-on2-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 284
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 32
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 mkp_n150_m10_s1 seed 1 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-1-on4-1.opt --model_file models/mkp_n150_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-1-on4-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 32
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 mkp_n150_m10_s1 seed 1 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-1-t1-1.opt --model_file models/mkp_n150_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-1-t1-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 mkp_n150_m10_s1 seed 1 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-1-on4-2.opt --model_file models/mkp_n150_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-1-on4-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 mkp_n150_m10_s1 seed 1 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-1-t1-2.opt --model_file models/mkp_n150_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-1-t1-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 88%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 284
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 32
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 mkp_n150_m10_s1 seed 1 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-1-on2-2.opt --model_file models/mkp_n150_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n150_m10_s1-1-on2-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 mkp_n250_m10_s1 seed 0 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-0-t1-0.opt --model_file models/mkp_n250_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-0-t1-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 284
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 mkp_n250_m10_s1 seed 0 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-0-on2-0.opt --model_file models/mkp_n250_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-0-on2-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 mkp_n250_m10_s1 seed 0 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-0-on4-0.opt --model_file models/mkp_n250_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-0-on4-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 mkp_n250_m10_s1 seed 0 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-0-on2-1.opt --model_file models/mkp_n250_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-0-on2-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 32
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 mkp_n250_m10_s1 seed 0 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-0-on4-1.opt --model_file models/mkp_n250_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-0-on4-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 mkp_n250_m10_s1 seed 0 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-0-t1-1.opt --model_file models/mkp_n250_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-0-t1-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 mkp_n250_m10_s1 seed 0 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-0-on4-2.opt --model_file models/mkp_n250_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-0-on4-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 88%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 mkp_n250_m10_s1 seed 0 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-0-t1-2.opt --model_file models/mkp_n250_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-0-t1-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 mkp_n250_m10_s1 seed 0 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-0-on2-2.opt --model_file models/mkp_n250_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-0-on2-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 mkp_n250_m10_s1 seed 1 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-1-t1-0.opt --model_file models/mkp_n250_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-1-t1-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 mkp_n250_m10_s1 seed 1 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-1-on2-0.opt --model_file models/mkp_n250_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-1-on2-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 280
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 mkp_n250_m10_s1 seed 1 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-1-on4-0.opt --model_file models/mkp_n250_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-1-on4-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 89%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 mkp_n250_m10_s1 seed 1 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-1-on2-1.opt --model_file models/mkp_n250_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-1-on2-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 mkp_n250_m10_s1 seed 1 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-1-on4-1.opt --model_file models/mkp_n250_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-1-on4-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 91%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 276
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 32
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 mkp_n250_m10_s1 seed 1 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-1-t1-1.opt --model_file models/mkp_n250_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-1-t1-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 32
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 mkp_n250_m10_s1 seed 1 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-1-on4-2.opt --model_file models/mkp_n250_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-1-on4-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 0%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 276
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 mkp_n250_m10_s1 seed 1 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-1-t1-2.opt --model_file models/mkp_n250_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-1-t1-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 85%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 mkp_n250_m10_s1 seed 1 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-1-on2-2.opt --model_file models/mkp_n250_m10_s1.lp --solution_file /tmp/highs-native-3bk0Xw/mkp_n250_m10_s1-1-on2-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 88%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 284
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 32
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 lotsize_i8_t15_s3 seed 0 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-0-t1-0.opt --model_file models/lotsize_i8_t15_s3.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-0-t1-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 88%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 lotsize_i8_t15_s3 seed 0 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-0-on2-0.opt --model_file models/lotsize_i8_t15_s3.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-0-on2-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 32
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 lotsize_i8_t15_s3 seed 0 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-0-on4-0.opt --model_file models/lotsize_i8_t15_s3.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-0-on4-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 lotsize_i8_t15_s3 seed 0 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-0-on2-1.opt --model_file models/lotsize_i8_t15_s3.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-0-on2-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 85%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 284
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 32
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 lotsize_i8_t15_s3 seed 0 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-0-on4-1.opt --model_file models/lotsize_i8_t15_s3.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-0-on4-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 0
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 lotsize_i8_t15_s3 seed 0 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-0-t1-1.opt --model_file models/lotsize_i8_t15_s3.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-0-t1-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 88%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 32
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 lotsize_i8_t15_s3 seed 0 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-0-on4-2.opt --model_file models/lotsize_i8_t15_s3.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-0-on4-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 lotsize_i8_t15_s3 seed 0 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-0-t1-2.opt --model_file models/lotsize_i8_t15_s3.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-0-t1-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 84%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 lotsize_i8_t15_s3 seed 0 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-0-on2-2.opt --model_file models/lotsize_i8_t15_s3.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-0-on2-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 lotsize_i8_t15_s3 seed 1 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-1-t1-0.opt --model_file models/lotsize_i8_t15_s3.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-1-t1-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 88%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 lotsize_i8_t15_s3 seed 1 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-1-on2-0.opt --model_file models/lotsize_i8_t15_s3.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-1-on2-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 lotsize_i8_t15_s3 seed 1 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-1-on4-0.opt --model_file models/lotsize_i8_t15_s3.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-1-on4-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 lotsize_i8_t15_s3 seed 1 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-1-on2-1.opt --model_file models/lotsize_i8_t15_s3.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-1-on2-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 79%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 32
	Voluntary context switches: 1
	Involuntary context switches: 1
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 lotsize_i8_t15_s3 seed 1 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-1-on4-1.opt --model_file models/lotsize_i8_t15_s3.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-1-on4-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 lotsize_i8_t15_s3 seed 1 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-1-t1-1.opt --model_file models/lotsize_i8_t15_s3.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-1-t1-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 84%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 280
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 lotsize_i8_t15_s3 seed 1 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-1-on4-2.opt --model_file models/lotsize_i8_t15_s3.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-1-on4-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 85%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 280
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 32
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 lotsize_i8_t15_s3 seed 1 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-1-t1-2.opt --model_file models/lotsize_i8_t15_s3.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-1-t1-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 lotsize_i8_t15_s3 seed 1 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-1-on2-2.opt --model_file models/lotsize_i8_t15_s3.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i8_t15_s3-1-on2-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 85%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 lotsize_i6_t20_s2 seed 0 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-0-t1-0.opt --model_file models/lotsize_i6_t20_s2.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-0-t1-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 lotsize_i6_t20_s2 seed 0 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-0-on2-0.opt --model_file models/lotsize_i6_t20_s2.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-0-on2-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 lotsize_i6_t20_s2 seed 0 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-0-on4-0.opt --model_file models/lotsize_i6_t20_s2.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-0-on4-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 lotsize_i6_t20_s2 seed 0 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-0-on2-1.opt --model_file models/lotsize_i6_t20_s2.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-0-on2-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 lotsize_i6_t20_s2 seed 0 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-0-on4-1.opt --model_file models/lotsize_i6_t20_s2.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-0-on4-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 276
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 lotsize_i6_t20_s2 seed 0 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-0-t1-1.opt --model_file models/lotsize_i6_t20_s2.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-0-t1-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 88%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 276
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 0
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 lotsize_i6_t20_s2 seed 0 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-0-on4-2.opt --model_file models/lotsize_i6_t20_s2.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-0-on4-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 84%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 lotsize_i6_t20_s2 seed 0 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-0-t1-2.opt --model_file models/lotsize_i6_t20_s2.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-0-t1-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 88%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 0
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 lotsize_i6_t20_s2 seed 0 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-0-on2-2.opt --model_file models/lotsize_i6_t20_s2.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-0-on2-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 lotsize_i6_t20_s2 seed 1 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-1-t1-0.opt --model_file models/lotsize_i6_t20_s2.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-1-t1-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 35
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 lotsize_i6_t20_s2 seed 1 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-1-on2-0.opt --model_file models/lotsize_i6_t20_s2.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-1-on2-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 85%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 284
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 32
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 lotsize_i6_t20_s2 seed 1 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-1-on4-0.opt --model_file models/lotsize_i6_t20_s2.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-1-on4-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 lotsize_i6_t20_s2 seed 1 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-1-on2-1.opt --model_file models/lotsize_i6_t20_s2.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-1-on2-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 83%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 32
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 lotsize_i6_t20_s2 seed 1 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-1-on4-1.opt --model_file models/lotsize_i6_t20_s2.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-1-on4-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 lotsize_i6_t20_s2 seed 1 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-1-t1-1.opt --model_file models/lotsize_i6_t20_s2.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-1-t1-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 lotsize_i6_t20_s2 seed 1 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-1-on4-2.opt --model_file models/lotsize_i6_t20_s2.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-1-on4-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 lotsize_i6_t20_s2 seed 1 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-1-t1-2.opt --model_file models/lotsize_i6_t20_s2.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-1-t1-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 85%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 276
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 lotsize_i6_t20_s2 seed 1 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-1-on2-2.opt --model_file models/lotsize_i6_t20_s2.lp --solution_file /tmp/highs-native-3bk0Xw/lotsize_i6_t20_s2-1-on2-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 32
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 gapd_a5_j50_s4 seed 0 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-0-t1-0.opt --model_file models/gapd_a5_j50_s4.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-0-t1-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 gapd_a5_j50_s4 seed 0 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-0-on2-0.opt --model_file models/gapd_a5_j50_s4.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-0-on2-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 gapd_a5_j50_s4 seed 0 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-0-on4-0.opt --model_file models/gapd_a5_j50_s4.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-0-on4-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 gapd_a5_j50_s4 seed 0 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-0-on2-1.opt --model_file models/gapd_a5_j50_s4.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-0-on2-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 gapd_a5_j50_s4 seed 0 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-0-on4-1.opt --model_file models/gapd_a5_j50_s4.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-0-on4-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 gapd_a5_j50_s4 seed 0 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-0-t1-1.opt --model_file models/gapd_a5_j50_s4.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-0-t1-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 gapd_a5_j50_s4 seed 0 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-0-on4-2.opt --model_file models/gapd_a5_j50_s4.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-0-on4-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 gapd_a5_j50_s4 seed 0 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-0-t1-2.opt --model_file models/gapd_a5_j50_s4.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-0-t1-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 gapd_a5_j50_s4 seed 0 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-0-on2-2.opt --model_file models/gapd_a5_j50_s4.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-0-on2-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 gapd_a5_j50_s4 seed 1 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-1-t1-0.opt --model_file models/gapd_a5_j50_s4.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-1-t1-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 86%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 280
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 gapd_a5_j50_s4 seed 1 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-1-on2-0.opt --model_file models/gapd_a5_j50_s4.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-1-on2-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 85%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 32
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 gapd_a5_j50_s4 seed 1 rep 0: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-1-on4-0.opt --model_file models/gapd_a5_j50_s4.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-1-on4-0.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 85%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 gapd_a5_j50_s4 seed 1 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-1-on2-1.opt --model_file models/gapd_a5_j50_s4.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-1-on2-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 85%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 gapd_a5_j50_s4 seed 1 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-1-on4-1.opt --model_file models/gapd_a5_j50_s4.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-1-on4-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 88%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 280
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 gapd_a5_j50_s4 seed 1 rep 1: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-1-t1-1.opt --model_file models/gapd_a5_j50_s4.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-1-t1-1.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 33
	Voluntary context switches: 0
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on4 gapd_a5_j50_s4 seed 1 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-1-on4-2.opt --model_file models/gapd_a5_j50_s4.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-1-on4-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 83%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-t1 gapd_a5_j50_s4 seed 1 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-1-t1-2.opt --model_file models/gapd_a5_j50_s4.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-1-t1-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 84%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 1
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```
- native-on2 gapd_a5_j50_s4 seed 1 rep 2: exit 127, signal null

```

Command exited with non-zero status 127
	Command being timed: "native/highs --options_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-1-on2-2.opt --model_file models/gapd_a5_j50_s4.lp --solution_file /tmp/highs-native-3bk0Xw/gapd_a5_j50_s4-1-on2-2.sol"
	User time (seconds): 0.00
	System time (seconds): 0.00
	Percent of CPU this job got: 87%
	Elapsed (wall clock) time (h:mm:ss or m:ss): 0:00.00
	Average shared text size (kbytes): 0
	Average unshared data size (kbytes): 0
	Average stack size (kbytes): 0
	Average total size (kbytes): 0
	Maximum resident set size (kbytes): 288
	Average resident set size (kbytes): 0
	Major (requiring I/O) page faults: 0
	Minor (reclaiming a frame) page faults: 34
	Voluntary context switches: 0
	Involuntary context switches: 0
	Swaps: 0
	File system inputs: 0
	File system outputs: 0
	Socket messages sent: 0
	Socket messages received: 0
	Signals delivered: 0
	Page size (bytes): 4096
	Exit status: 127

```

