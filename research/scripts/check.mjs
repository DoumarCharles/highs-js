// Independent solution checker: verifies a primal solution against the model
// as generated (research/models/generate.mjs JSON), without trusting HiGHS.
import fs from "node:fs";

const num = (v) => (v === "inf" ? Infinity : v === "-inf" ? -Infinity : v);

export function loadModelJson(file) {
  const m = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const c of m.cols) {
    c.lo = num(c.lo);
    c.hi = num(c.hi);
  }
  for (const r of m.rows) {
    r.lo = num(r.lo);
    r.hi = num(r.hi);
  }
  return m;
}

// values: Map name -> value. Returns { ok, objective, maxRowViol, maxBoundViol,
// maxIntViol, problems[] }.
export function checkSolution(model, values, tol = 1e-6) {
  const x = model.cols.map((c) => values.get(c.name));
  const problems = [];
  let maxBoundViol = 0;
  let maxIntViol = 0;
  model.cols.forEach((c, j) => {
    const v = x[j];
    if (v === undefined || !Number.isFinite(v)) {
      problems.push(`missing value for ${c.name}`);
      return;
    }
    maxBoundViol = Math.max(maxBoundViol, c.lo - v, v - c.hi);
    if (c.int) maxIntViol = Math.max(maxIntViol, Math.abs(v - Math.round(v)));
  });
  let maxRowViol = 0;
  for (const r of model.rows) {
    let act = 0;
    let scale = 1;
    for (let p = 0; p < r.idx.length; p += 1) {
      act += r.val[p] * x[r.idx[p]];
      scale = Math.max(scale, Math.abs(r.val[p] * x[r.idx[p]]));
    }
    const viol = Math.max(r.lo - act, act - r.hi, 0) / scale;
    maxRowViol = Math.max(maxRowViol, viol);
  }
  let objective = 0;
  model.obj.forEach((c, j) => {
    objective += c * x[j];
  });
  if (maxBoundViol > tol) problems.push(`bound violation ${maxBoundViol}`);
  if (maxIntViol > tol) problems.push(`integrality violation ${maxIntViol}`);
  if (maxRowViol > tol) problems.push(`row violation ${maxRowViol}`);
  return { ok: problems.length === 0, objective, maxRowViol, maxBoundViol: Math.max(0, maxBoundViol), maxIntViol, problems };
}
