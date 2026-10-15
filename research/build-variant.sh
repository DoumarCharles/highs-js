#!/usr/bin/env bash
# Builds one experimental variant of the WebAssembly solver for the
# perf-research benchmark. The steps are build.sh's, unchanged, except:
#   - a separate build directory (research-build/<variant>),
#   - only the CommonJS loader is linked (the benchmark runs in Node),
#   - the variant's extra CMake arguments and extra emcc link flags.
# The "baseline" variant adds nothing, so it is the production build.
#
# Usage: research/build-variant.sh <variant> <outdir>
# Writes <outdir>/highs.js, <outdir>/highs.wasm and <outdir>/build-info.txt.
set -euo pipefail

variant="$1"
out="$(realpath -m "$2")"
root="$(dirname "$(dirname "$(realpath "$0")")")"

# One experiment = one change. Add new variants here; never combine two
# unproven changes in one variant.
EXTRA_CMAKE_ARGS=()
EXTRA_LINK_FLAGS=()
EXTRA_POST_JS=()
NO_DEFAULT_THREADS=ON
GUARD_GLUE=0
case "$variant" in
  baseline) ;;
  # Real cross-module LTO: compile HiGHS itself to LLVM bitcode so the
  # existing -flto link step can optimize across HiGHS translation units.
  lto)
    EXTRA_CMAKE_ARGS=(-DCMAKE_C_FLAGS=-flto -DCMAKE_CXX_FLAGS=-flto) ;;
  # WebAssembly SIMD (auto-vectorization, no fast-math; path identity is measured, not assumed).
  simd)
    EXTRA_CMAKE_ARGS=(-DCMAKE_C_FLAGS=-msimd128 -DCMAKE_CXX_FLAGS=-msimd128
      "-DCMAKE_PROJECT_INCLUDE=$root/research/simd-exclude.cmake")
    EXTRA_LINK_FLAGS=(-msimd128) ;;
  # Larger initial heap (256 MB instead of 16 MB): fewer memory.grow steps.
  initmem256)
    EXTRA_LINK_FLAGS=(-sINITIAL_MEMORY=256MB) ;;
  # 4 GB Wasm memory ceiling instead of the 2 GB default.
  mem4g)
    EXTRA_LINK_FLAGS=(-sMAXIMUM_MEMORY=4GB) ;;
  # mimalloc instead of dlmalloc.
  mimalloc)
    EXTRA_LINK_FLAGS=(-sMALLOC=mimalloc) ;;
  # WebAssembly pthreads for HiGHS's parallel MIP search. Every HiGHS object
  # and the bridge are compiled with -pthread (atomics + bulk memory); wasm-ld
  # refuses to link shared memory if any object lacks them. HiGHS's
  # executor creates (threads - 1) pthreads, so threads=4 needs 3; the pool is
  # pre-spawned with 4 (one spare) and verified at run time through
  # research/pthreads-probe.js. HIGHS_NO_DEFAULT_THREADS is turned off so
  # nothing in the configuration caps threading; runs always set `threads`
  # explicitly. Thread stacks default to STACK_SIZE (4 MB), set explicitly.
  # Memory: same growth settings and 2 GB maximum as the baseline (a shared
  # memory must declare its maximum; 2 GB is Emscripten's default).
  #
  # -fwasm-exceptions: HiGHS's task scheduler cancels stolen tasks by throwing
  # HighsTask::Interrupt (parallel/HighsParallel.h, HighsSplitDeque.h). With
  # Emscripten's default (exception catching disabled) that throw aborts the
  # worker thread, and the main thread then unwinds out of model.run() with
  # Emscripten's internal 'unwind' (runs 38684565460 / pthreads-dbg). Native
  # Wasm exception handling is enabled for every object and the link.
  pthreads)
    NO_DEFAULT_THREADS=OFF
    # highs-js's post.js / extended.js run at load and call native functions
    # immediately; pthread workers execute the same script before they have
    # the Wasm instance, so those layers are wrapped to run on the main
    # runtime thread only (generated copies; src/ is untouched).
    GUARD_GLUE=1
    EXTRA_CMAKE_ARGS=("-DCMAKE_C_FLAGS=-pthread -fwasm-exceptions" "-DCMAKE_CXX_FLAGS=-pthread -fwasm-exceptions")
    EXTRA_LINK_FLAGS=(-pthread -fwasm-exceptions -sPTHREAD_POOL_SIZE=4 -sPTHREAD_POOL_SIZE_STRICT=2
      -sDEFAULT_PTHREAD_STACK_SIZE=4194304 -sMAXIMUM_MEMORY=2147483648)
    EXTRA_POST_JS=(--post-js "$root/research/pthreads-probe.js") ;;
  # Diagnostic only (never benchmarked): the pthreads variant plus Emscripten
  # runtime assertions, for clearer failure messages.
  pthreads-dbg)
    NO_DEFAULT_THREADS=OFF
    GUARD_GLUE=1
    EXTRA_CMAKE_ARGS=("-DCMAKE_C_FLAGS=-pthread -fwasm-exceptions" "-DCMAKE_CXX_FLAGS=-pthread -fwasm-exceptions")
    EXTRA_LINK_FLAGS=(-pthread -fwasm-exceptions -sPTHREAD_POOL_SIZE=4 -sPTHREAD_POOL_SIZE_STRICT=2
      -sDEFAULT_PTHREAD_STACK_SIZE=4194304 -sMAXIMUM_MEMORY=2147483648 -sASSERTIONS=2
      -sPTHREADS_DEBUG=1 --profiling-funcs -sEXPORT_EXCEPTION_HANDLING_HELPERS=1)
    EXTRA_POST_JS=(--post-js "$root/research/pthreads-probe.js") ;;
  *) echo "unknown variant: $variant" >&2; exit 2 ;;
