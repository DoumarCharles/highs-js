// JavaScript-interface and callback tests for the pthreads build.
//
//   node research/scripts/pthread-api-test.mjs --module dist/wasm-pthreads/highs.js \
//        --models models --out results/api-test.json
//
// Each test runs in its own fresh Node process (this script with --test NAME),
// with a hard timeout, so a crash or deadlock in one test is recorded and the
// others still run. Synthetic models only.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { performance } from "node:perf_hooks";
import { Worker, isMainThread } from "node:worker_threads";
import { checkSolution, loadModelJson } from "./check.mjs";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, all) => (i % 2 === 0 ? [...acc, [cur.replace(/^--/, ""), all[i + 1]]] : acc), []),
);
const modulePath = path.resolve(args.module);
const modelsDir = path.resolve(args.models);
const MEDIUM = "gapd_a5_j50_s4"; // ~15 s single-thread Wasm to its gap
const SMALL = "lotsize_i6_t20_s2";
const manifest = JSON.parse(fs.readFileSync(path.join(modelsDir, "manifest.json"), "utf8"));
const gapOf = (name) => manifest.find((m) => m.name === name).gap;
const lpOf = (name) => fs.readFileSync(path.join(modelsDir, `${name}.lp`), "utf8");
const osThreads = () => Number((fs.readFileSync("/proc/self/status", "utf8").match(/^Threads:\s+(\d+)/m) || [])[1]);

