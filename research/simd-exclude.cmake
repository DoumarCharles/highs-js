# Used only by the "simd" variant (research/build-variant.sh) through
# CMAKE_PROJECT_INCLUDE. Emscripten 6.0.3's clang crashes (signal 11) when
# compiling HiGHS's mip/HighsSearch.cpp with -O3 -msimd128 (perf-research run
# 38658172432). Until that is resolved, the listed files are compiled without
# SIMD; everything else gets -msimd128. Deferred so the highs/ directory and
# its targets exist when the property is set.
include_guard(GLOBAL)

set(HIGHS_RESEARCH_SIMD_EXCLUDE
  mip/HighsSearch.cpp
)

function(highs_research_simd_exclude)
  foreach(src IN LISTS HIGHS_RESEARCH_SIMD_EXCLUDE)
    set_property(SOURCE "${CMAKE_SOURCE_DIR}/highs/${src}"
      DIRECTORY "${CMAKE_SOURCE_DIR}/highs"
      APPEND PROPERTY COMPILE_OPTIONS -mno-simd128)
    message(STATUS "perf-research: ${src} compiled without -msimd128")
  endforeach()
endfunction()

cmake_language(DEFER DIRECTORY "${CMAKE_SOURCE_DIR}" CALL highs_research_simd_exclude)
