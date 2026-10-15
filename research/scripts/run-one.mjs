// Runs ONE HiGHS WebAssembly MIP solve in this (fresh) Node process and
// prints a single JSON line. bench.mjs spawns one process per solve so that
// memory, JIT state and heap growth never carry over between runs.
//
// node research/scripts/run-one.mjs --module build/highs.js --lp m.lp --json m.json \
//      --gap 10 --seed 0 --time-limit 300 [--callbacks production|none] \
//      [--threads N] [--parallel on|off|choose]
//
// --threads / --parallel are only set when given, so the single-thread
// baseline runs with exactly the options it always had.
// Options mirror a production-style solve: persistent API (createModel + run),
// absolute gap with mip_rel_gap 0, output_flag on (needed for the mipLogging
// callback) but nothing printed, and the same callbacks an app would register.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { performance } from "node:perf_hooks";
import { checkSolution, loadModelJson } from "./check.mjs";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, all) => (i % 2 === 0 ? [...acc, [cur.replace(/^--/, ""), all[i + 1]]] : acc), []),
);
const modulePath = path.resolve(args.module);
const gap = Number(args.gap);
const seed = Number(args.seed ?? 0);
const timeLimit = Number(args["time-limit"] ?? 300);
const callbacksMode = args.callbacks ?? "production";
const threads = args.threads === undefined ? null : Number(args.threads);
const parallel = args.parallel ?? null;

// Capture the Wasm memory so its final size (= peak, Wasm memory never
// shrinks) can be reported.
let wasmMemory = null;
const OrigMemory = WebAssembly.Memory;
const captureMemory = (instance) => {
  for (const value of Object.values(instance.exports)) if (value instanceof OrigMemory) wasmMemory = value;
};
// With pthreads the memory is created in JS (shared) and imported, not
// exported, so also capture memories constructed on this thread.
WebAssembly.Memory = class TrackedMemory extends OrigMemory {
  constructor(descriptor) {
    super(descriptor);
    wasmMemory = this;
  }
};
const origInstantiate = WebAssembly.instantiate;
WebAssembly.instantiate = async function (...a) {
  const result = await origInstantiate.apply(this, a);
  captureMemory(result.instance ?? result);
  return result;
};
const origStreaming = WebAssembly.instantiateStreaming;
if (origStreaming) {
  WebAssembly.instantiateStreaming = async function (...a) {
    const result = await origStreaming.apply(this, a);
    captureMemory(result.instance);
    return result;
  };
}

const loadStart = performance.now();
const loadHighs = createRequire(import.meta.url)(modulePath);
const highs = await loadHighs({ print: () => {}, printErr: () => {} });
const loadMs = performance.now() - loadStart;
// Startup memory: process RSS and Wasm memory size right after instantiation.
const rssAfterLoadKb = Math.round(process.memoryUsage().rss / 1024);
const wasmBytesAfterLoad = wasmMemory ? wasmMemory.buffer.byteLength : null;
const pthreadStats = () => (typeof highs.researchPthreadStats === "function" ? highs.researchPthreadStats() : null);
const pthreadsAfterLoad = pthreadStats();
let maxRunningPthreads = 0;
const samplePthreads = () => {
  const st = pthreadStats();
  if (st && st.running > maxRunningPthreads) maxRunningPthreads = st.running;
};