const TESTS = {
  // Confirms HiGHS really uses the requested threads: its own MIP header
  // ("Thread count X ... Using W max workers. Parallel search on|off"),
  // pthread workers running, and process CPU time vs wall time.
  async "threads-1"(h) { return verifyThreads(h, 1, "off"); },
  async "threads-2"(h) { return verifyThreads(h, 2, "on"); },
  async "threads-4"(h) { return verifyThreads(h, 4, "on"); },

  // Every callback type registered at once with 4 threads, plus one test per
  // type (see below): counts, off-main-thread calls, solution vectors, and
  // validity. A crash in a single-type test pins down an unsafe callback.
  async "callbacks-all"(h) { return callbackTest(h, Object.keys(h.constants.callbackType)); },

  // mipInterrupt from JS stops a 4-thread search; time from the interrupt
  // request to run() returning; solution still readable; pool released.
  async interrupt(h) {
    const { callbackType } = h.constants;
    const model = h.createModel({ format: "lp", data: lpOf(MEDIUM) });
    model.options.set({ output_flag: true, log_to_console: false, mip_rel_gap: 0, mip_abs_gap: 0, threads: 4, parallel: "on", time_limit: 120 });
    let haveIncumbent = false;
    let requestedAt = null;
    const t0 = performance.now();
    const { modelStatus } = model.run({
      [callbackType.mipImprovingSolution]: () => { haveIncumbent = true; },
      [callbackType.mipInterrupt]: (event) => {
        if (haveIncumbent && performance.now() - t0 > 2000) {
          requestedAt ??= performance.now();
          event.interrupt();
        }
      },
    });
    const returnedAt = performance.now();
    const status = statusName(h, modelStatus);
    const check = checkModel(model, MEDIUM);
    const beforeDispose = stats(h);
    model.dispose();
    const afterDispose = stats(h);
    // Re-use after an interrupt.
    const again = solveOnce(h, SMALL, { threads: 4, parallel: "on", time_limit: 30 });
    const ok = status === "interrupted" && check.ok && afterDispose?.running === 0 && again.valid;
    return { ok, details: `status ${status}; interrupt latency ${requestedAt ? (returnedAt - requestedAt).toFixed(0) : "n/a"} ms; solution valid ${check.ok}; pthreads before dispose ${JSON.stringify(beforeDispose)}, after ${JSON.stringify(afterDispose)}; next solve ${again.status} valid ${again.valid}` };
  },

  // Ten create/run/dispose cycles with 4 threads in one runtime: the pool
  // must be reused, never grown, and every solve valid.
  async "repeated-solves"(h) {
    const per = [];
    for (let i = 0; i < 10; i += 1) per.push(solveOnce(h, SMALL, { threads: 4, parallel: "on", time_limit: 120, random_seed: i }));
    const maxTotal = Math.max(...per.map((p) => Math.max(p.after?.total ?? 0, p.during?.total ?? 0)));
    const ok = per.every((p) => p.valid && p.gapOk) && maxTotal <= 4 && per.every((p) => p.after?.running === 0) && per.every((p) => (p.during?.running ?? 0) === 3);
    return { ok, details: `statuses ${per.map((p) => p.status).join(",")}; gap reached ${per.map((p) => p.gapOk).join(",")}; nodes ${per.map((p) => p.nodes).join(",")}; pthreads running mid-solve ${per.map((p) => p.during?.running).join(",")}; CPU/wall ${per.map((p) => p.cpuWall.toFixed(2)).join(",")}; ms ${per.map((p) => p.ms.toFixed(0)).join(",")}; dispose ms ${per.map((p) => p.disposeMs.toFixed(1)).join(",")}; max workers ${maxTotal}; OS threads after ${osThreads()}` };
  },

  // Same model solved twice (scheduler persists between runs), then the
  // thread count changed without disposing: HiGHS refuses (global scheduler).
  async "rerun-and-thread-change"(h) {
    const model = h.createModel({ format: "lp", data: lpOf(SMALL) });
    const base = { output_flag: true, log_to_console: false, mip_rel_gap: 0, mip_abs_gap: gapOf(SMALL), time_limit: 120 };
    model.options.set({ ...base, threads: 4, parallel: "on" });
    const r1 = statusName(h, model.run().modelStatus);
    const v1 = checkModel(model, SMALL).ok;
    model.clearSolver();
    const r2 = statusName(h, model.run().modelStatus);
    const v2 = checkModel(model, SMALL).ok;
    model.clearSolver();
    model.options.set({ threads: 2 });
    let r3;
    let r3error = null;
    try {
      r3 = statusName(h, model.run().modelStatus);
    } catch (e) {
      r3error = String(e?.message ?? e).slice(0, 200);
    }
    model.dispose();
    // After dispose the scheduler is torn down, so 2 threads now works.
    const after = solveOnce(h, SMALL, { threads: 2, parallel: "on", time_limit: 120 });
    const ok = v1 && v2 && after.valid;
    return { ok, details: `run1 ${r1} valid ${v1}; run2 ${r2} valid ${v2}; threads 4→2 without dispose: ${r3error ? `throws "${r3error}"` : `status ${r3}`}; after dispose threads=2: ${after.status} valid ${after.valid}, CPU/wall ${after.cpuWall.toFixed(2)}` };
  },

  // A second live model while the first still holds the 4-thread scheduler.
  async "two-models"(h) {
    const a = h.createModel({ format: "lp", data: lpOf(SMALL) });
    a.options.set({ output_flag: false, mip_rel_gap: 0, mip_abs_gap: gapOf(SMALL), threads: 4, parallel: "on", time_limit: 5 });
    const ra = statusName(h, a.run().modelStatus);
    const b = h.createModel({ format: "lp", data: lpOf(SMALL) });
    b.options.set({ output_flag: false, mip_rel_gap: 0, mip_abs_gap: gapOf(SMALL), threads: 4, parallel: "on", time_limit: 5 });
    const rb = statusName(h, b.run().modelStatus);
    const vb = checkModel(b, SMALL).ok;
    a.dispose(); // tears down the global scheduler while b is alive
    let rb2;
    let err = null;
    try {
      b.clearSolver();
      rb2 = statusName(h, b.run().modelStatus);
    } catch (e) {
      err = String(e?.message ?? e).slice(0, 200);
    }
    const vb2 = err ? false : checkModel(b, SMALL).ok;
    b.dispose();
    return { ok: vb && vb2, details: `A ${ra}; B (shares A's scheduler) ${rb} valid ${vb}; B re-run after A disposed: ${err ? `throws "${err}"` : `${rb2} valid ${vb2}`}; pthreads now ${JSON.stringify(stats(h))}` };
  },

  // Interrupt at the very first mipInterrupt call (before any incumbent).
  async "interrupt-immediate"(h) {
    const model = h.createModel({ format: "lp", data: lpOf(MEDIUM) });
    model.options.set({ output_flag: true, log_to_console: false, mip_rel_gap: 0, mip_abs_gap: gapOf(MEDIUM), ...threadOpts(h, 4), time_limit: 120 });
    let calls = 0;
    const t0 = performance.now();
    const { modelStatus } = model.run({ [h.constants.callbackType.mipInterrupt]: (event) => { calls += 1; event.interrupt(); } });
    const ms = performance.now() - t0;
    const status = statusName(h, modelStatus);
    model.dispose();
    const after = stats(h);
    const again = solveOnce(h, SMALL, { ...threadOpts(h, 4), time_limit: 120 });
    const ok = status === "interrupted" && calls === 1 && again.valid && again.gapOk && (after === null || after.running === 0);
    return { ok, details: `status ${status} after ${ms.toFixed(0)} ms, ${calls} interrupt call(s); pthreads after dispose ${JSON.stringify(after)}; next solve ${again.status}, valid ${again.valid}, gap reached ${again.gapOk}` };
  },

  // Solution injection through mipUserSolution: a known good solution (from a
  // first solve of the same model) is offered at the first query. Run on both
  // builds; "accepted" means HiGHS adopted it as an incumbent.
  async "user-solution"(h) {
    const { callbackType } = h.constants;
    const first = h.createModel({ format: "lp", data: lpOf(MEDIUM) });
    first.options.set({ output_flag: false, mip_rel_gap: 0, mip_abs_gap: gapOf(MEDIUM), ...threadOpts(h, 4), time_limit: 120 });
    first.run();
    const best = Array.from(first.getSolution().colValue);
    const bestObj = first.info.get("objective_function_value");
    first.dispose();
    const model = h.createModel({ format: "lp", data: lpOf(MEDIUM) });
    model.options.set({ output_flag: true, log_to_console: false, mip_rel_gap: 0, mip_abs_gap: gapOf(MEDIUM), ...threadOpts(h, 4), time_limit: 120 });
    const offered = [];
    const improving = [];
    const userLines = [];
    const { modelStatus } = model.run({
      [callbackType.mipUserSolution]: (event) => {
        if (offered.length === 0) offered.push({ origin: event.data?.external_solution_query_origin, status: event.setSolution(best) });
        else offered.push({ origin: event.data?.external_solution_query_origin, status: "not offered" });
      },
      [callbackType.mipImprovingSolution]: ({ data }) => improving.push(data.objective_function_value),
      [callbackType.logging]: ({ message }) => { if (/^\s*X\s/.test(message)) userLines.push(message.trim().slice(0, 80)); },
    });
    const status = statusName(h, modelStatus);
    const check = checkModel(model, MEDIUM);
    model.dispose();
    const accepted = userLines.length > 0 || (improving.length > 0 && Math.abs(improving[0] - bestObj) < 1e-6);
    return { ok: check.ok && offered.length > 0, details: `queries ${offered.length}; first offer ${JSON.stringify(offered[0])}; injected objective ${bestObj}; first improving objectives ${JSON.stringify(improving.slice(0, 3))}; log lines with source X ${userLines.length}; accepted ${accepted}; final ${status}, valid ${check.ok}` };
  },

  // Solver reset on one model: run, clearSolver + new seed, resetOptions +
  // options again; each run valid and at its gap.
  async "solver-reset"(h) {
    const model = h.createModel({ format: "lp", data: lpOf(SMALL) });
    const opts = { output_flag: false, mip_rel_gap: 0, mip_abs_gap: gapOf(SMALL), ...threadOpts(h, 4), time_limit: 120 };
    const runs = [];
    const go = (label) => {
      const status = statusName(h, model.run().modelStatus);
      runs.push({ label, status, valid: checkModel(model, SMALL).ok, gap: gapReached(h, model, SMALL, status), nodes: Number(model.info.get("mip_node_count")) });
    };
    model.options.set(opts);
    go("first");
    model.clearSolver();
    model.options.set({ random_seed: 7 });
    go("clearSolver+seed7");
    model.clearSolver();
    model.options.reset();
    model.options.set(opts);
    go("options.reset");
    model.dispose();
    const ok = runs.every((r) => r.valid && r.gap);
    return { ok, details: JSON.stringify(runs) + `; pthreads after dispose ${JSON.stringify(stats(h))}` };
  },

  // C++ exception propagation: HiGHS's LP reader reports syntax errors by
  // throwing std::invalid_argument and catching it. Expect a JS error, and a
  // runtime that still solves afterwards. Run on both builds.
  async "malformed-lp"(h) {
    let error = null;
    try {
      const m = h.createModel({ format: "lp", data: "Minimize\n obj: x +\nSubject To\n c1: x >= = 1\nEnd\n" });
      m.dispose();
    } catch (e) {
      error = `${e?.name}: ${String(e?.message ?? e).slice(0, 160)}`;
    }
    const again = solveOnce(h, SMALL, { ...threadOpts(h, 4), time_limit: 120 });
    return { ok: error !== null && again.valid && again.gapOk, details: `malformed LP -> ${error ?? "no error raised"}; next solve ${again.status} valid ${again.valid} gap ${again.gapOk}` };
  },

  // Out of memory, tested rather than assumed: the shared memory's maximum is
  // capped (RESEARCH_MEMORY_CAP_MB) before loading, so the solve runs out of
  // Wasm memory part-way. Records what happens and whether the runtime can
  // still solve afterwards. pthreads build only (its memory is created in JS).
  async "oom-threads-1-cap40"(h) { return oomTest(h, 1); },
  async "oom-threads-4-cap40"(h) { return oomTest(h, 4); },
  async "oom-threads-4-cap64"(h) { return oomTest(h, 4); },
  async "oom-threads-4-cap96"(h) { return oomTest(h, 4); },
  async "oom-threads-4-nocap"(h) { return oomTest(h, 4); },

  // The legacy one-shot API with threads.
  async "legacy-solve"(h) {
    const out = [];
    for (let i = 0; i < 2; i += 1) {
      const t0 = performance.now();
      const r = h.solve(lpOf(SMALL), { ...threadOpts(h, 4), time_limit: 120, mip_rel_gap: 0, mip_abs_gap: gapOf(SMALL), output_flag: false });
      const values = new Map(Object.entries(r.Columns ?? {}).map(([name, c]) => [name, c.Primal]));
      const check = checkSolution(loadModelJson(path.join(modelsDir, `${SMALL}.json`)), values);
      out.push({ status: r.Status, obj: r.ObjectiveValue, valid: check.ok, ms: Math.round(performance.now() - t0) });
    }
    const ok = out.every((r) => r.status === "Optimal" && Number.isFinite(r.obj) && r.valid);
    return { ok, details: `${JSON.stringify(out)}; pthreads ${JSON.stringify(stats(h))}` };
  },

  // The app stops a solve by terminating the Web Worker it runs in. Same in
  // Node: run the 4-thread solve inside a worker_threads Worker (so HiGHS's
  // pthreads are nested workers, as in the browser), terminate it mid-solve,
  // check OS threads are released, then solve again in a new Worker.
  async "terminate-worker"() {
    const before = osThreads();
    const startWorker = (timeLimit) =>
      new Worker(new URL(import.meta.url), {
        argv: ["--module", modulePath, "--models", modelsDir, "--in-worker", String(timeLimit)],
      });
    const w1 = startWorker(120);
    const started = await new Promise((resolve, reject) => {
      w1.on("message", (m) => m === "solving" && resolve(performance.now()));
      w1.on("error", reject);
    });
    await new Promise((r) => setTimeout(r, 3000));
    const during = osThreads();
    const t0 = performance.now();
    await w1.terminate();
    const terminateMs = performance.now() - t0;
    await new Promise((r) => setTimeout(r, 1500));
    const after = osThreads();
    const w2 = startWorker(20);
    const result = await new Promise((resolve, reject) => {
      w2.on("message", (m) => m !== "solving" && resolve(m));
      w2.on("error", reject);
    });
    await w2.terminate();
    await new Promise((r) => setTimeout(r, 1500));
    const end = osThreads();
    const ok = result.valid && after <= before + 2 && end <= before + 2;
    return { ok, details: `OS threads: before ${before}, during 4-thread solve ${during}, 1.5 s after terminate ${after}, at end ${end}; terminate() resolved in ${terminateMs.toFixed(0)} ms (${((t0 - started) / 1000).toFixed(1)} s into the solve); second Worker: ${result.status} valid ${result.valid} in ${(result.ms / 1000).toFixed(1)} s` };
  },
};