esac

bdir="$root/research-build/$variant"
mkdir -p "$bdir" "$out"

node "$root/scripts/generate-highs-api.mjs" --check
"$root/node_modules/.bin/tsc" -p "$root/tsconfig.runtime.json"

POST_JS="$root/src/post.js"
EXT_JS="$root/build/generated/extended.js"
if [ "$GUARD_GLUE" = 1 ]; then
  for f in post extended; do
    src="$POST_JS"; [ "$f" = extended ] && src="$EXT_JS"
    { echo "if (!ENVIRONMENT_IS_PTHREAD) {"; cat "$src"; echo; echo "}"; } > "$bdir/$f-main-thread-only.js"
  done
  POST_JS="$bdir/post-main-thread-only.js"
  EXT_JS="$bdir/extended-main-thread-only.js"
  # The extended API deliberately rejects thread/parallel/concurrency options
  # ("single-threaded data-only API"). The threaded variant lifts only that
  # one rule, in the generated copy, so `threads` and `parallel` can be set.
  rule='/thread|parallel|concurr/i.test(name) ||'
  [ "$(grep -cF "$rule" "$EXT_JS")" = 1 ] || { echo "threading option rule not found in extended.js" >&2; exit 1; }
  python3 - "$EXT_JS" "$rule" <<'PY'
import sys
path, rule = sys.argv[1], sys.argv[2]
text = open(path).read()
open(path, "w").write(text.replace(rule, "/concurr/i.test(name) ||", 1))
PY
fi

cd "$bdir"
emcmake cmake --fresh "$root/HiGHS" \
  -DZLIB=OFF \
  -DFAST_BUILD=OFF \
  -DBUILD_SHARED_LIBS=OFF \
  -DHIGHSINT64=OFF \
  -DHIGHS_NO_DEFAULT_THREADS="$NO_DEFAULT_THREADS" \
  "${EXTRA_CMAKE_ARGS[@]}" 2>&1 | tee cmake-configure.log

start=$(date +%s)
emmake make -k -j"$(nproc)" libhighs > make.log 2>&1 || { grep -E "error|Error" make.log | head -n 40; tail -n 40 make.log; exit 1; }
tail -n 3 make.log
compile_s=$(( $(date +%s) - start ))

