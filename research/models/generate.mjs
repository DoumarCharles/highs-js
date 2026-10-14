// Synthetic MIP benchmark generator for the perf-research branch.
//
// Every instance is a textbook, publicly documented problem class generated
// from a fixed seed. Nothing here is derived from any application model, its
// formulation, or its data. The classes were chosen because, like the hard
// cases this research targets, HiGHS finds a good incumbent early and spends
// most of its time raising the lower bound.
//
//   lotsize  Capacitated multi-item lot sizing with setup times
//            (Trigeiro, Thomas & McClain 1989 style). Weak LP bound, closed by
//            cuts and branching.
//   mkp      Multidimensional 0-1 knapsack (Chu & Beasley 1998 style).
//            Incumbent found almost immediately, bound closes very slowly.
//   gap      Generalized assignment, Chu & Beasley "type D" costs
//            (cost inversely correlated with resource use): hard bound.
//
// Usage: node research/models/generate.mjs <outDir>
// Writes <name>.lp and <name>.json (the same model as data, for the
// independent solution checker) for every instance in INSTANCES.

import fs from "node:fs";
import path from "node:path";

// mulberry32: small, fast, fully deterministic across platforms.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const uniformInt = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));

// Model as data: cols [{name, lo, hi, int}], obj [coef per col], sense,
// rows [{name, idx:[...], val:[...], lo, hi}].
class Model {
  constructor(name, sense = "min") {
    this.name = name;
    this.sense = sense;
    this.cols = [];
    this.obj = [];
    this.rows = [];
  }
  col(name, lo, hi, int, cost) {
    this.cols.push({ name, lo, hi, int });
    this.obj.push(cost);
    return this.cols.length - 1;
  }
  row(name, idx, val, lo, hi) {
    this.rows.push({ name, idx, val, lo, hi });
  }
}

function lotsize({ items, periods, seed, util = 0.85, setupShare = 0.12 }) {
  const r = rng(seed);
  const m = new Model(`lotsize_i${items}_t${periods}_s${seed}`);
  const demand = [];
  const unitTime = [];
  const setupTime = [];
  const setupCost = [];
  const holdCost = [];
  for (let i = 0; i < items; i += 1) {
    demand.push(Array.from({ length: periods }, () => (r() < 0.15 ? 0 : uniformInt(r, 40, 160))));
    unitTime.push(1);
    setupTime.push(uniformInt(r, 10, 50));
    setupCost.push(uniformInt(r, 200, 1200));
    holdCost.push(uniformInt(r, 1, 5));
  }
  let totalLoad = 0;
  for (let i = 0; i < items; i += 1) for (let t = 0; t < periods; t += 1) totalLoad += unitTime[i] * demand[i][t];
  const avgSetup = setupTime.reduce((a, b) => a + b, 0);
  const cap = Math.round((totalLoad / periods) / util + setupShare * avgSetup);

  const x = [];
  const y = [];
  const s = [];
  for (let i = 0; i < items; i += 1) {
    x.push([]);
    y.push([]);
    s.push([]);
    for (let t = 0; t < periods; t += 1) {
      x[i].push(m.col(`x_${i}_${t}`, 0, Infinity, false, 0));
      y[i].push(m.col(`y_${i}_${t}`, 0, 1, true, setupCost[i]));
      s[i].push(m.col(`s_${i}_${t}`, 0, Infinity, false, holdCost[i]));
    }
  }
  for (let i = 0; i < items; i += 1) {
    for (let t = 0; t < periods; t += 1) {
      // s[t-1] + x[t] - s[t] = d[t]
      const idx = [x[i][t], s[i][t]];
      const val = [1, -1];
      if (t > 0) {
        idx.push(s[i][t - 1]);
        val.push(1);
      }
      m.row(`bal_${i}_${t}`, idx, val, demand[i][t], demand[i][t]);
      // x <= M y, M = min(remaining demand, usable capacity)
      let remaining = 0;
      for (let u = t; u < periods; u += 1) remaining += demand[i][u];
      const big = Math.max(0, Math.min(remaining, Math.floor((cap - setupTime[i]) / unitTime[i])));
      m.row(`vub_${i}_${t}`, [x[i][t], y[i][t]], [1, -big], -Infinity, 0);
    }
  }
  // Overtime (costly) keeps every instance feasible, as in the standard
  // CLST test sets.
  const overtimeCost = 40;
  for (let t = 0; t < periods; t += 1) {
    const idx = [];
    const val = [];
    for (let i = 0; i < items; i += 1) {
      idx.push(x[i][t], y[i][t]);
      val.push(unitTime[i], setupTime[i]);
    }
    idx.push(m.col(`o_${t}`, 0, Infinity, false, overtimeCost));
    val.push(-1);
    m.row(`cap_${t}`, idx, val, -Infinity, cap);
  }
  return m;
}

