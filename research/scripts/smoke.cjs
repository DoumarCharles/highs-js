// Quick sanity check that a built variant loads and solves a tiny MIP.
// node research/scripts/smoke.cjs dist/<variant>/highs.js
const path = require("node:path");
const loadHighs = require(path.resolve(process.argv[2]));
const lp = "Maximize\n obj: x + 2 y\nSubject To\n c1: x + y <= 4\nBounds\n 0 <= x <= 3\nGenerals\n x y\nEnd\n";
loadHighs().then((highs) => {
  const result = highs.solve(lp);
  if (result.Status !== "Optimal" || result.ObjectiveValue !== 8) {
    console.error(result);
    process.exit(1);
  }
  console.log("smoke ok", result.ObjectiveValue);
});