for (const name of ["logging", "simplexInterrupt", "ipmInterrupt", "mipSolution", "mipImprovingSolution", "mipLogging", "mipInterrupt", "mipCutPool", "mipUserSolution"]) {
  TESTS[`callback-${name}`] = (h) => callbackTest(h, [name]);
}

function callbackTest(h, names) {
  const { callbackType } = h.constants;
  const counts = {};
  let offMain = 0;
  const lengths = new Set();
  const model = h.createModel({ format: "lp", data: lpOf(MEDIUM) });
  const cbs = {};
  for (const name of names) {
    counts[name] = 0;
    cbs[callbackType[name]] = (event) => {
      counts[name] += 1;
      if (!isMainThread) offMain += 1;
      if (event.data?.mip_solution) lengths.add(event.data.mip_solution.length);
    };
  }
  model.options.set({ output_flag: true, log_to_console: false, mip_rel_gap: 0, mip_abs_gap: gapOf(MEDIUM), ...threadOpts(h, 4), time_limit: 60 });
  const t0 = performance.now();
  const { modelStatus } = model.run(cbs);
  const ms = performance.now() - t0;
  const check = checkModel(model, MEDIUM);
  const gapOk = gapReached(h, model, MEDIUM, statusName(h, modelStatus));
  const numCols = model.getSolution().colValue.length;
  model.dispose();
  const lengthsOk = [...lengths].every((n) => n === numCols);
  const ok = check.ok && gapOk && offMain === 0 && lengthsOk;
  return { ok, details: `status ${statusName(h, modelStatus)} in ${(ms / 1000).toFixed(1)} s; calls ${JSON.stringify(counts)}; off-main-thread ${offMain}; solution vector lengths ${JSON.stringify([...lengths])} (model ${numCols}); valid ${check.ok}; gap reached ${gapOk}` };
}