function mkp({ n, k, seed, tightness = 0.5 }) {
  const r = rng(seed);
  const m = new Model(`mkp_n${n}_m${k}_s${seed}`, "max");
  const w = Array.from({ length: k }, () => Array.from({ length: n }, () => uniformInt(r, 1, 1000)));
  const xs = [];
  for (let j = 0; j < n; j += 1) {
    let sum = 0;
    for (let i = 0; i < k; i += 1) sum += w[i][j];
    // Chu & Beasley profit: correlated with average weight plus noise.
    xs.push(m.col(`x_${j}`, 0, 1, true, Math.round(sum / k + 500 * r())));
  }
  for (let i = 0; i < k; i += 1) {
    const cap = Math.floor(tightness * w[i].reduce((a, b) => a + b, 0));
    m.row(`knap_${i}`, xs, w[i], -Infinity, cap);
  }
  return m;
}

function gapD({ agents, jobs, seed, ratio = 0.8 }) {
  const r = rng(seed);
  const m = new Model(`gapd_a${agents}_j${jobs}_s${seed}`);
  const use = [];
  const cost = [];
  for (let a = 0; a < agents; a += 1) {
    use.push([]);
    cost.push([]);
    for (let j = 0; j < jobs; j += 1) {
      const u = uniformInt(r, 1, 100);
      use[a].push(u);
      cost[a].push(111 - u + uniformInt(r, -10, 10));
    }
  }
  const x = [];
  for (let a = 0; a < agents; a += 1) {
    x.push([]);
    for (let j = 0; j < jobs; j += 1) x[a].push(m.col(`x_${a}_${j}`, 0, 1, true, cost[a][j]));
  }
  for (let j = 0; j < jobs; j += 1) {
    m.row(`assign_${j}`, x.map((row) => row[j]), new Array(agents).fill(1), 1, 1);
  }
  for (let a = 0; a < agents; a += 1) {
    const cap = Math.floor((ratio * use[a].reduce((p, q) => p + q, 0)) / agents);
    m.row(`capa_${a}`, x[a], use[a], -Infinity, cap);
  }
  return m;
}

const fmt = (v) => (Number.isInteger(v) ? String(v) : v.toPrecision(17));

function terms(idx, val, cols) {
  const parts = [];
  for (let p = 0; p < idx.length; p += 1) {
    const v = val[p];
    if (v === 0) continue;
    parts.push(`${v < 0 ? "-" : "+"} ${fmt(Math.abs(v))} ${cols[idx[p]].name}`);
  }
  // Short lines keep every LP reader happy.
  const lines = [];
  for (let p = 0; p < parts.length; p += 8) lines.push(" " + parts.slice(p, p + 8).join(" "));
  return lines.join("\n");
}

