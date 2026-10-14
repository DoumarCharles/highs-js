// Summarizes bench.mjs and native-bench.mjs results as Markdown.
// node research/scripts/summarize.mjs --wasm results/wasm.jsonl \
//   [--native results/native.jsonl] [--baseline baseline] [--build-info dir1,dir2]
import fs from "node:fs";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, all) => (i % 2 === 0 ? [...acc, [cur.replace(/^--/, ""), all[i + 1]]] : acc), []),
);
const readJsonl = (file) =>
  file && fs.existsSync(file)
    ? fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line))
    : [];
const wasm = readJsonl(args.wasm);
const native = readJsonl(args.native);
const baselineName = args.baseline ?? "baseline";

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const geomean = (xs) => Math.exp(xs.reduce((a, x) => a + Math.log(x), 0) / xs.length);
const sec = (ms) => (ms / 1000).toFixed(2);
const pct = (r) => `${r < 1 ? "−" : "+"}${Math.abs((r - 1) * 100).toFixed(1)}%`;
const mb = (bytes) => (bytes / 1048576).toFixed(0);

const lines = [];
const out = (s = "") => lines.push(s);

// ---- build info
if (args["build-info"]) {
  out("## Builds");
  out();
  for (const dir of args["build-info"].split(",")) {
    const file = path.join(dir, "build-info.txt");
    if (!fs.existsSync(file)) continue;
    out("```");
    out(fs.readFileSync(file, "utf8").trim());
    out("```");
  }
  out();
}

// ---- wasm A/B
const errors = wasm.filter((r) => r.error);
const ok = wasm.filter((r) => !r.error);
const variants = [...new Set(ok.map((r) => r.variant))];
const candidates = variants.filter((v) => v !== baselineName);
const key = (r) => `${r.model}|${r.seed}`;
const groups = new Map();
for (const r of ok) {
  if (!groups.has(key(r))) groups.set(key(r), []);
  groups.get(key(r)).push(r);
}

out("## WebAssembly A/B");
out();
out(`Runs: ${wasm.length} (${errors.length} errors). Each row is one model and random seed; times are solve-only medians over the repetitions, in a fresh Node process per run, variants alternating order.`);
out();
const allRatios = new Map(candidates.map((c) => [c, { all: [], hard: [] }]));
const problems = [];
for (const cand of candidates) {
  out(`### ${cand} vs ${baselineName}`);
  out();
  out("| model | tier | seed | baseline s | candidate s | change | per-rep range | nodes (b/c) | LP iters (b/c) | same path | final abs gap (target) | status | valid | Wasm MB (b/c) | RSS MB (b/c) |");
  out("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const [, rs] of groups) {
    const b = rs.filter((r) => r.variant === baselineName);
    const c = rs.filter((r) => r.variant === cand);
    if (!b.length || !c.length) continue;
    const bt = median(b.map((r) => r.solveMs));
    const ct = median(c.map((r) => r.solveMs));
    const ratio = ct / bt;
    const perRep = [];
    for (const rb of b) {
      const rc = c.find((r) => r.rep === rb.rep);
      if (rc) perRep.push(rc.solveMs / rb.solveMs);
    }
    const sig = (r) => `${r.nodes}/${r.lpIterations}`;
    const samePath = new Set([...b, ...c].map(sig)).size === 1;
    const valid = [...b, ...c].every((r) => r.valid && !r.objectiveMismatch);
    const statuses = [...new Set([...b, ...c].map((r) => r.status))].join(",");
    const reached = [...b, ...c].every((r) => r.absGap <= r.gapTarget + 1e-6 * Math.max(1, Math.abs(r.primal)));
    if (!valid) problems.push(`${b[0].model} seed ${b[0].seed}: invalid solution or objective mismatch`);
    if (!samePath) problems.push(`${b[0].model} seed ${b[0].seed}: search path differs between ${baselineName} and ${cand} (nodes/LP iterations)`);
    const r0 = b[0];
    allRatios.get(cand).all.push(ratio);
    if (r0.tier === "hard") allRatios.get(cand).hard.push(ratio);
    out(
      `| ${r0.model} | ${r0.tier} | ${r0.seed} | ${sec(bt)} | ${sec(ct)} | **${pct(ratio)}** | ${pct(Math.min(...perRep))} … ${pct(Math.max(...perRep))} | ${median(b.map((r) => r.nodes))}/${median(c.map((r) => r.nodes))} | ${median(b.map((r) => r.lpIterations))}/${median(c.map((r) => r.lpIterations))} | ${samePath ? "yes" : "**no**"} | ${median([...b, ...c].map((r) => r.absGap)).toPrecision(4)} (${r0.gapTarget})${reached ? "" : " **not reached**"} | ${statuses} | ${valid ? "yes" : "**no**"} | ${mb(Math.max(...b.map((r) => r.wasmMemoryBytes)))}/${mb(Math.max(...c.map((r) => r.wasmMemoryBytes)))} | ${(median(b.map((r) => r.maxRssKb)) / 1024).toFixed(0)}/${(median(c.map((r) => r.maxRssKb)) / 1024).toFixed(0)} |`,
    );
  }
  out();
  const { all, hard } = allRatios.get(cand);
  if (all.length) out(`**Geometric-mean time ratio ${cand}/${baselineName}: ${geomean(all).toFixed(3)} (${pct(geomean(all))}) over ${all.length} model-seed pairs; hard tier: ${hard.length ? `${geomean(hard).toFixed(3)} (${pct(geomean(hard))})` : "n/a"}.**`);
  out();
  const totalB = ok.filter((r) => r.variant === baselineName).reduce((a, r) => a + r.solveMs, 0);
  const totalC = ok.filter((r) => r.variant === cand).reduce((a, r) => a + r.solveMs, 0);
  out(`Total solve time: ${baselineName} ${sec(totalB)} s, ${cand} ${sec(totalC)} s.`);
  out();
}
if (errors.length) {
  out("### Errors");
  for (const e of errors) out(`- ${e.variant} ${e.model} seed ${e.seed}: exit ${e.exitCode} ${e.signal ?? ""} ${String(e.error).split("\n").slice(-3).join(" ")}`);
  out();
}
if (candidates.length) out("### Checks");
if (candidates.length) out(problems.length ? problems.map((p) => `- ${p}`).join("\n") : "- All solutions valid against the independent checker; every candidate followed the identical search path (same nodes and LP iterations) as the baseline.");
out();