function gapReached(h, model, name, status) {
  const primal = model.info.get("objective_function_value");
  const dual = model.info.get("mip_dual_bound");
  return status === "optimal" && Math.abs(primal - dual) <= gapOf(name) + 1e-9 * Math.max(1, Math.abs(primal));
}

function threadOpts(h, n) {
  return typeof h.researchPthreadStats === "function" ? { threads: n, parallel: n > 1 ? "on" : "off" } : {};
}

async function oomTest(h, n) {
  const model = h.createModel({ format: "lp", data: lpOf(MEDIUM) });
  model.options.set({ output_flag: false, mip_rel_gap: 0, mip_abs_gap: 0, ...threadOpts(h, n), time_limit: 120 });
  let outcome;
  let logs = 0;
  let lastNodes = 0;
  const t0 = performance.now();
  try {
    const status = statusName(h, model.run({ [h.constants.callbackType.mipLogging]: ({ data }) => { logs += 1; lastNodes = Number(data.mip_node_count); } }).modelStatus);
    outcome = `run returned ${status}`;
  } catch (e) {
    let what = `${e?.constructor?.name}: ${String(e?.message ?? e).slice(0, 200)}`;
    if (typeof WebAssembly.Exception === "function" && e instanceof WebAssembly.Exception && typeof h.getExceptionMessage === "function") {
      try {
        what += ` [C++: ${JSON.stringify(h.getExceptionMessage(e))}]`;
      } catch {}
    }
    outcome = `run threw ${typeof e === "string" ? `"${e}"` : what}`;
  }
  outcome += ` after ${(performance.now() - t0).toFixed(0)} ms (${logs} MIP log lines, last node count ${lastNodes}; peak pthreads ${JSON.stringify(stats(h))})`;
  let disposed = "ok";
  try {
    model.dispose();
  } catch (e) {
    disposed = `threw ${String(e?.message ?? e).slice(0, 120)}`;
  }
  let after;
  try {
    const tiny = h.solve("Maximize\n obj: x + 2 y\nSubject To\n c1: x + y <= 4\nBounds\n 0 <= x <= 3\nGenerals\n x y\nEnd\n", threadOpts(h, n));
    after = `${tiny.Status} ${tiny.ObjectiveValue}`;
  } catch (e) {
    after = `threw ${typeof e === "string" ? `"${e}"` : String(e?.message ?? e).slice(0, 160)}`;
  }
  // Informational: pass means the process survived and reported something.
  return { ok: true, details: `cap ${capMatch ? `${capMatch[1]} MB` : "none (2 GB)"}, threads ${n}: ${outcome}; dispose ${disposed}; tiny solve afterwards: ${after}; stderr: ${stderrLines.slice(-4).join(" / ").slice(0, 400)}` };
}