export function toLp(m) {
  const out = [m.sense === "max" ? "Maximize" : "Minimize"];
  const objIdx = [];
  const objVal = [];
  m.obj.forEach((c, j) => {
    if (c !== 0) {
      objIdx.push(j);
      objVal.push(c);
    }
  });
  out.push(" obj:\n" + terms(objIdx, objVal, m.cols));
  out.push("Subject To");
  for (const row of m.rows) {
    const body = terms(row.idx, row.val, m.cols);
    if (row.lo === row.hi) out.push(` ${row.name}:\n${body}\n = ${fmt(row.lo)}`);
    else if (row.lo === -Infinity) out.push(` ${row.name}:\n${body}\n <= ${fmt(row.hi)}`);
    else if (row.hi === Infinity) out.push(` ${row.name}:\n${body}\n >= ${fmt(row.lo)}`);
    else throw new Error(`ranged row ${row.name} not supported`);
  }
  out.push("Bounds");
  for (const c of m.cols) {
    if (c.int && c.lo === 0 && c.hi === 1) continue; // in Binaries
    const hi = c.hi === Infinity ? "+inf" : fmt(c.hi);
    out.push(` ${fmt(c.lo)} <= ${c.name} <= ${hi}`);
  }
  const bins = m.cols.filter((c) => c.int && c.lo === 0 && c.hi === 1).map((c) => c.name);
  const gens = m.cols.filter((c) => c.int && !(c.lo === 0 && c.hi === 1)).map((c) => c.name);
  if (bins.length) out.push("Binaries\n" + bins.map((nm) => " " + nm).join("\n"));
  if (gens.length) out.push("Generals\n" + gens.map((nm) => " " + nm).join("\n"));
  out.push("End\n");
  return out.join("\n");
}

const replacer = (_key, value) => (value === Infinity ? "inf" : value === -Infinity ? "-inf" : value);

// The benchmark set. `gap` is the absolute MIP gap (objective units) the
// benchmark stops at, chosen so the solve stops well short of an exact proof,
// like a production stopping gap. Calibrated on native HiGHS 1.15.1 (see
// research/RESEARCH.md); `tier` says which instances are the hard ones.
// Native single-thread seconds-to-gap (random_seed 0, x86-64, 2026-10-14) in
// the comments; WebAssembly is expected to take roughly twice as long.
export const INSTANCES = [
  { family: "gap", params: { agents: 8, jobs: 48, seed: 2 }, gap: 10, tier: "hard" }, // ~36 s (proof ~47 s)
  { family: "gap", params: { agents: 10, jobs: 50, seed: 3 }, gap: 20, tier: "hard" }, // ~36 s
  { family: "mkp", params: { n: 150, k: 10, seed: 1 }, gap: 360, tier: "hard" }, // ~28 s
  { family: "mkp", params: { n: 250, k: 10, seed: 1 }, gap: 320, tier: "hard" }, // ~49 s
  { family: "lotsize", params: { items: 8, periods: 15, seed: 3 }, gap: 10, tier: "medium" }, // ~15 s
  { family: "lotsize", params: { items: 6, periods: 20, seed: 2 }, gap: 10, tier: "medium" }, // ~14 s
  { family: "gap", params: { agents: 5, jobs: 50, seed: 4 }, gap: 5, tier: "medium" }, // ~9 s
];

export function build(spec) {
  if (spec.family === "lotsize") return lotsize(spec.params);
  if (spec.family === "mkp") return mkp(spec.params);
  if (spec.family === "gap") return gapD(spec.params);
  throw new Error(`unknown family ${spec.family}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const outDir = process.argv[2] ?? "research/models/out";
  const only = process.argv[3];
  fs.mkdirSync(outDir, { recursive: true });
  const manifest = [];
  for (const spec of INSTANCES) {
    const m = build(spec);
    if (only && !m.name.includes(only)) continue;
    fs.writeFileSync(path.join(outDir, `${m.name}.lp`), toLp(m));
    fs.writeFileSync(path.join(outDir, `${m.name}.json`), JSON.stringify(m, replacer));
    manifest.push({ name: m.name, family: spec.family, tier: spec.tier, gap: spec.gap, cols: m.cols.length, rows: m.rows.length,
      ints: m.cols.filter((c) => c.int).length });
  }
  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  for (const e of manifest) console.log(`${e.name}\tcols=${e.cols}\trows=${e.rows}\tints=${e.ints}\tgap=${e.gap}`);
}
