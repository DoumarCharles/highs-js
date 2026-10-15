// Sequential A/B(/C/D) benchmark of HiGHS WebAssembly builds on one machine.
//
// node research/scripts/bench.mjs \
//   --variants "baseline=dist/baseline/highs.js,pt4=dist/pthreads/highs.js@4@on" \
//   --models research/models/out --seeds 0,1 --reps 2 --time-limit 300 \
//   --out results/wasm.jsonl [--tiers hard,medium]
//
// A variant is name=module[@threads[@parallel]]; threads/parallel are passed
// to HiGHS only when given, so the baseline keeps its exact options.
//
// One solve at a time, each in a fresh Node process. For every (model, seed)
// pair all variants run back to back; the order rotates from one pair and
// repetition to the next (A B C D, B C D A, ...), so slow drift of the runner
// hits every variant equally. A solve that overruns its HiGHS time limit by
// more than 2 minutes is killed and recorded as hung.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { performance } from "node:perf_hooks";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, all) => (i % 2 === 0 ? [...acc, [cur.replace(/^--/, ""), all[i + 1]]] : acc), []),
);
const variants = args.variants.split(",").map((pair) => {
  const [name, spec] = pair.split("=");
  const [module, threads, parallel] = spec.split("@");
  return { name, module, threads: threads || null, parallel: parallel || null };
});
const modelsDir = args.models;
const seeds = (args.seeds ?? "0").split(",").map(Number);
const reps = Number(args.reps ?? 2);
const timeLimit = Number(args["time-limit"] ?? 300);
const tiers = args.tiers ? new Set(args.tiers.split(",")) : null;
const outFile = args.out;
const callbacks = args.callbacks ?? "production";
fs.mkdirSync(path.dirname(outFile), { recursive: true });

const manifest = JSON.parse(fs.readFileSync(path.join(modelsDir, "manifest.json"), "utf8")).filter(
  (m) => !tiers || tiers.has(m.tier),
);
const runOne = path.join(import.meta.dirname, "run-one.mjs");

let pairIndex = 0;
const total = manifest.length * seeds.length * reps * variants.length;
let done = 0;
for (const m of manifest) {
  for (const seed of seeds) {
    for (let rep = 0; rep < reps; rep += 1) {
      const shift = pairIndex % variants.length;
      const order = [...variants.slice(shift), ...variants.slice(0, shift)];
      pairIndex += 1;
      order.forEach((v, position) => {
        const childArgs = ["--trace-uncaught", runOne, "--module", v.module, "--lp", path.join(modelsDir, `${m.name}.lp`), "--json", path.join(modelsDir, `${m.name}.json`),
          "--gap", String(m.gap), "--seed", String(seed), "--time-limit", String(timeLimit), "--callbacks", callbacks];
        if (v.threads) childArgs.push("--threads", v.threads);
        if (v.parallel) childArgs.push("--parallel", v.parallel);
        const t0 = performance.now();
        const child = spawnSync(process.execPath, childArgs, {
          encoding: "utf8",
          maxBuffer: 64 * 1024 * 1024,
          timeout: (timeLimit + 120) * 1000,
          killSignal: "SIGKILL",
        });
        // End to end: Node start, module load (incl. pthread pool start-up),
        // LP parse, solve, solution check, dispose, exit.
        const endToEndMs = performance.now() - t0;
        done += 1;
        let record;
        const hung = child.error?.code === "ETIMEDOUT";
        if (child.status !== 0 || hung) {
          record = { failed: true, model: m.name, seed, hung, exitCode: child.status, signal: child.signal,
            error: ((child.stderr || "") + (child.error ? `\n${child.error.message}` : "")).slice(-3000) };
        } else {
          record = JSON.parse(child.stdout.trim().split("\n").pop());
        }
        Object.assign(record, { variant: v.name, rep, position, tier: m.tier, family: m.family, gapTarget: m.gap, endToEndMs, at: new Date().toISOString() });
        if (child.stderr && !record.failed) record.stderrTail = child.stderr.slice(-1000);
        fs.appendFileSync(outFile, JSON.stringify(record) + "\n");
        const summary = record.failed
          ? `${hung ? "HUNG" : "ERROR"} exit=${record.exitCode} signal=${record.signal}`
          : `${record.status} ${(record.solveMs / 1000).toFixed(2)}s e2e=${(endToEndMs / 1000).toFixed(2)}s cpu/wall=${record.cpuWallRatio?.toFixed(2)} nodes=${record.nodes} lpIt=${record.lpIterations} gap=${record.absGap.toPrecision(4)} valid=${record.valid} pth=${JSON.stringify(record.pthreadsAfterRun)}`;
        console.log(`[${done}/${total}] ${m.name} seed=${seed} rep=${rep} ${v.name}: ${summary}`);
      });
    }
  }
}
