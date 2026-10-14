// Runs ONE HiGHS WebAssembly MIP solve in this (fresh) Node process and
// prints a single JSON line. bench.mjs spawns one process per solve so that
// memory, JIT state and heap growth never carry over between runs.
//
// node research/scripts/run-one.mjs --module build/highs.js --lp m.lp --json m.json \
//      --gap 10 --seed 0 --time-limit 300 [--callbacks production|none]
//
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

// Capture the Wasm memory so its final size (= peak, Wasm memory never
// shrinks) can be reported.
let wasmMemory = null;
const captureMemory = (instance) => {
  for (const value of Object.values(instance.exports)) if (value instanceof WebAssembly.Memory) wasmMemory = value;
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
    if (firstPrimal === null) {
      firstPrimal = data.objective_function_value;
      firstPrimalMs = performance.now() - t0;
    }
  };
  callbacks[callbackType.mipLogging] = ({ data }) => {
    logLines += 1;
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
});

t0 = performance.now();
const { modelStatus } = model.run(callbacks);
const solveMs = performance.now() - t0;

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
  solveMs,
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
  out.checkProblems = check.problems;
} else {
  out.valid = false;
  out.checkProblems = ["no feasible solution"];
}
model.dispose();
process.stdout.write(JSON.stringify(out) + "\n");
