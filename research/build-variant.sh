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
case "$variant" in
  baseline) ;;
  # Real cross-module LTO: compile HiGHS itself to LLVM bitcode so the
  # existing -flto link step can optimize across HiGHS translation units.
  lto)
    EXTRA_CMAKE_ARGS=(-DCMAKE_C_FLAGS=-flto -DCMAKE_CXX_FLAGS=-flto) ;;
  # WebAssembly SIMD (auto-vectorization, no fast-math; path identity is measured, not assumed).
  simd)
    EXTRA_CMAKE_ARGS=(-DCMAKE_C_FLAGS=-msimd128 -DCMAKE_CXX_FLAGS=-msimd128)
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
  *) echo "unknown variant: $variant" >&2; exit 2 ;;
esac

bdir="$root/research-build/$variant"
mkdir -p "$bdir" "$out"

node "$root/scripts/generate-highs-api.mjs" --check
"$root/node_modules/.bin/tsc" -p "$root/tsconfig.runtime.json"

cd "$bdir"
emcmake cmake --fresh "$root/HiGHS" \
  -DZLIB=OFF \
  -DFAST_BUILD=OFF \
  -DBUILD_SHARED_LIBS=OFF \
  -DHIGHSINT64=OFF \
  -DHIGHS_NO_DEFAULT_THREADS=ON \
  "${EXTRA_CMAKE_ARGS[@]}" 2>&1 | tee cmake-configure.log

start=$(date +%s)
emmake make -j"$(nproc)" libhighs 2>&1 | tail -n 5
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
  --post-js "$root/src/post.js" \
  --post-js "$root/build/generated/extended.js" \
  "$root/src/highs_js_bridge.cpp" \
  lib/*.a -o "$out/highs.js"
link_s=$(( $(date +%s) - start ))

# Evidence of what was actually compiled: object format of one HiGHS object
# (\0asm = Wasm object, BC = LLVM bitcode, i.e. LTO-able).
probe="$(mktemp -d)"
( cd "$probe" && "$(dirname "$(command -v emcc)")/../bin/llvm-ar" x "$bdir/lib/libhighs.a" HighsMipSolver.cpp.o 2>/dev/null \
  || emar x "$bdir/lib/libhighs.a" HighsMipSolver.cpp.o )
magic="$(head -c 4 "$probe/HighsMipSolver.cpp.o" | od -An -c | tr -s ' ')"
rm -rf "$probe"

{
  echo "variant: $variant"
  echo "extra cmake args: ${EXTRA_CMAKE_ARGS[*]:-(none)}"
  echo "extra link flags: ${EXTRA_LINK_FLAGS[*]:-(none)}"
  echo "emcc: $(emcc --version | head -n 1)"
  echo "HiGHS commit: $(git -C "$root/HiGHS" rev-parse HEAD)"
  grep -E "Build type|IPO / LTO" cmake-configure.log || true
  echo "CMAKE_CXX_FLAGS (cache): $(grep -E '^CMAKE_CXX_FLAGS:' CMakeCache.txt | cut -d= -f2-)"
  echo "CMAKE_CXX_FLAGS_RELEASE (cache): $(grep -E '^CMAKE_CXX_FLAGS_RELEASE:' CMakeCache.txt | cut -d= -f2-)"
  echo "HighsMipSolver.cpp.o magic: $magic"
  echo "compile seconds: $compile_s"
  echo "link seconds: $link_s"
  echo "highs.wasm bytes: $(stat -c %s "$out/highs.wasm")"
  echo "highs.wasm gzip-9 bytes: $(gzip -9 -c "$out/highs.wasm" | wc -c)"
  echo "highs.wasm sha256: $(sha256sum "$out/highs.wasm" | cut -d' ' -f1)"
} | tee "$out/build-info.txt"
