#!/usr/bin/env node
// LP + MIP smoke test for a highs-js build. Loads the CommonJS and native ESM
// loaders of one build (a build/ directory or an installed package root),
// reports the compiled HiGHS version and git hash, and checks a small LP and
// MIP through both the legacy solve() API and the persistent model API.
//
//   node research/smoke.mjs build                       # this checkout
//   node research/smoke.mjs node_modules/highs-ref      # an installed package
//   node research/smoke.mjs build --expect-hash 3fa5161
//
// Prints one JSON object and exits non-zero if any check fails.

import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const target = resolve(args[0] ?? "build");
const hashIndex = args.indexOf("--expect-hash");
const expectHash = hashIndex >= 0 ? args[hashIndex + 1] : null;

// Accept either a build/ directory or a package root containing build/.
const dir = existsSync(join(target, "highs.js")) ? target : join(target, "build");
const require = createRequire(import.meta.url);
// Emscripten uses the options object passed to a loader as that instance's
// Module object, so every loader call needs a fresh one.
const quiet = () => ({ print: () => {}, printErr: () => {} });

const LP = `Maximize
 obj: x + 2 y
Subject To
 c1: x + y <= 20
 c2: x - y >= -30
Bounds
 0 <= x
 0 <= y
End`;

const MIP = `Maximize
 obj: 5 x + 4 y
Subject To
 c1: 6 x + 4 y <= 24
 c2: x + 2 y <= 6
Bounds
 0 <= x
 0 <= y
General
 x y
End`;

const checks = [];
function check(name, ok, detail) {
  checks.push({ name, ok: Boolean(ok), ...(detail === undefined ? {} : { detail }) });
}
const near = (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));

function exercise(label, highs) {
  const lp = highs.solve(LP);
  check(`${label} legacy LP`, lp.Status === "Optimal" && near(lp.ObjectiveValue, 40), {
    status: lp.Status,
    objective: lp.ObjectiveValue,
  });

  const mip = highs.solve(MIP);
  check(
    `${label} legacy MIP`,
    mip.Status === "Optimal" &&
      near(mip.ObjectiveValue, 20) &&
      near(mip.Columns.x.Primal, 4) &&
      near(mip.Columns.y.Primal, 0),
    { status: mip.Status, objective: mip.ObjectiveValue, x: mip.Columns.x?.Primal, y: mip.Columns.y?.Primal },
  );

  // Persistent API: maximize 5x + 4y over the same MIP, integer columns.
  const model = highs.createModel({
    numCols: 2,
    numRows: 2,
    sense: -1,
    offset: 0,
    colCost: new Float64Array([5, 4]),
    colLower: new Float64Array([0, 0]),
    colUpper: new Float64Array([Infinity, Infinity]),
    rowLower: new Float64Array([-Infinity, -Infinity]),
    rowUpper: new Float64Array([24, 6]),
    matrix: {
      format: "csc",
      numRows: 2,
      numCols: 2,
      starts: new Int32Array([0, 2, 4]),
      indices: new Int32Array([0, 1, 0, 1]),
      values: new Float64Array([6, 1, 4, 2]),
    },
    integrality: new Int32Array([1, 1]),
  });
  try {
    const run = model.run();
    const status = model.getModelStatus();
    const objective = model.getObjectiveValue();
    const solution = model.getSolution();
    check(
      `${label} persistent MIP`,
      status === highs.constants.modelStatus.optimal &&
        near(objective, 20) &&
        near(solution.colValue[0], 4) &&
        near(solution.colValue[1], 0),
      { runStatus: run.status, modelStatus: status, objective, colValue: Array.from(solution.colValue) },
    );
  } finally {
    model.dispose();
  }
  return highs.version;
}

function errorDetail(error) {
  return { message: String(error?.message ?? error), stack: String(error?.stack ?? "").split("\n").slice(0, 6).join("\n") };
}
async function phase(label, load) {
  try {
    const highs = await load();
    return exercise(label, highs);
  } catch (error) {
    check(`${label} completed without throwing`, false, errorDetail(error));
    return null;
  }
}

const version = await phase("cjs", () => require(join(dir, "highs.js"))(quiet()));
const esmVersion = await phase("esm", async () =>
  (await import(pathToFileURL(join(dir, "highs.mjs")).href)).default(quiet()),
);
check("cjs/esm report the same version", version && JSON.stringify(version) === JSON.stringify(esmVersion));

if (expectHash) {
  check(`gitHash identifies ${expectHash}`, String(version?.gitHash).includes(expectHash), {
    gitHash: version?.gitHash,
  });
}

const result = {
  build: dir,
  node: process.version,
  version: version ? { ...version } : null,
  ok: checks.every((entry) => entry.ok),
  checks,
};
console.log(JSON.stringify(result, null, 2));
process.exit(result.ok ? 0 : 1);