function stats(h) {
  return typeof h.researchPthreadStats === "function" ? h.researchPthreadStats() : null;
}
function statusName(h, code) {
  return Object.entries(h.constants.modelStatus).find(([, v]) => v === code)?.[0] ?? String(code);
}
function checkModel(model, name) {
  const { colValue } = model.getSolution();
  const values = new Map();
  for (let j = 0; j < colValue.length; j += 1) values.set(model.getColName(j), colValue[j]);
  return checkSolution(loadModelJson(path.join(modelsDir, `${name}.json`)), values);
}
function solveOnce(h, name, opts) {
  const model = h.createModel({ format: "lp", data: lpOf(name) });
  model.options.set({ output_flag: true, log_to_console: false, mip_rel_gap: 0, mip_abs_gap: gapOf(name), ...opts });
  let during = null;
  const cpu0 = process.cpuUsage();
  const t0 = performance.now();
  const { modelStatus } = model.run({ [h.constants.callbackType.mipLogging]: () => { during = stats(h); } });
  const ms = performance.now() - t0;
  const cpu = process.cpuUsage(cpu0);
  const status = statusName(h, modelStatus);
  const valid = checkModel(model, name).ok;
  const gapOk = gapReached(h, model, name, status);
  const nodes = Number(model.info.get("mip_node_count"));
  const d0 = performance.now();
  model.dispose();
  return { status, valid, gapOk, nodes, ms, cpuWall: (cpu.user + cpu.system) / 1000 / ms, during, after: stats(h), disposeMs: performance.now() - d0 };
}
async function verifyThreads(h, n, parallel) {
  const { callbackType } = h.constants;
  const model = h.createModel({ format: "lp", data: lpOf(MEDIUM) });
  model.options.set({ output_flag: true, log_to_console: false, mip_rel_gap: 0, mip_abs_gap: gapOf(MEDIUM), threads: n, parallel, time_limit: 60 });
  let header = null;
  let maxRunning = 0;
  const cpu0 = process.cpuUsage();
  const t0 = performance.now();
  const { modelStatus } = model.run({
    [callbackType.logging]: ({ message }) => {
      const m = /Thread count (\d+) \(of (\d+) threads\)\. Using (\d+) max workers\. Parallel search (on|off)/.exec(message);
      if (m) header = { threadCount: +m[1], hardwareThreads: +m[2], maxWorkers: +m[3], parallelSearch: m[4] };
    },
    [callbackType.mipLogging]: () => { maxRunning = Math.max(maxRunning, stats(h)?.running ?? 0); },
  });
  const ms = performance.now() - t0;
  const cpu = process.cpuUsage(cpu0);
  const cpuWall = (cpu.user + cpu.system) / 1000 / ms;
  const check = checkModel(model, MEDIUM);
  const status = statusName(h, modelStatus);
  const gapOk = gapReached(h, model, MEDIUM, status);
  const nodes = Number(model.info.get("mip_node_count"));
  const lpIters = Number(model.info.get("simplex_iteration_count"));
  model.dispose();
  const after = stats(h);
  const expectWorkers = n > 1 && parallel === "on" ? Math.ceil(1.7 * n) : 1;
  const ok = header?.threadCount === n && header.maxWorkers === expectWorkers && maxRunning === n - 1 && check.ok && gapOk && (n === 1 || cpuWall > 1.3) && after?.running === 0;
  return { ok, details: `HiGHS header ${JSON.stringify(header)} (expected ${n} threads, ${expectWorkers} workers); pthreads running during solve ${maxRunning} (expected ${n - 1}); CPU/wall ${cpuWall.toFixed(2)}; ${status} in ${(ms / 1000).toFixed(1)} s, ${nodes} nodes, ${lpIters} LP iterations; valid ${check.ok}; gap reached ${gapOk}; pthreads after dispose ${JSON.stringify(after)}` };
}

