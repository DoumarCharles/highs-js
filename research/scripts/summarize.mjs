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
out(`Runs: ${wasm.length} (${errors.length} errors). Each row is one model and random seed; times are solve-only medians over the repetitions, in a fresh Node process per run, variants alternating order. Mandatory: valid solution (independent checker) and stop at the production gap. Identical search path (nodes, LP iterations) is informational.`);
out();
const allRatios = new Map(candidates.map((c) => [c, { all: [], hard: [] }]));
const problems = [];
const notes = [];
const fmtNum = (v) => (v == null || !Number.isFinite(v) ? "–" : Math.abs(v) >= 1000 ? v.toFixed(1) : v.toPrecision(6));
for (const cand of candidates) {
  out(`### ${cand} vs ${baselineName}`);
  out();
  out("| model | tier | seed | baseline s | candidate s | change | per-rep range | nodes b/c | LP iters b/c | same path | root bound b/c | objective b/c | abs gap b/c (target) | gap reached | valid | Wasm MB b/c | RSS MB b/c |");
  out("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
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
    const all = [...b, ...c];
    const valid = all.every((r) => r.valid && !r.objectiveMismatch);
    const reached = all.every((r) => r.gapReached ?? r.absGap <= r.gapTarget);
    const r0 = b[0];
    if (!valid) problems.push(`${r0.model} seed ${r0.seed}: invalid solution or objective mismatch`);
    if (!reached) problems.push(`${r0.model} seed ${r0.seed}: production gap not reached in at least one run (${[...new Set(all.map((r) => r.status))].join(",")})`);
    if (!samePath) notes.push(`${r0.model} seed ${r0.seed}: search path differs (nodes/LP iterations), so the time difference mixes speed and path`);
    allRatios.get(cand).all.push(ratio);
    if (r0.tier === "hard") allRatios.get(cand).hard.push(ratio);
    const med = (rows, f) => median(rows.map(f));
    out(
      `| ${r0.model} | ${r0.tier} | ${r0.seed} | ${sec(bt)} | ${sec(ct)} | **${pct(ratio)}** | ${perRep.length ? `${pct(Math.min(...perRep))} … ${pct(Math.max(...perRep))}` : "–"} | ${med(b, (r) => r.nodes)}/${med(c, (r) => r.nodes)} | ${med(b, (r) => r.lpIterations)}/${med(c, (r) => r.lpIterations)} | ${samePath ? "yes" : "no"} | ${fmtNum(b[0].rootDual)}/${fmtNum(c[0].rootDual)} | ${fmtNum(med(b, (r) => r.primal))}/${fmtNum(med(c, (r) => r.primal))} | ${med(b, (r) => r.absGap).toPrecision(4)}/${med(c, (r) => r.absGap).toPrecision(4)} (${r0.gapTarget}) | ${reached ? "yes" : "**no**"} | ${valid ? "yes" : "**no**"} | ${mb(Math.max(...b.map((r) => r.wasmMemoryBytes)))}/${mb(Math.max(...c.map((r) => r.wasmMemoryBytes)))} | ${(med(b, (r) => r.maxRssKb) / 1024).toFixed(0)}/${(med(c, (r) => r.maxRssKb) / 1024).toFixed(0)} |`,
    );
  }
  out();
  const { all, hard } = allRatios.get(cand);
  if (all.length) out(`**Geometric-mean time ratio ${cand}/${baselineName}: ${geomean(all).toFixed(3)} (${pct(geomean(all))}) over ${all.length} model-seed pairs; hard tier: ${hard.length ? `${geomean(hard).toFixed(3)} (${pct(geomean(hard))})` : "n/a"}.**`);
  out();
  const totalB = ok.filter((r) => r.variant === baselineName).reduce((a, r) => a + r.solveMs, 0);
  const totalC = ok.filter((r) => r.variant === cand).reduce((a, r) => a + r.solveMs, 0);
  out(`Total solve time: ${baselineName} ${sec(totalB)} s, ${cand} ${sec(totalC)} s. Median module load (compile+instantiate): ${baselineName} ${median(ok.filter((r) => r.variant === baselineName).map((r) => r.loadMs)).toFixed(0)} ms, ${cand} ${median(ok.filter((r) => r.variant === cand).map((r) => r.loadMs)).toFixed(0)} ms.`);
  out();
}
if (errors.length) {
  out("### Errors");
  for (const e of errors) out(`- ${e.variant} ${e.model} seed ${e.seed}: exit ${e.exitCode} ${e.signal ?? ""} ${String(e.error).split("\n").slice(-3).join(" ")}`);
  out();
}
if (candidates.length) {
  out("### Checks");
  out(problems.length ? problems.map((p) => `- **${p}**`).join("\n") : "- Mandatory checks passed: every solution valid against the independent checker, every run stopped at its production gap.");
  out(notes.length ? notes.map((p) => `- ${p}`).join("\n") : "- Every candidate run followed the identical search path (same nodes and LP iterations) as the baseline, so time differences are pure execution speed.");
  out();
}

