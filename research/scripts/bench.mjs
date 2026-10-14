// Sequential A/B benchmark of HiGHS WebAssembly builds on one machine.
//
// node research/scripts/bench.mjs \
//   --variants baseline=dist/baseline/highs.js,lto=dist/lto/highs.js \
//   --models research/models/out --seeds 0,1 --reps 2 --time-limit 300 \
//   --out results/wasm.jsonl [--tiers hard,medium]
//
// One solve at a time, each in a fresh Node process. For every (model, seed)
// pair the variants run back to back, and the order alternates from one pair
// and repetition to the next (A B, B A, A B, ...), so slow drift of the runner
// (thermal, noisy neighbours) hits both variants equally.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, all) => (i % 2 === 0 ? [...acc, [cur.replace(/^--/, ""), all[i + 1]]] : acc), []),
);
const variants = args.variants.split(",").map((pair) => {
  const [name, module] = pair.split("=");
  return { name, module };
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
      const order = pairIndex % 2 === 0 ? variants : [...variants].reverse();
      pairIndex += 1;
      order.forEach((v, position) => {
        const child = spawnSync(
          process.execPath,
          [runOne, "--module", v.module, "--lp", path.join(modelsDir, `${m.name}.lp`), "--json", path.join(modelsDir, `${m.name}.json`),
            "--gap", String(m.gap), "--seed", String(seed), "--time-limit", String(timeLimit), "--callbacks", callbacks],
          { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
        );
        done += 1;
        let record;
        if (child.status !== 0) {
          record = { model: m.name, seed, error: (child.stderr || "").slice(-2000), exitCode: child.status, signal: child.signal };
        } else {
          record = JSON.parse(child.stdout.trim().split("\n").pop());
        }
        Object.assign(record, { variant: v.name, rep, position, tier: m.tier, family: m.family, at: new Date().toISOString() });
        fs.appendFileSync(outFile, JSON.stringify(record) + "\n");
        const summary = record.error
          ? `ERROR exit=${record.exitCode}`
          : `${record.status} ${(record.solveMs / 1000).toFixed(2)}s nodes=${record.nodes} lpIt=${record.lpIterations} gap=${record.absGap.toPrecision(4)} valid=${record.valid}`;
        console.log(`[${done}/${total}] ${m.name} seed=${seed} rep=${rep} ${v.name}: ${summary}`);
      });
    }
  }
}
