// Research-only --post-js for the "pthreads" variant (research/build-variant.sh).
// Exposes Emscripten's pthread pool bookkeeping so the benchmark can verify
// how many Web Workers / worker_threads exist and are running. It changes no
// solver behaviour. In Node, Emscripten ignores PTHREAD_POOL_SIZE_STRICT and
// creates extra workers on demand, so a pool shortfall that would deadlock a
// browser shows up here as total workers > PTHREAD_POOL_SIZE.
Module["researchPthreadStats"] = function () {
  if (typeof PThread === "undefined") return null;
  var running = Object.keys(PThread.pthreads).length;
  var unused = PThread.unusedWorkers.length;
  return { running: running, unused: unused, total: running + unused };
};
