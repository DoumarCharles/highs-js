// Native HiGHS reference runs (same HiGHS commit, same models, gaps, seeds).
// Used to (1) measure the native/Wasm gap and (2) test whether HiGHS's
// parallel MIP tree search (parallel=on, threads>1) helps these models, and
// whether it is stable, before any effort goes into Wasm threads.
//
// node research/scripts/native-bench.mjs --highs path/to/bin/highs \
//   --models research/models/out --seeds 0,1 --configs t1,on2,on4 --reps 2 \
//   --time-limit 300 --out results/native.jsonl [--tiers hard,medium]
//
// configs: t1 = threads 1, parallel off; onN = parallel on, threads N.
// Every solve is its own fresh process; config order rotates per repetition.
// Crashes (signal / non-zero exit / missing summary) are recorded, not fatal.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { performance } from "node:perf_hooks";
import { checkSolution, loadModelJson } from "./check.mjs";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, all) => (i % 2 === 0 ? [...acc, [cur.replace(/^--/, ""), all[i + 1]]] : acc), []),
);
const modelsDir = args.models;
const seeds = (args.seeds ?? "0").split(",").map(Number);
const configs = (args.configs ?? "t1").split(",");
const reps = Number(args.reps ?? 1);
const timeLimit = Number(args["time-limit"] ?? 300);
const tiers = args.tiers ? new Set(args.tiers.split(",")) : null;
const outFile = args.out;
fs.mkdirSync(path.dirname(outFile), { recursive: true });
const manifest = JSON.parse(fs.readFileSync(path.join(modelsDir, "manifest.json"), "utf8")).filter(
  (m) => !tiers || tiers.has(m.tier),
);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "highs-native-"));
const hasGnuTime = fs.existsSync("/usr/bin/time");

const grab = (text, re) => {
  const match = text.match(re);
  return match ? match[1] : null;
};

// MIP log rows end "... BestBound BestSol Gap% Cuts InLp Confl. LpIters Time".
function rootDual(log) {
  let dual = null;
  for (const line of log.split("\n")) {
    const t = line.trim().split(/\s+/);
    if (t.length < 12 || !/^[0-9.]+s$/.test(t[t.length - 1])) continue;
    const nodesTok = /^\d+$/.test(t[0]) ? t[0] : t[1];
    if (nodesTok !== "0") continue;
    const v = Number(t[t.length - 8]);
    if (Number.isFinite(v)) dual = v;
  }
  return dual;
}

function readSolution(file) {
  const values = new Map();
  if (!fs.existsSync(file)) return values;
  const lines = fs.readFileSync(file, "utf8").split("\n");
  const i = lines.findIndex((l) => l.startsWith("# Columns"));
  if (i < 0) return values;
  const n = Number(lines[i].split(" ")[2]);
  for (let k = i + 1; k <= i + n; k += 1) {
    const [name, v] = lines[k].split(" ");
    values.set(name, Number(v));
  }
  return values;
}

const modelCache = new Map();
for (const m of manifest) {
  for (const seed of seeds) {
    for (let rep = 0; rep < reps; rep += 1) {
      const order = configs.map((_, k) => configs[(k + rep) % configs.length]);
      for (const config of order) {
        const threads = config === "t1" ? 1 : Number(config.replace(/^on/, ""));
        const parallel = config === "t1" ? "off" : "on";
        const stem = path.join(tmp, `${m.name}-${seed}-${config}-${rep}`);
        fs.writeFileSync(
          `${stem}.opt`,
          [`mip_rel_gap = 0`, `mip_abs_gap = ${m.gap}`, `random_seed = ${seed}`, `time_limit = ${timeLimit}`, `threads = ${threads}`,
            `parallel = ${parallel}`, `log_to_console = true`].join("\n") + "\n",
        );
        const highsArgs = ["--options_file", `${stem}.opt`, "--model_file", path.join(modelsDir, `${m.name}.lp`), "--solution_file", `${stem}.sol`];
        const t0 = performance.now();
        const child = spawnSync(hasGnuTime ? "/usr/bin/time" : args.highs, hasGnuTime ? ["-v", args.highs, ...highsArgs] : highsArgs, {
          encoding: "utf8",
          maxBuffer: 256 * 1024 * 1024,
          // A run that ignores its time limit by more than 2 minutes is hung.
          timeout: (timeLimit + 120) * 1000,
          killSignal: "SIGKILL",
        });
        const wallMs = performance.now() - t0;
        const log = child.stdout || "";
        const stderr = child.stderr || "";
        const status = grab(log, /Status\s+(.+)/)?.trim() ?? null;
        const rec = {
          variant: `native-${config}`,
          model: m.name,
          tier: m.tier,
          family: m.family,
          seed,
          rep,
          gapTarget: m.gap,
          threads,
          parallel,
          exitCode: child.status,
          signal: child.signal ?? grab(stderr, /Command terminated by signal (\d+)/),
          status,
          wallMs,
          solveMs: Number(grab(log, /Timing\s+([0-9.eE+-]+)/)) * 1000,
          nodes: Number(grab(log, /Nodes\s+(\d+)/)),
          lpIterations: Number(grab(log, /LP iterations\s+(\d+)/)),
          primal: Number(grab(log, /Primal bound\s+([0-9.eE+-]+)/)),
          dual: Number(grab(log, /Dual bound\s+([0-9.eE+-]+)/)),
          rootDual: rootDual(log),
          maxRssKb: hasGnuTime ? Number(grab(stderr, /Maximum resident set size \(kbytes\):\s+(\d+)/)) : null,
          at: new Date().toISOString(),
        };
        rec.absGap = Math.abs(rec.primal - rec.dual);
        // 126/127: the binary could not be executed at all (harness problem,
        // not a solver crash).
        rec.hung = child.error?.code === "ETIMEDOUT";
        rec.harnessError = !rec.hung && (Boolean(child.error) || child.status === 126 || child.status === 127);
        rec.crashed = !rec.harnessError && (child.status !== 0 || !status || Boolean(child.signal));
        rec.gapReached = status === "Optimal" && rec.absGap <= m.gap + 1e-9 * Math.max(1, Math.abs(rec.primal));
        if (!modelCache.has(m.name)) modelCache.set(m.name, loadModelJson(path.join(modelsDir, `${m.name}.json`)));
        const check = checkSolution(modelCache.get(m.name), readSolution(`${stem}.sol`));
        rec.valid = check.ok;
        rec.checkedObjective = check.objective;
        rec.objectiveMismatch = Math.abs(check.objective - rec.primal) > 1e-6 * Math.max(1, Math.abs(rec.primal));
        rec.checkProblems = check.problems.slice(0, 5);
        if (rec.crashed || rec.harnessError) rec.tail = (log.split("\n").slice(-15).join("\n") + "\n" + stderr.split("\n").slice(-25).join("\n")).slice(-4000);
        fs.appendFileSync(outFile, JSON.stringify(rec) + "\n");
        console.log(
          `${m.name} seed=${seed} rep=${rep} ${rec.variant}: ${rec.harnessError ? `HARNESS ERROR exit=${rec.exitCode}` : rec.crashed ? `CRASH exit=${rec.exitCode} signal=${rec.signal}` : status} ` +
            `${(rec.solveMs / 1000).toFixed(2)}s nodes=${rec.nodes} lpIt=${rec.lpIterations} gap=${rec.absGap} root=${rec.rootDual} valid=${rec.valid} rssMB=${(rec.maxRssKb / 1024).toFixed(0)}`,
        );
      }
    }
  }
}