// ---- native reference
if (native.length) {
  out("## Native HiGHS reference (same commit, same runner, after the Wasm runs; one fresh process per solve)");
  out();
  const configs = [...new Set(native.map((r) => r.variant))];
  out(`| model | seed | ${configs.map((c) => `${c} s (min–max)`).join(" | ")} | ${configs.map((c) => `${c} nodes`).join(" | ")} | Wasm ${baselineName} s | Wasm/native-t1 |`);
  out(`|---|---|${configs.map(() => "---|").join("")}${configs.map(() => "---|").join("")}---|---|`);
  const nGroups = new Map();
  for (const r of native) {
    if (!nGroups.has(key(r))) nGroups.set(key(r), []);
    nGroups.get(key(r)).push(r);
  }
  const speedups = Object.fromEntries(configs.map((c) => [c, []]));
  const wasmGap = [];
  for (const [k, rs] of nGroups) {
    const by = Object.fromEntries(configs.map((c) => [c, rs.filter((r) => r.variant === c && !r.crashed)]));
    const tmed = (c) => (by[c].length ? median(by[c].map((r) => r.solveMs)) : null);
    const wb = groups.get(k)?.filter((r) => r.variant === baselineName) ?? [];
    const wbt = wb.length ? median(wb.map((r) => r.solveMs)) : null;
    const t1 = tmed("native-t1");
    for (const c of configs) if (t1 && tmed(c)) speedups[c].push(t1 / tmed(c));
    if (wbt && t1) wasmGap.push(wbt / t1);
    const cell = (c) => {
      const xs = by[c].map((r) => r.solveMs);
      if (!xs.length) return "**crashed**";
      const flag = by[c].every((r) => r.gapReached) ? "" : " (gap not reached)";
      return `${sec(median(xs))} (${sec(Math.min(...xs))}–${sec(Math.max(...xs))})${flag}`;
    };
    const nodesCell = (c) => [...new Set(by[c].map((r) => r.nodes))].join(", ");
    out(`| ${rs[0].model} | ${rs[0].seed} | ${configs.map(cell).join(" | ")} | ${configs.map(nodesCell).join(" | ")} | ${wbt ? sec(wbt) : ""} | ${wbt && t1 ? (wbt / t1).toFixed(2) + "×" : ""} |`);
  }
  out();
  for (const c of configs) {
    const rs = native.filter((r) => r.variant === c);
    const crashes = rs.filter((r) => r.crashed).length;
    const invalid = rs.filter((r) => !r.crashed && (!r.valid || r.objectiveMismatch)).length;
    const notReached = rs.filter((r) => !r.crashed && !r.gapReached).length;
    const nodeVariants = [...nGroups.values()].filter((g) => new Set(g.filter((r) => r.variant === c && !r.crashed).map((r) => `${r.nodes}/${r.lpIterations}`)).size > 1).length;
    const rss = rs.filter((r) => r.maxRssKb).map((r) => r.maxRssKb / 1024);
    out(`- **${c}**: ${rs.length} runs, ${crashes} crashed, ${invalid} invalid, ${notReached} stopped short of the gap; repeat runs with different search paths in ${nodeVariants} of ${nGroups.size} model-seed groups (non-determinism); median max RSS ${rss.length ? median(rss).toFixed(0) : "–"} MB` +
      (c !== "native-t1" && speedups[c].length ? `; geometric-mean speed-up over native-t1 ${geomean(speedups[c]).toFixed(2)}× (min ${Math.min(...speedups[c]).toFixed(2)}×, max ${Math.max(...speedups[c]).toFixed(2)}×)` : ""));
  }
  if (wasmGap.length) out(`- Wasm ${baselineName} / native single-thread: geometric mean ${geomean(wasmGap).toFixed(2)}×`);
  const crashed = native.filter((r) => r.crashed);
  if (crashed.length) {
    out();
    out("### Native crashes");
    for (const r of crashed) out(`- ${r.variant} ${r.model} seed ${r.seed} rep ${r.rep}: exit ${r.exitCode}, signal ${r.signal}\n\n\`\`\`\n${r.tail}\n\`\`\``);
  }
  out();
}

const text = lines.join("\n") + "\n";
process.stdout.write(text);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, text);