// ---- native reference
if (native.length) {
  out("## Native HiGHS reference (same commit, same runner, after the Wasm runs)");
  out();
  const configs = [...new Set(native.map((r) => r.variant))];
  out(`| model | seed | ${configs.map((c) => `${c} s`).join(" | ")} | ${configs.map((c) => `${c} nodes`).join(" | ")} | Wasm ${baselineName} s | Wasm/native-t1 |`);
  out(`|---|---|${configs.map(() => "---|").join("")}${configs.map(() => "---|").join("")}---|---|`);
  const nGroups = new Map();
  for (const r of native) {
    if (!nGroups.has(key(r))) nGroups.set(key(r), []);
    nGroups.get(key(r)).push(r);
  }
  const speedups = Object.fromEntries(configs.map((c) => [c, []]));
  const wasmGap = [];
  for (const [k, rs] of nGroups) {
    const t = Object.fromEntries(configs.map((c) => [c, rs.find((r) => r.variant === c)]));
    const wb = groups.get(k)?.filter((r) => r.variant === baselineName) ?? [];
    const wbt = wb.length ? median(wb.map((r) => r.solveMs)) : null;
    const t1 = t["native-t1"]?.solveMs;
    for (const c of configs) if (t1 && t[c]) speedups[c].push(t1 / t[c].solveMs);
    if (wbt && t1) wasmGap.push(wbt / t1);
    out(`| ${rs[0].model} | ${rs[0].seed} | ${configs.map((c) => (t[c] ? `${sec(t[c].solveMs)}${t[c].status === "Optimal" ? "" : ` (${t[c].status})`}` : "")).join(" | ")} | ${configs.map((c) => (t[c] ? t[c].nodes : "")).join(" | ")} | ${wbt ? sec(wbt) : ""} | ${wbt && t1 ? (wbt / t1).toFixed(2) + "×" : ""} |`);
  }
  out();
  for (const c of configs) if (c !== "native-t1" && speedups[c].length) out(`- ${c}: geometric-mean speed-up over native-t1 ${geomean(speedups[c]).toFixed(2)}× (min ${Math.min(...speedups[c]).toFixed(2)}×, max ${Math.max(...speedups[c]).toFixed(2)}×)`);
  if (wasmGap.length) out(`- Wasm ${baselineName} / native single-thread: geometric mean ${geomean(wasmGap).toFixed(2)}×`);
  out();
}

const text = lines.join("\n") + "\n";
process.stdout.write(text);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, text);