start=$(date +%s)
emcc -O3 \
  -s EXPORTED_FUNCTIONS="@$root/exported_functions.json" \
  -s EXPORTED_RUNTIME_METHODS="['cwrap','addFunction','removeFunction','UTF8ToString']" \
  -s MODULARIZE=1 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s ALLOW_TABLE_GROWTH=1 \
  -s STACK_SIZE=4194304 \
  -flto \
  "${EXTRA_LINK_FLAGS[@]}" \
  -I "$root/HiGHS/highs" \
  -I "$bdir" \
  --pre-js "$root/src/pre.js" \
  --post-js "$POST_JS" \
  --post-js "$EXT_JS" \
  "${EXTRA_POST_JS[@]}" \
  "$root/src/highs_js_bridge.cpp" \
  lib/*.a -o "$out/highs.js"
link_s=$(( $(date +%s) - start ))

# Evidence of what was actually compiled: object format of one HiGHS object
# (\0asm = Wasm object, BC = LLVM bitcode, i.e. LTO-able).
probe="$(mktemp -d)"
( cd "$probe" && "$(dirname "$(command -v emcc)")/../bin/llvm-ar" x "$bdir/lib/libhighs.a" HighsMipSolver.cpp.o 2>/dev/null \
  || emar x "$bdir/lib/libhighs.a" HighsMipSolver.cpp.o )
magic="$(head -c 4 "$probe/HighsMipSolver.cpp.o" | od -An -c | tr -s ' ')"
# Object-level threading evidence (only meaningful for plain Wasm objects):
# target features (+atomics, +bulk-memory) and whether the object expects a
# shared linear memory.
if [ "$(head -c 4 "$probe/HighsMipSolver.cpp.o" | od -An -tx1 | tr -d ' ')" = "0061736d" ]; then
  objinfo="$(node "$root/research/scripts/wasm-info.mjs" "$probe/HighsMipSolver.cpp.o")"
else
  objinfo="(bitcode object; not parsed)"
fi
rm -rf "$probe"
wasminfo="$(node "$root/research/scripts/wasm-info.mjs" "$out/highs.wasm")"

{
  echo "variant: $variant"
  echo "extra cmake args: ${EXTRA_CMAKE_ARGS[*]:-(none)}"
  echo "extra link flags: ${EXTRA_LINK_FLAGS[*]:-(none)}"
  echo "JS glue guarded to main runtime thread: $GUARD_GLUE"
  echo "extended API option rule: $(grep -oE '/[a-z|]*concurr/i.test\(name\)' "$EXT_JS")"
  echo "emcc: $(emcc --version | head -n 1)"
  echo "HiGHS commit: $(git -C "$root/HiGHS" rev-parse HEAD)"
  grep -E "Build type|IPO / LTO|perf-research:" cmake-configure.log || true
  echo "CMAKE_CXX_FLAGS (cache): $(grep -E '^CMAKE_CXX_FLAGS:' CMakeCache.txt | cut -d= -f2-)"
  echo "CMAKE_CXX_FLAGS_RELEASE (cache): $(grep -E '^CMAKE_CXX_FLAGS_RELEASE:' CMakeCache.txt | cut -d= -f2-)"
  echo "HighsMipSolver.cpp.o magic: $magic"
  echo "HighsMipSolver.cpp.o wasm info: $objinfo"
  echo "highs.wasm info: $wasminfo"
  echo "HConfig.h threading: $(grep -E 'HIGHS_NO_DEFAULT_THREADS' "$bdir/HConfig.h" || echo '(HIGHS_NO_DEFAULT_THREADS not defined)')"
  grep -E "Threads|pthread" cmake-configure.log | sed 's/^/cmake: /' || true
  echo "objects in libhighs.a: $("$(dirname "$(command -v emcc)")/../bin/llvm-ar" t "$bdir/lib/libhighs.a" 2>/dev/null | wc -l)"
  echo "compile seconds: $compile_s"
  echo "link seconds: $link_s"
  echo "highs.wasm bytes: $(stat -c %s "$out/highs.wasm")"
  echo "highs.wasm gzip-9 bytes: $(gzip -9 -c "$out/highs.wasm" | wc -c)"
  echo "highs.wasm sha256: $(sha256sum "$out/highs.wasm" | cut -d' ' -f1)"
  echo "GROWABLE_HEAP view checks in highs.js (pthreads + memory growth): $(grep -o "GROWABLE_HEAP_" "$out/highs.js" | wc -l)"
  echo "PTHREAD_POOL_SIZE in highs.js: $(grep -oE "pthreadPoolSize = [0-9]+|PTHREAD_POOL_SIZE[^;]{0,40}" "$out/highs.js" | head -n 2 | tr "\n" " ")"
} | tee "$out/build-info.txt"