const lp = fs.readFileSync(args.lp, "utf8");
const model = highs.createModel({ format: "lp", data: lp });
const callbacks = {};
let improving = 0;
let logLines = 0;
let lastLog = null;
let rootDual = null; // dual bound at the end of the root node (last log line with 0 nodes)
let firstPrimal = null;
let firstPrimalMs = null;
let t0 = 0;
if (callbacksMode === "production") {
  const { callbackType } = highs.constants;
  callbacks[callbackType.mipImprovingSolution] = ({ data }) => {
    // An app copies the solution vector out on every improvement.
    if (data.mip_solution) improving += data.mip_solution.length > 0 ? 1 : 0;
    samplePthreads();
    if (firstPrimal === null) {
      firstPrimal = data.objective_function_value;
      firstPrimalMs = performance.now() - t0;
    }
  };
  callbacks[callbackType.mipLogging] = ({ data }) => {
    logLines += 1;
    samplePthreads();
    if (Number(data.mip_node_count) === 0) rootDual = data.mip_dual_bound;
    lastLog = {
      primal: data.mip_primal_bound,
      dual: data.mip_dual_bound,
      nodes: Number(data.mip_node_count),
      lpIters: Number(data.mip_total_lp_iterations),
    };
  };
}
model.options.set({
  output_flag: callbacksMode === "production",
  log_to_console: false,
  mip_rel_gap: 0,
  mip_abs_gap: gap,
  random_seed: seed,
  time_limit: timeLimit,
  ...(threads === null ? {} : { threads }),
  ...(parallel === null ? {} : { parallel }),
});

const cpu0 = process.cpuUsage();
t0 = performance.now();
const { modelStatus } = model.run(callbacks);
const solveMs = performance.now() - t0;
const cpu = process.cpuUsage(cpu0);
// Process CPU time covers every thread (main + pthread workers), so
// cpu/wall > 1 is direct evidence that more than one thread was busy.
const cpuMs = (cpu.user + cpu.system) / 1000;
samplePthreads();
const pthreadsAfterRun = pthreadStats();

const info = (key) => model.info.get(key);
const statusName = Object.entries(highs.constants.modelStatus).find(([, v]) => v === modelStatus)?.[0] ?? String(modelStatus);
const primal = info("objective_function_value");
const dual = info("mip_dual_bound");
const out = {
  module: args.module,
  model: path.basename(args.lp, ".lp"),
  seed,
  gapTarget: gap,
  status: statusName,
  threads,
  parallel,
  solveMs,
  cpuMs,
  cpuWallRatio: cpuMs / solveMs,
  loadMs,
  nodes: Number(info("mip_node_count")),
  lpIterations: Number(info("simplex_iteration_count")),
  primal,
  dual,
  absGap: Math.abs(primal - dual),
  // Production-gap compliance: stopped because the absolute gap was reached.
  gapReached: statusName === "optimal" && Math.abs(primal - dual) <= gap + 1e-9 * Math.max(1, Math.abs(primal)),
  rootDual,
  firstPrimal,
  firstPrimalMs,
  mipGapPct: info("mip_gap"),
  improvingCallbacks: improving,
  logCallbacks: logLines,
  lastLog,
  wasmMemoryBytes: wasmMemory ? wasmMemory.buffer.byteLength : null,
  wasmBytesAfterLoad,
  rssAfterLoadKb,
  sharedMemory: wasmMemory ? wasmMemory.buffer instanceof SharedArrayBuffer : null,
  pthreadsAfterLoad,
  pthreadsAfterRun,
  maxRunningPthreads,
  maxRssKb: process.resourceUsage().maxRSS,
};

if (info("primal_solution_status") === highs.constants.solutionStatus.feasible) {
  const { colValue } = model.getSolution();
  const values = new Map();
  for (let j = 0; j < colValue.length; j += 1) values.set(model.getColName(j), colValue[j]);
  const check = checkSolution(loadModelJson(args.json), values);
  out.valid = check.ok;
  out.checkedObjective = check.objective;
  out.objectiveMismatch = Math.abs(check.objective - primal) > 1e-6 * Math.max(1, Math.abs(primal));
  out.checkProblems = check.problems.slice(0, 5);
} else {
  out.valid = false;
  out.checkProblems = ["no feasible solution"];
}
const d0 = performance.now();
model.dispose(); // Highs_destroy also joins the pthread pool's HiGHS threads
out.disposeMs = performance.now() - d0;
out.pthreadsAfterDispose = pthreadStats();
// Write synchronously and exit: idle pool workers must not keep Node alive.
fs.writeSync(1, JSON.stringify(out) + "\n");
process.exit(0);
