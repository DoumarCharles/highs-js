// Quick sanity check that a built variant loads and solves a tiny MIP.
// node research/scripts/smoke.cjs dist/<variant>/highs.js
// Failures are printed as GitHub annotations (readable without log access).
const path = require("node:path");
const fail = (what) => {
  const text = String(what && what.stack ? what.stack : what).replace(/\r?\n/g, " | ").slice(0, 3000);
  console.log(`::error::smoke: ${text}`);
  process.exit(1);
};
// Print the full trace (stderr) before the annotation for uncaught throws.
process.on("uncaughtException", (e, origin) => {
  console.error(`uncaught (${origin}):`, typeof e === "string" ? `thrown string "${e}"` : e);
  fail(e);
});
process.on("unhandledRejection", fail);
const lp = "Maximize\n obj: x + 2 y\nSubject To\n c1: x + y <= 4\nBounds\n 0 <= x <= 3\nGenerals\n x y\nEnd\n";
let loadHighs;
try {
  loadHighs = require(path.resolve(process.argv[2]));
} catch (e) {
  fail(e);
}
const errors = [];
loadHighs({ printErr: (s) => errors.push(s) })
  .then((highs) => {
    const results = [];
    // Threaded options only for the pthreads build (it carries the probe).
    const threaded = typeof highs.researchPthreadStats === "function";
    const optionSets = threaded ? [{ threads: 1 }, { threads: 4, parallel: "on" }, {}] : [{}];
    // Each solve runs in its own setImmediate callback, so a throw is
    // synchronous and uncaught: --trace-uncaught then shows the real site.
    const next = (i) => {
      if (i === optionSets.length) {
        console.log("smoke ok", JSON.stringify(results), threaded ? JSON.stringify(highs.researchPthreadStats()) : "");
        process.exit(0);
      }
      setImmediate(() => {
        const result = highs.solve(lp, optionSets[i]);
        results.push({ options: optionSets[i], status: result.Status, objective: result.ObjectiveValue });
        if (result.Status !== "Optimal" || result.ObjectiveValue !== 8) fail(`${JSON.stringify(results)} stderr: ${errors.join(" | ")}`);
        next(i + 1);
      });
    };
    next(0);
  })
  .catch(fail);