const stderrLines = [];
const capMatch = /cap(\d+)$/.exec(args.test ?? "");
if (capMatch) {
  process.env.RESEARCH_MEMORY_CAP_MB = capMatch[1];
  const capPages = Math.floor((Number(capMatch[1]) * 1048576) / 65536);
  const Orig = WebAssembly.Memory;
  WebAssembly.Memory = class CappedMemory extends Orig {
    constructor(d) {
      super(d.maximum !== undefined && d.maximum > capPages ? { ...d, maximum: Math.max(capPages, d.initial) } : d);
    }
  };
}
async function load() {
  const loadHighs = createRequire(import.meta.url)(modulePath);
  const t0 = performance.now();
  const h = await loadHighs({ print: () => {}, printErr: (s) => stderrLines.push(String(s)) });
  return { h, loadMs: performance.now() - t0 };
}

if (!isMainThread && process.argv.includes("--in-worker")) {
  // Child Worker body for "terminate-worker".
  const { parentPort } = await import("node:worker_threads");
  const timeLimit = Number(process.argv[process.argv.indexOf("--in-worker") + 1]);
  const { h } = await load();
  parentPort.postMessage("solving");
  const t0 = performance.now();
  const model = h.createModel({ format: "lp", data: lpOf(MEDIUM) });
  model.options.set({ output_flag: false, mip_rel_gap: 0, mip_abs_gap: gapOf(MEDIUM), threads: 4, parallel: "on", time_limit: timeLimit });
  const { modelStatus } = model.run();
  const valid = checkModel(model, MEDIUM).ok;
  model.dispose();
  parentPort.postMessage({ status: statusName(h, modelStatus), valid, ms: performance.now() - t0 });
} else if (args.test) {
  let result;
  try {
    const { h, loadMs } = await load();
    result = await TESTS[args.test](h);
    result.loadMs = loadMs;
  } catch (e) {
    // Thrown strings (Emscripten control flow such as 'unwind') carry no
    // stack: rethrow so the parent's --trace-uncaught shows where.
    if (typeof e === "string") throw e;
    result = { ok: false, details: `exception: ${typeof e === "string" ? `thrown string "${e}"` : String(e?.stack ?? e).slice(0, 600)}; stderr: ${stderrLines.slice(-8).join(" / ").slice(0, 800)}` };
  }
  fs.writeSync(1, JSON.stringify(result) + "\n");
  process.exit(0);
} else if (isMainThread) {
  const tests = [];
  const only = args.only ? new Set(args.only.split(",")) : null;
  for (const name of Object.keys(TESTS)) {
    if (only && !only.has(name)) continue;
    const t0 = performance.now();
    const child = spawnSync(process.execPath, ["--trace-uncaught", new URL(import.meta.url).pathname, "--module", modulePath, "--models", modelsDir, "--test", name], {
      encoding: "utf8",
      env: { ...process.env, RESEARCH_MEMORY_CAP_MB: process.env.RESEARCH_MEMORY_CAP_MB || "40" },
      timeout: 300_000,
      killSignal: "SIGKILL",
    });
    const ms = performance.now() - t0;
    let r;
    if (child.error?.code === "ETIMEDOUT") r = { ok: false, details: "HUNG: killed after 300 s" };
    else if (child.status !== 0) r = { ok: false, details: `process exit ${child.status} signal ${child.signal}: ${(child.stderr || "").slice(-2500)}` };
    else {
      try {
        r = JSON.parse(child.stdout.trim().split("\n").pop());
      } catch {
        r = { ok: false, details: `no result from child (exit 0); stdout: ${(child.stdout || "").slice(-600)}; stderr: ${(child.stderr || "").slice(-1500)}` };
      }
    }
    if (name.startsWith("oom")) r.informational = true;
    tests.push({ name, ...r, ms });
    console.log(`${r.ok ? "PASS" : "FAIL"} ${name} (${(ms / 1000).toFixed(1)} s): ${r.details}`);
    // Written after every test, so a later failure never loses earlier results.
    fs.mkdirSync(path.dirname(args.out), { recursive: true });
    fs.writeFileSync(args.out, JSON.stringify({ module: args.module, cpus: os.cpus().length, tests }, null, 2));
  }
}
