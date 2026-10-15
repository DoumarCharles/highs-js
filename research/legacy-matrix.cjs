#!/usr/bin/env node
// Diagnostic only. tests/test.js runs its legacy cases in sequence and stops at
// the first failure, so a single regression hides the result of every later
// case. This loads tests/test.js unchanged (minus its final `test();` call),
// runs every `test_*` function against a fresh runtime from build/highs.js and
// prints a pass/fail table. It is not a substitute for `npm test`.

const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");

const testPath = path.resolve(__dirname, "../tests/test.js");
const source = fs.readFileSync(testPath, "utf8");
const names = [...source.matchAll(/^(?:async\s+)?function\s+(test_\w+)\s*\(/gm)].map((m) => m[1]);
const order = [...source.matchAll(/^\s+(?:await\s+)?(test_\w+)\(/gm)].map((m) => m[1]);
const stripped = source.replace(/\ntest\(\);\s*$/, `\nmodule.exports = { ${names.join(", ")} };\n`);
if (stripped === source) throw new Error("could not find the trailing test(); call in tests/test.js");

const loaded = new Module(testPath, module);
loaded.filename = testPath;
loaded.paths = Module._nodeModulePaths(path.dirname(testPath));
loaded._compile(stripped, testPath);
const cases = loaded.exports;
const load = require(path.resolve(__dirname, "../build/highs.js"));

(async () => {
  const results = [];
  for (const name of order) {
    const started = Date.now();
    try {
      const highs = await load({ print: () => {}, printErr: () => {} });
      await cases[name](highs);
      results.push({ name, ok: true, ms: Date.now() - started });
    } catch (error) {
      results.push({ name, ok: false, ms: Date.now() - started, error: String(error?.message ?? error).slice(0, 600) });
    }
  }
  for (const r of results) console.log(`${r.ok ? "pass" : "FAIL"}  ${r.name}  (${r.ms} ms)${r.ok ? "" : `\n      ${r.error}`}`);
  const failed = results.filter((r) => !r.ok).length;
  console.log(`legacy cases: ${results.length}, pass ${results.length - failed}, fail ${failed}`);
  process.exit(failed ? 1 : 0);
})();
