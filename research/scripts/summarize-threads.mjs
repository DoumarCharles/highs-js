// Summary for the WebAssembly pthreads experiment: every variant against the
// single-thread baseline, with speed, stability, memory and start-up.
// node research/scripts/summarize-threads.mjs --wasm results/wasm.jsonl \
//   [--api results/api-test.json] [--build-info dir1,dir2] [--baseline baseline]
import fs from "node:fs";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, all) => (i % 2 === 0 ? [...acc, [cur.replace(/^--/, ""), all[i + 1]]] : acc), []),
);
const rows = fs.existsSync(args.wasm) ? fs.readFileSync(args.wasm, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
const baselineName = args.baseline ?? "baseline";
const median = (xs) => {
  const s = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!s.length) return NaN;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const geomean = (xs) => Math.exp(xs.reduce((a, x) => a + Math.log(x), 0) / xs.length);
const sec = (ms) => (Number.isFinite(ms) ? (ms / 1000).toFixed(2) : "–");
const mb = (b) => (Number.isFinite(b) ? (b / 1048576).toFixed(0) : "–");
const x = (r) => (Number.isFinite(r) ? `${r.toFixed(2)}×` : "–");
const lines = [];
const out = (s = "") => lines.push(s);

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

const variants = [...new Set(rows.map((r) => r.variant))];
const ok = (r) => !r.failed;
const good = (r) => ok(r) && r.valid && !r.objectiveMismatch && r.gapReached;

out("## Per-variant overview");
out();
out("| variant | threads | parallel | runs | failed | hung | invalid | gap not reached | median load ms | median end-to-end s | median solve s | median CPU/wall | peak Wasm MB (median / max) | max RSS MB (median / max) | RSS after load MB | shared memory | pthread workers after load | max running pthreads | workers after dispose |");
out("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
for (const v of variants) {
  const rs = rows.filter((r) => r.variant === v);
  const k = rs.filter(ok);
  const first = k[0] ?? {};
  out(`| ${v} | ${first.threads ?? "default"} | ${first.parallel ?? "default"} | ${rs.length} | ${rs.filter((r) => r.failed).length} | ${rs.filter((r) => r.hung).length} | ${k.filter((r) => !r.valid || r.objectiveMismatch).length} | ${k.filter((r) => !r.gapReached).length} | ${median(k.map((r) => r.loadMs)).toFixed(0)} | ${sec(median(k.map((r) => r.endToEndMs)))} | ${sec(median(k.map((r) => r.solveMs)))} | ${median(k.map((r) => r.cpuWallRatio)).toFixed(2)} | ${mb(median(k.map((r) => r.wasmMemoryBytes)))} / ${mb(Math.max(...k.map((r) => r.wasmMemoryBytes)))} | ${(median(k.map((r) => r.maxRssKb)) / 1024).toFixed(0)} / ${(Math.max(...k.map((r) => r.maxRssKb)) / 1024).toFixed(0)} | ${(median(k.map((r) => r.rssAfterLoadKb)) / 1024).toFixed(0)} | ${first.sharedMemory ?? "–"} | ${first.pthreadsAfterLoad ? first.pthreadsAfterLoad.total : "–"} | ${Math.max(0, ...k.map((r) => r.maxRunningPthreads ?? 0), ...k.map((r) => r.pthreadsAfterRun?.running ?? 0))} | ${first.pthreadsAfterDispose ? `${first.pthreadsAfterDispose.running} running / ${first.pthreadsAfterDispose.total} total` : "–"} |`);
}
out();
const maxTotal = Math.max(0, ...rows.filter(ok).map((r) => Math.max(r.pthreadsAfterRun?.total ?? 0, r.pthreadsAfterDispose?.total ?? 0)));
out(`Largest pthread worker count seen in any run: ${maxTotal} (pool size 4; a larger number would mean Emscripten had to create workers on demand, which deadlocks in a browser).`);
out();

const key = (r) => `${r.model}|${r.seed}`;
const groups = new Map();
for (const r of rows) {
  if (!groups.has(key(r))) groups.set(key(r), []);
  groups.get(key(r)).push(r);
}
const candidates = variants.filter((v) => v !== baselineName);

out("## Solve time by model and seed (median over repetitions; speed-up = baseline / variant)");
out();
out(`| model | tier | seed | ${baselineName} s | ${candidates.map((c) => `${c} s | ${c} speed-up | ${c} nodes`).join(" | ")} | ${baselineName} nodes |`);
out(`|---|---|---|---|${candidates.map(() => "---|---|---|").join("")}---|`);
const stats = Object.fromEntries(candidates.map((c) => [c, { all: [], hard: [], e2eAll: [], e2eHard: [], hardFaster: 0, hardN: 0 }]));
const notes = [];
for (const [, rs] of groups) {
  const b = rs.filter((r) => r.variant === baselineName && good(r));
  if (!b.length) continue;
  const bt = median(b.map((r) => r.solveMs));
  const be = median(b.map((r) => r.endToEndMs));
  const r0 = b[0];
  const cells = candidates.map((c) => {
    const cr = rs.filter((r) => r.variant === c);
    const cg = cr.filter(good);
    if (!cg.length) return "**fail** | – | –";
    const ct = median(cg.map((r) => r.solveMs));
    const ce = median(cg.map((r) => r.endToEndMs));
    const sp = bt / ct;
    const st = stats[c];
    st.all.push(sp);
    st.e2eAll.push(be / ce);
    if (r0.tier === "hard") {
      st.hard.push(sp);
      st.e2eHard.push(be / ce);
      st.hardN += 1;
      if (sp > 1) st.hardFaster += 1;
    }
    const nodes = [...new Set(cg.map((r) => r.nodes))].join(", ");
    if (cr.length !== cg.length) notes.push(`${c} ${r0.model} seed ${r0.seed}: ${cr.length - cg.length} of ${cr.length} runs failed or were invalid`);
    return `${sec(ct)} | ${x(sp)} | ${nodes}`;
  });
  out(`| ${r0.model} | ${r0.tier} | ${r0.seed} | ${sec(bt)} | ${cells.join(" | ")} | ${[...new Set(b.map((r) => r.nodes))].join(", ")} |`);
}
out();

out("## Speed-up summary against the single-thread WebAssembly baseline");
out();
out("| variant | hard pairs faster | hard geo-mean (solve) | hard median | hard range | all pairs geo-mean (solve) | hard geo-mean (end-to-end) | all geo-mean (end-to-end) |");
out("|---|---|---|---|---|---|---|---|");
for (const c of candidates) {
  const st = stats[c];
  if (!st.all.length) continue;
  out(`| ${c} | ${st.hardFaster} of ${st.hardN} | ${st.hard.length ? x(geomean(st.hard)) : "–"} | ${st.hard.length ? x(median(st.hard)) : "–"} | ${st.hard.length ? `${x(Math.min(...st.hard))} – ${x(Math.max(...st.hard))}` : "–"} | ${x(geomean(st.all))} | ${st.e2eHard.length ? x(geomean(st.e2eHard)) : "–"} | ${x(geomean(st.e2eAll))} |`);
}
out();

out("## Repeatability (same variant, model and seed across repetitions)");
out();
for (const v of variants) {
  let groupsN = 0;
  let pathDiff = 0;
  const spreads = [];
  for (const [, rs] of groups) {
    const k = rs.filter((r) => r.variant === v && ok(r));
    if (k.length < 2) continue;
    groupsN += 1;
    if (new Set(k.map((r) => `${r.nodes}/${r.lpIterations}`)).size > 1) pathDiff += 1;
    const ts = k.map((r) => r.solveMs);
    spreads.push((Math.max(...ts) - Math.min(...ts)) / median(ts));
  }
  out(`- **${v}**: search path differed between repetitions in ${pathDiff} of ${groupsN} model-seed groups; median (max − min)/median time spread ${(median(spreads) * 100).toFixed(1)} %, worst ${(Math.max(0, ...spreads) * 100).toFixed(1)} %.`);
}
const pt1 = rows.filter((r) => r.variant === "pt1" && ok(r));
if (pt1.length) {
  let same = 0;
  let n = 0;
  for (const [, rs] of groups) {
    const b = rs.find((r) => r.variant === baselineName && ok(r));
    const p = rs.find((r) => r.variant === "pt1" && ok(r));
    if (!b || !p) continue;
    n += 1;
    if (b.nodes === p.nodes && b.lpIterations === p.lpIterations) same += 1;
  }
  out(`- pt1 (pthreads build, threads=1) followed the baseline's exact search path in ${same} of ${n} model-seed groups.`);
}
out();

const failed = rows.filter((r) => r.failed);
if (failed.length || notes.length) {
  out("## Failures");
  out();
  for (const n of notes) out(`- ${n}`);
  for (const r of failed) out(`- ${r.variant} ${r.model} seed ${r.seed} rep ${r.rep}: ${r.hung ? "HUNG (killed)" : `exit ${r.exitCode} signal ${r.signal}`}\n\n\`\`\`\n${String(r.error).slice(-1500)}\n\`\`\``);
  out();
}

if (args.api && fs.existsSync(args.api)) {
  const api = JSON.parse(fs.readFileSync(args.api, "utf8"));
  out("## JavaScript interface and callback tests (pthreads build)");
  out();
  out("| test | result | details |");
  out("|---|---|---|");
  for (const t of api.tests) out(`| ${t.name} | ${t.ok ? "pass" : "**FAIL**"} | ${String(t.details ?? "").replace(/\|/g, "/").replace(/\n/g, " ")} |`);
  out();
}

const text = lines.join("\n") + "\n";
process.stdout.write(text);
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, text);
