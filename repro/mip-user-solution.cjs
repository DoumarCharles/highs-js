// Standalone repro for the mipUserSolution callback bug (see REPORT.md).
//
// A solution handed to HiGHS from the mipUserSolution callback (type 9) is
// ignored by highs-js <= 1.15.3, while the same vector works as a start via
// model.setSolution() before run().
//
// Usage:
//   node repro/mip-user-solution.cjs                      # this repo's build/highs.js
//   node repro/mip-user-solution.cjs path/to/highs.js     # e.g. node_modules/highs/build/highs.js
//   SHOW_LOG=1 node repro/mip-user-solution.cjs ...       # also print HiGHS's log
"use strict";
const path = require("node:path");

const loaderPath = path.resolve(
  process.argv[2] || path.join(__dirname, "..", "build", "highs.js")
);
const SHOW_LOG = process.env.SHOW_LOG === "1";

// Deterministic multi-dimensional knapsack: maximize p'x, W x <= c, x binary.
function makeKnapsack(n, m, seed) {
  let s = seed >>> 0;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const profit = new Float64Array(n);
  const weights = []; // weights[i][j]
  for (let i = 0; i < m; i++) weights.push(new Float64Array(n));
  for (let j = 0; j < n; j++) {
    profit[j] = 10 + Math.floor(rnd() * 90);
    for (let i = 0; i < m; i++) weights[i][j] = 5 + Math.floor(rnd() * 45);
  }
  const cap = new Float64Array(m);
  for (let i = 0; i < m; i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) sum += weights[i][j];
    cap[i] = Math.floor(sum / 2);
  }
  // CSC matrix: every column has m entries.
  const starts = new Int32Array(n + 1);
  const indices = new Int32Array(n * m);
  const values = new Float64Array(n * m);
  for (let j = 0; j < n; j++) {
    starts[j] = j * m;
    for (let i = 0; i < m; i++) {
      indices[j * m + i] = i;
      values[j * m + i] = weights[i][j];
    }
  }
  starts[n] = n * m;
  return {
    numCols: n,
    numRows: m,
    sense: -1, // maximize
    offset: 0,
    colCost: profit,
    colLower: new Float64Array(n),
    colUpper: new Float64Array(n).fill(1),
    rowLower: new Float64Array(m).fill(-Infinity),
    rowUpper: cap,
    matrix: { format: "csc", numRows: m, numCols: n, starts, indices, values },
    integrality: new Int32Array(n).fill(1),
    modelName: "mdknapsack",
  };
}

function objectiveOf(source, x) {
  let v = source.offset;
  for (let j = 0; j < source.numCols; j++) v += source.colCost[j] * x[j];
  return v;
}

