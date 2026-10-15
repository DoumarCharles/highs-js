#!/usr/bin/env node
// Observes API and callback behaviour of one highs-js build so two builds
// (e.g. this research build and highs@1.15.3) can be compared field by field.
// Diagnostic only: it records what happens and never fails on a difference.
//
//   node research/behavior-probe.mjs build
//   node research/behavior-probe.mjs reference/package

import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const target = resolve(process.argv[2] ?? "build");
const dir = existsSync(join(target, "highs.js")) ? target : join(target, "build");
const require = createRequire(import.meta.url);
const highs = await require(join(dir, "highs.js"))({ print: () => {}, printErr: () => {} });
const report = { build: dir, version: { ...highs.version } };

function attempt(fn) {
  try {
    return { ok: true, value: fn() };
  } catch (error) {
    return { ok: false, error: `${error?.name}: ${error?.message}` };
  }
}

// 1. Legacy solve() of infeasible LP and MIP.
const infeasibleLp = "Maximize\n a\nsubject to\n a >= 1\nbounds\n a <= 0\nEnd";
for (const [label, text] of [
  ["legacyInfeasibleLp", infeasibleLp],
  ["legacyInfeasibleMip", infeasibleLp.replace("End", "General\n a\nEnd")],
]) {
  report[label] = attempt(() => {
    const result = highs.solve(text);
    return { Status: result.Status, ObjectiveValue: result.ObjectiveValue, columnKeys: Object.keys(result.Columns.a) };
  });
}

// 2. Persistent API on an infeasible LP.
const lpModel = {
  numCols: 1, numRows: 1, sense: -1, offset: 0,
  colCost: new Float64Array([1]), colLower: new Float64Array([0]), colUpper: new Float64Array([0]),
  rowLower: new Float64Array([1]), rowUpper: new Float64Array([Infinity]),
  matrix: { format: "csc", numRows: 1, numCols: 1, starts: new Int32Array([0, 1]), indices: new Int32Array([0]), values: new Float64Array([1]) },
};
{
  const model = highs.createModel(lpModel);
  model.options.set("output_flag", false);
  model.run();
  report.persistentInfeasible = {
    modelStatus: model.getModelStatus(),
    primalSolutionStatus: attempt(() => model.info.get("primal_solution_status")),
    getSolution: attempt(() => Array.from(model.getSolution().colValue)),
    getBasis: attempt(() => Array.from(model.getBasis().colStatus)),
    rawGetSolutionStatus: model.raw.getSolution().status,
  };
  model.dispose();
}

// 3. Callbacks on a deterministic knapsack MIP.
function knapsack(numCols, numRows, seed) {
  let state = seed >>> 0;
  const random = () => (state = (state * 1664525 + 1013904223) >>> 0) / 2 ** 32;
  const colCost = new Float64Array(numCols);
  const rowUpper = new Float64Array(numRows);
  const starts = new Int32Array(numCols + 1);
  const indices = new Int32Array(numCols * numRows);
  const values = new Float64Array(numCols * numRows);
  for (let col = 0; col < numCols; col += 1) {
    colCost[col] = 10 + Math.floor(random() * 90);
    starts[col] = col * numRows;
    for (let row = 0; row < numRows; row += 1) {
      const weight = 5 + Math.floor(random() * 45);
      indices[col * numRows + row] = row;
      values[col * numRows + row] = weight;
      rowUpper[row] += weight;
    }
  }
  starts[numCols] = numCols * numRows;
  for (let row = 0; row < numRows; row += 1) rowUpper[row] = Math.floor(rowUpper[row] / 2);
  return {
    numCols, numRows, sense: -1, offset: 0, colCost,
    colLower: new Float64Array(numCols), colUpper: new Float64Array(numCols).fill(1),
    rowLower: new Float64Array(numRows).fill(-Infinity), rowUpper,
    matrix: { format: "csc", numRows, numCols, starts, indices, values },
    integrality: new Int32Array(numCols).fill(1),
  };
}
function greedy(source) {
  const { numCols, numRows, colCost, rowUpper } = source;
  const values = source.matrix.values;
  const weight = (col) => { let t = 0; for (let r = 0; r < numRows; r += 1) t += values[col * numRows + r]; return t; };
  const order = Array.from({ length: numCols }, (_, c) => c).sort((a, b) => colCost[b] / weight(b) - colCost[a] / weight(a));
  const remaining = Float64Array.from(rowUpper);
  const solution = new Float64Array(numCols);
  for (const col of order) {
    let fits = true;
    for (let r = 0; r < numRows && fits; r += 1) fits = values[col * numRows + r] <= remaining[r];
    if (!fits) continue;
    solution[col] = 1;
    for (let r = 0; r < numRows; r += 1) remaining[r] -= values[col * numRows + r];
  }
  return solution;
}

const types = highs.constants.callbackType;
{
  const source = knapsack(60, 5, 7);
  const model = highs.createModel(source);
  model.options.set({ output_flag: false, random_seed: 1, time_limit: 20 });
  const seen = {};
  const record = (name) => (event) => {
    const entry = (seen[name] ??= { count: 0, dataKeys: Object.keys(event.data).sort(), controls: [] });
    entry.count += 1;
    entry.controls = ["interrupt", "setSolution", "repairSolution"].filter((k) => k in event);
    if (event.data.mip_solution) entry.mipSolutionLength = event.data.mip_solution.length;
  };
  const callbacks = {};
  for (const [name, code] of Object.entries(types)) callbacks[code] = record(name);
  const run = attempt(() => model.run(callbacks).status);
  report.callbacks = {
    run,
    modelStatus: model.getModelStatus(),
    objective: model.getObjectiveValue(),
    getBasisAfterMip: attempt(() => model.getBasis().colStatus.length),
    seen,
  };
  model.dispose();
}

// 4. Known issue (fix-mip-user-solution branch, NOT applied here): does a
//    solution submitted from the mipUserSolution callback reach HiGHS?
{
  const source = knapsack(200, 10, 12345);
  const submitted = greedy(source);
  let submittedObjective = 0;
  for (let c = 0; c < source.numCols; c += 1) submittedObjective += source.colCost[c] * submitted[c];
  const model = highs.createModel(source);
  model.options.set({ output_flag: false, random_seed: 1, time_limit: 5 });
  let firings = 0;
  let setStatus;
  const bounds = [];
  model.run({
    [types.mipUserSolution](event) {
      firings += 1;
      if (firings === 1) setStatus = event.setSolution(submitted).status;
      else bounds.push(event.data.mip_primal_bound);
    },
    [types.mipInterrupt](event) {
      if (firings >= 2) event.interrupt();
    },
  });
  report.userSolution = {
    firings,
    setSolutionStatus: setStatus,
    submittedObjective,
    primalBoundAtSecondFiring: bounds[0] ?? null,
    adopted: bounds.length > 0 ? bounds[0] >= submittedObjective - 1e-6 : null,
  };
  model.dispose();
}

console.log(JSON.stringify(report, null, 2));
