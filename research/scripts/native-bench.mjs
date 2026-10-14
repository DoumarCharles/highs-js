// Native HiGHS reference runs (same HiGHS commit, same models, gaps, seeds).
// Used to (1) measure the native/Wasm gap and (2) test whether HiGHS's
// parallel MIP tree search (parallel=on, threads>1) helps these models before
// any effort goes into Wasm threads.
//
// node research/scripts/native-bench.mjs --highs path/to/bin/highs \
//   --models research/models/out --seeds 0,1 --configs t1,on2,on4 \
//   --time-limit 300 --out results/native.jsonl [--tiers hard,medium]
//
// configs: t1 = threads 1 (parallel off); onN = parallel on, threads N.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { performance } from "node:perf_hooks";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, all) => (i % 2 === 0 ? [...acc, [cur.replace(/^--/, ""), all[i + 1]]] : acc), []),
);
const modelsDir = args.models;
const seeds = (args.seeds ?? "0").split(",").map(Number);
const configs = (args.configs ?? "t1").split(",");
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

for (const m of manifest) {
  for (const seed of seeds) {
    for (const config of configs) {
      const threads = config === "t1" ? 1 : Number(config.replace(/^on/, ""));
      const parallel = config === "t1" ? "off" : "on";
      const optFile = path.join(tmp, `${m.name}-${seed}-${config}.opt`);
      fs.writeFileSync(
        optFile,
        [`mip_rel_gap = 0`, `mip_abs_gap = ${m.gap}`, `random_seed = ${seed}`, `time_limit = ${timeLimit}`, `threads = ${threads}`,
          `parallel = ${parallel}`, `log_to_console = true`].join("\n") + "\n",
      );
      const cmd = hasGnuTime ? "/usr/bin/time" : args.highs;
      const cmdArgs = hasGnuTime
        ? ["-v", args.highs, "--options_file", optFile, "--model_file", path.join(modelsDir, `${m.name}.lp`)]
        : ["--options_file", optFile, "--model_file", path.join(modelsDir, `${m.name}.lp`)];
      const t0 = performance.now();
      const child = spawnSync(cmd, cmdArgs, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
      const wallMs = performance.now() - t0;
      const log = child.stdout || "";
      const rec = {
        variant: `native-${config}`,
        model: m.name,
        tier: m.tier,
        family: m.family,
        seed,
        gapTarget: m.gap,
        threads,
        parallel,
        exitCode: child.status,
        status: grab(log, /Status\s+(\S+)/),
        wallMs,
        solveMs: Number(grab(log, /Timing\s+([0-9.eE+-]+)/)) * 1000,
        nodes: Number(grab(log, /Nodes\s+(\d+)/)),
        lpIterations: Number(grab(log, /LP iterations\s+(\d+)/)),
        primal: Number(grab(log, /Primal bound\s+([0-9.eE+-]+)/)),
        dual: Number(grab(log, /Dual bound\s+([0-9.eE+-]+)/)),
        maxRssKb: hasGnuTime ? Number(grab(child.stderr || "", /Maximum resident set size \(kbytes\):\s+(\d+)/)) : null,
        at: new Date().toISOString(),
      };
      rec.absGap = Math.abs(rec.primal - rec.dual);
      fs.appendFileSync(outFile, JSON.stringify(rec) + "\n");
      console.log(`${m.name} seed=${seed} ${rec.variant}: ${rec.status} ${(rec.solveMs / 1000).toFixed(2)}s nodes=${rec.nodes} lpIt=${rec.lpIterations} gap=${rec.absGap}`);
    }
  }
}