async function main() {
  const loader = require(loaderPath);
  // highs-js silences HiGHS's stdout unless the loader is given print handlers.
  const highs = await loader(
    SHOW_LOG ? { print: console.log, printErr: console.error } : { print: () => {}, printErr: () => {} }
  );
  console.log(`highs-js runtime: HiGHS ${highs.version.string} (${highs.version.gitHash}) from ${loaderPath}`);
  const ct = highs.constants.callbackType;
  const source = makeKnapsack(300, 10, 12345);

  function baseOptions(model) {
    model.options.set("output_flag", SHOW_LOG);
    model.options.set("log_to_console", SHOW_LOG);
    model.options.set("random_seed", 1);
    model.options.set("mip_rel_gap", 0);
  }

  // 1. A good feasible solution: solve with a short time limit.
  let good;
  {
    const model = highs.createModel(source);
    baseOptions(model);
    model.options.set("time_limit", 2);
    model.run();
    good = Float64Array.from(model.getSolution().colValue);
    console.log(`\n[0] warm-up solve (time_limit=2s): status=${model.getModelStatus()} objective=${objectiveOf(source, good)}`);
    model.dispose();
  }

  // Run a fresh solve with a given mipUserSolution handler, record the
  // trajectory of improving incumbents.
  function run(label, { userSolutionHandler, startSolution, timeLimit = 4 }) {
    const model = highs.createModel(source);
    baseOptions(model);
    model.options.set("time_limit", timeLimit);
    if (startSolution) model.setSolution({ colValue: startSolution });
    const trajectory = [];
    let firings = 0;
    let primalBoundAtSecondFiring;
    const handlers = {
      [ct.mipImprovingSolution](event) {
        trajectory.push({ obj: event.data.objective_function_value, t: +event.data.running_time.toFixed(3), msg: event.message });
      },
    };
    if (userSolutionHandler) {
      handlers[ct.mipUserSolution] = (event) => {
        firings += 1;
        if (firings === 2) primalBoundAtSecondFiring = event.data.mip_primal_bound;
        userSolutionHandler(event, firings);
      };
    }
    const result = model.run(handlers);
    const final = model.getSolution().colValue;
    console.log(`\n[${label}] status=${result.status} modelStatus=${model.getModelStatus()} final objective=${objectiveOf(source, final)} userSolution firings=${firings}`);
    if (firings >= 2) console.log(`    incumbent (mip_primal_bound) at the 2nd mipUserSolution firing: ${primalBoundAtSecondFiring}`);
    console.log("    improving incumbents found by HiGHS itself (objective @ seconds):");
    for (const p of trajectory) console.log(`      ${p.obj} @ ${p.t}`);
    model.dispose();
    return { trajectory, firings, primalBoundAtSecondFiring };
  }

  const goodObj = objectiveOf(source, good);
  console.log(`\nSubmitting a solution with objective ${goodObj}.`);

  const a = run("A: no submission", {});
  const b = run("B: submit at first mipUserSolution firing", {
    userSolutionHandler(event, n) {
      if (n === 1) {
        const status = event.setSolution(good);
        console.log(`    setSolution() at firing #${n}: status=${JSON.stringify(status)} (primal bound before: ${event.data.mip_primal_bound})`);
      }
    },
  });
  const c = run("C: submit at every mipUserSolution firing", {
    userSolutionHandler(event) {
      event.setSolution(good);
    },
  });
  const d = run("D: sparse submission + repairSolution at first firing", {
    userSolutionHandler(event, n) {
      if (n === 1) {
        const indices = Int32Array.from({ length: source.numCols }, (_, j) => j);
        const s1 = event.setSolution({ indices, values: good });
        const s2 = event.repairSolution();
        console.log(`    sparse setSolution status=${JSON.stringify(s1)} repairSolution status=${JSON.stringify(s2)}`);
      }
    },
  });
  const e = run("E: same vector as a start via model.setSolution() before run()", {
    startSolution: good,
  });

  // A user solution that HiGHS accepts becomes its incumbent directly (it is
  // not reported through the improving-solution callback), so look at the
  // primal bound HiGHS reports at the next query.
  const used = (r) => r.primalBoundAtSecondFiring >= goodObj - 1e-6;
  const describe = (r) =>
    `incumbent at 2nd firing = ${r.primalBoundAtSecondFiring}, first improving incumbent = ${r.trajectory.length ? r.trajectory[0].obj : "none"}`;
  console.log(`\nSummary (submitted objective ${goodObj}):`);
  console.log(`  A no submission              : ${describe(a)}`);
  console.log(`  B callback setSolution       : ${describe(b)} -> ${used(b) ? "USED" : "IGNORED"}`);
  console.log(`  C callback setSolution (all) : ${describe(c)} -> ${used(c) ? "USED" : "IGNORED"}`);
  console.log(`  D callback sparse + repair   : ${describe(d)} -> ${used(d) ? "USED" : "IGNORED"}`);
  console.log(`  E start before run()         : first improving incumbent = ${e.trajectory.length ? e.trajectory[0].obj : "none"}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
