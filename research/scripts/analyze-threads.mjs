// Detailed analysis of the threads benchmark (bench.mjs output).
// node research/scripts/analyze-threads.mjs results/wasm.jsonl [baselineName]
//
// Run outcome classes:
//   good      valid solution (independent checker) and stopped at its gap
//   censored  valid but stopped by the time limit (solve time is a lower bound)
//   failed    process error, hang, invalid solution or objective mismatch
// Speed-ups use paired model/seed medians where both sides are good;
// censored and failed pairs are counted and listed, never treated as solved.
import fs from "node:fs";

const file = process.argv[2];
const base = process.argv[3] ?? "baseline";
const rows = fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const variants = [...new Set(rows.map((r) => r.variant))];
const cands = variants.filter((v) => v !== base);
const median = (xs) => {
  const s = xs.filter(Number.isFinite).sort((a, b) => a - b);
  if (!s.length) return NaN;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const pct = (xs, p) => {
  const s = xs.filter(Number.isFinite).sort((a, b) => a - b);
  return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : NaN;
};
const gm = (xs) => Math.exp(xs.reduce((a, v) => a + Math.log(v), 0) / xs.length);
const s2 = (ms) => (Number.isFinite(ms) ? (ms / 1000).toFixed(1) : "–");
const x = (v) => (Number.isFinite(v) ? `${v.toFixed(2)}×` : "–");
const mb = (b) => (Number.isFinite(b) ? (b / 1048576).toFixed(0) : "–");
const cls = (r) => (r.failed || !r.valid || r.objectiveMismatch ? "failed" : r.gapReached ? "good" : r.status === "timeLimit" ? "censored" : "failed");
const out = [];
const o = (s = "") => out.push(s);

const key = (r) => `${r.model}|${r.seed}`;
const pairs = new Map();
for (const r of rows) {
  if (!pairs.has(key(r))) pairs.set(key(r), { model: r.model, seed: r.seed, tier: r.tier, gap: r.gapTarget, byV: {} });
  (pairs.get(key(r)).byV[r.variant] ??= []).push(r);
}
const pairVal = (p, v) => {
  const rs = p.byV[v] ?? [];
  const classes = rs.map(cls);
  const state = classes.includes("failed") ? "failed" : classes.includes("censored") ? "censored" : rs.length ? "good" : "missing";
  return { state, solve: median(rs.map((r) => r.solveMs)), e2e: median(rs.map((r) => r.endToEndMs)), nodes: median(rs.map((r) => r.nodes)), lp: median(rs.map((r) => r.lpIterations)), obj: median(rs.map((r) => r.primal)), gap: median(rs.map((r) => r.absGap)) };
};

o("## Outcomes per configuration");
o();
o("| configuration | runs | good | censored (time limit) | failed / invalid / hung | total solve time s | total end-to-end time s (incl. Node start, load, parse, check, dispose) | total CPU time s | CPU / wall (total) | median active pthreads during solve |");
o("|---|---|---|---|---|---|---|---|---|---|");
for (const v of variants) {
  const rs = rows.filter((r) => r.variant === v);
  const c = (k) => rs.filter((r) => cls(r) === k).length;
  const ok = rs.filter((r) => !r.failed);
  const solve = ok.reduce((a, r) => a + r.solveMs, 0);
  const e2e = rs.reduce((a, r) => a + (r.endToEndMs ?? 0), 0);
  const cpu = ok.reduce((a, r) => a + (r.cpuMs ?? 0), 0);
  o(`| ${v} | ${rs.length} | ${c("good")} | ${c("censored")} | ${c("failed")} | ${s2(solve)} | ${s2(e2e)} | ${s2(cpu)} | ${(cpu / solve).toFixed(2)} | ${median(ok.map((r) => r.maxRunningPthreads ?? 0))} (max ${Math.max(0, ...ok.map((r) => r.maxRunningPthreads ?? 0))}) |`);
}
o();

o("## Paired speed-up against the single-thread WebAssembly baseline");
o();
o("Pairs are model × seed; each side is the median of its repetitions. Only pairs where both sides are good enter the statistics. Speed-up = baseline time / configuration time (> 1 is faster).");
o();
o("| configuration | tier | pairs used | geo-mean (solve) | median | worst (largest slowdown) | best | geo-mean (end-to-end) | pairs faster | censored / failed pairs excluded |");
o("|---|---|---|---|---|---|---|---|---|---|");
const speedups = {};
for (const c of cands) {
  speedups[c] = [];
  for (const tier of ["hard", "medium", "all"]) {
    const sp = [];
    const spE = [];
    let excluded = 0;
    for (const p of pairs.values()) {
      if (tier !== "all" && p.tier !== tier) continue;
      const b = pairVal(p, base);
      const v = pairVal(p, c);
      if (b.state !== "good" || v.state !== "good") {
        excluded += 1;
        continue;
      }
      sp.push(b.solve / v.solve);
      spE.push(b.e2e / v.e2e);
      if (tier === "all") speedups[c].push({ model: p.model, seed: p.seed, tier: p.tier, s: b.solve / v.solve, bt: b.solve, ct: v.solve });
    }
    if (!sp.length) continue;
    o(`| ${c} | ${tier} | ${sp.length} | **${x(gm(sp))}** | ${x(median(sp))} | ${x(Math.min(...sp))} | ${x(Math.max(...sp))} | ${x(gm(spE))} | ${sp.filter((v) => v > 1).length} of ${sp.length} | ${excluded} |`);
  }
}
o();

o("## Per model (medians over seeds and repetitions; seconds)");
o();
o(`| model | tier | gap | ${variants.map((v) => `${v} solve`).join(" | ")} | ${variants.map((v) => `${v} end-to-end`).join(" | ")} | ${cands.map((c) => `${c} speed-up per seed`).join(" | ")} |`);
o(`|---|---|---|${variants.map(() => "---|").join("")}${variants.map(() => "---|").join("")}${cands.map(() => "---|").join("")}`);
const models = [...new Set(rows.map((r) => r.model))];
for (const m of models) {
  const rs = rows.filter((r) => r.model === m);
  const r0 = rs[0];
  const perSeed = cands.map((c) => speedups[c].filter((e) => e.model === m).sort((a, b) => a.seed - b.seed).map((e) => `${e.seed}: ${x(e.s)}`).join(", ") || "–");
  o(`| ${m} | ${r0.tier} | ${r0.gapTarget} | ${variants.map((v) => s2(median(rs.filter((r) => r.variant === v && !r.failed).map((r) => r.solveMs)))).join(" | ")} | ${variants.map((v) => s2(median(rs.filter((r) => r.variant === v).map((r) => r.endToEndMs)))).join(" | ")} | ${perSeed.join(" | ")} |`);
}
o();

o("## 2 threads versus 4 threads (paired, both good)");
o();
if (cands.includes("pt2") && cands.includes("pt4")) {
  for (const tier of ["hard", "medium", "all"]) {
    const r = [];
    for (const p of pairs.values()) {
      if (tier !== "all" && p.tier !== tier) continue;
      const a = pairVal(p, "pt2");
      const b = pairVal(p, "pt4");
      if (a.state === "good" && b.state === "good") r.push({ ratio: a.solve / b.solve, name: `${p.model}/${p.seed}` });
    }
    if (!r.length) continue;
    const ratios = r.map((e) => e.ratio);
    o(`- ${tier}: 4 threads faster than 2 in ${ratios.filter((v) => v > 1).length} of ${ratios.length} pairs; time(2 threads)/time(4 threads) geo-mean ${x(gm(ratios))}, median ${x(median(ratios))}, range ${x(Math.min(...ratios))} – ${x(Math.max(...ratios))}.`);
  }
}
o();

o("## Search effort and results (medians over repetitions)");
o();
o(`| model | seed | gap target | ${variants.map((v) => `${v} nodes / LP iters`).join(" | ")} | objective range across configurations | largest final abs gap |`);
o(`|---|---|---|${variants.map(() => "---|").join("")}---|---|`);
let maxObjSpreadRatio = 0;
for (const p of pairs.values()) {
  const vals = variants.map((v) => pairVal(p, v));
  const objs = vals.map((v) => v.obj).filter(Number.isFinite);
  const spread = Math.max(...objs) - Math.min(...objs);
  maxObjSpreadRatio = Math.max(maxObjSpreadRatio, spread / p.gap);
  o(`| ${p.model} | ${p.seed} | ${p.gap} | ${vals.map((v) => `${v.nodes} / ${v.lp}${v.state === "good" ? "" : ` (${v.state})`}`).join(" | ")} | ${Math.min(...objs)} – ${Math.max(...objs)} | ${Math.max(...vals.map((v) => v.gap)).toPrecision(4)} |`);
}
o();
o(`Largest objective difference between any two configurations on the same model/seed, as a fraction of that model's stopping gap: ${maxObjSpreadRatio.toFixed(3)} (each configuration stops anywhere within its gap, so up to 1.0 is expected; > 1 would indicate a wrong answer).`);
o();

o("## Memory and start-up");
o();
o("| configuration | peak Wasm memory MB (median / max) | max process RSS MB (median / max) | Wasm memory after load MB | RSS after load MB | load + instantiate ms (median / p90 / max) | dispose ms (median / max) |");
o("|---|---|---|---|---|---|---|");
for (const v of variants) {
  const ok = rows.filter((r) => r.variant === v && !r.failed);
  o(`| ${v} | ${mb(median(ok.map((r) => r.wasmMemoryBytes)))} / ${mb(Math.max(...ok.map((r) => r.wasmMemoryBytes)))} | ${(median(ok.map((r) => r.maxRssKb)) / 1024).toFixed(0)} / ${(Math.max(...ok.map((r) => r.maxRssKb)) / 1024).toFixed(0)} | ${mb(median(ok.map((r) => r.wasmBytesAfterLoad)))} | ${(median(ok.map((r) => r.rssAfterLoadKb)) / 1024).toFixed(0)} | ${median(ok.map((r) => r.loadMs)).toFixed(0)} / ${pct(ok.map((r) => r.loadMs), 0.9).toFixed(0)} / ${Math.max(...ok.map((r) => r.loadMs)).toFixed(0)} | ${median(ok.map((r) => r.disposeMs)).toFixed(1)} / ${Math.max(...ok.map((r) => r.disposeMs ?? 0)).toFixed(1)} |`);
}
o();
const bl = median(rows.filter((r) => r.variant === base && !r.failed).map((r) => r.loadMs));
for (const c of cands) {
  const cl = median(rows.filter((r) => r.variant === c && !r.failed).map((r) => r.loadMs));
  o(`- ${c}: load/start-up ${(cl - bl).toFixed(0)} ms more than the baseline (median), which includes starting the 4-worker pthread pool.`);
}
o();

const bad = rows.filter((r) => cls(r) !== "good");
o("## Errors, hangs, time-outs, invalid results");
o();
if (!bad.length) o("None: every run produced a valid solution and stopped at its production gap.");
for (const r of bad) o(`- ${r.variant} ${r.model} seed ${r.seed} rep ${r.rep}: ${cls(r)}${r.hung ? " (HUNG, killed)" : ""}${r.failed ? ` exit ${r.exitCode} signal ${r.signal}` : ` status ${r.status}, valid ${r.valid}, abs gap ${r.absGap}`}`);
o();
process.stdout.write(out.join("\n") + "\n");
