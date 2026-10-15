// Minimal reproduction for threaded solves (synthetic model only).
// node --trace-uncaught research/scripts/repro-threads.cjs <highs.js> <model.lp> <threads> [gap]
// The solve runs inside setImmediate so any throw is synchronous and
// uncaught, letting --trace-uncaught report the real throw site.
const fs = require("node:fs");
const path = require("node:path");
const [modulePath, lpPath, threadsArg, gapArg] = process.argv.slice(2);
const threads = Number(threadsArg);
const lines = [];
const log = (...a) => {
  const s = a.join(" ");
  lines.push(s);
  console.log(s);
};
process.on("exit", (code) => console.log(`exit code ${code}`));
const loadHighs = require(path.resolve(modulePath));
loadHighs({ print: (s) => log("[out]", s), printErr: (s) => log("[err]", s) }).then((h) => {
  setImmediate(() => {
    log("pthread stats after load", JSON.stringify(h.researchPthreadStats ? h.researchPthreadStats() : null));
    const model = h.createModel({ format: "lp", data: fs.readFileSync(lpPath, "utf8") });
    model.options.set({ output_flag: true, log_to_console: true, mip_rel_gap: 0, mip_abs_gap: Number(gapArg ?? 0), time_limit: 20, threads, parallel: threads > 1 ? "on" : "off" });
    log("calling run");
    let callbacks = 0;
    const { modelStatus } = model.run({ [h.constants.callbackType.mipLogging]: () => { callbacks += 1; } });
    log("run returned", modelStatus, "mipLogging callbacks", callbacks, "nodes", model.info.get("mip_node_count"));
    model.dispose();
    log("disposed", JSON.stringify(h.researchPthreadStats ? h.researchPthreadStats() : null));
    process.exit(0);
  });
});
