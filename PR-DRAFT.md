# PR draft for lovasoa/highs-js

## Title

Fix solutions submitted from the mipUserSolution callback being discarded

## Description

### Problem

A solution handed to HiGHS from the `mipUserSolution` callback (type 9) with
`event.setSolution(vector)`, `event.setSolution({indices, values})` or
`event.repairSolution()` is silently ignored: every call returns
`{status: 0}`, but HiGHS's incumbent trajectory is identical to a run with no
submission, even when the submitted solution beats the incumbent. The same
vector passed as a start with `model.setSolution({colValue})` before `run()`
is taken as the first incumbent, so the solution itself is fine.

### Minimal repro

`repro/mip-user-solution.cjs` (included) builds a deterministic 300×10 binary
knapsack, gets a good feasible solution from a 2 s solve, then runs fresh and
submits it at the first `mipUserSolution` firing. With the published 1.15.3
build:

```
Summary (submitted objective 11388):
  A no submission              : first improving incumbent = 0
  B callback setSolution       : incumbent at 2nd firing = 99, first improving incumbent = 0 -> IGNORED
  C callback setSolution (all) : incumbent at 2nd firing = 99, first improving incumbent = 0 -> IGNORED
  D callback sparse + repair   : incumbent at 2nd firing = 99, first improving incumbent = 0 -> IGNORED
  E start before run()         : first improving incumbent = 11388
```

B–D have exactly A's incumbent trajectory (0 → 99 → 11168 → … → 11388).
Condensed version of the same thing:

```js
const highs = await require("highs")({ print: console.log });  // print: to see HiGHS's log
const model = highs.createModel(knapsack);   // any MILP that takes a while
model.options.set({ output_flag: true });
let firings = 0;
model.run({
  [highs.constants.callbackType.mipUserSolution](event) {
    firings += 1;
    if (firings === 1) console.log(event.setSolution(knownGoodVector)); // { status: 0 }
    else console.log("incumbent:", event.data.mip_primal_bound);        // never the submitted objective
  },
});
```

### Cause

`Highs_js_setCallback` in `src/highs_js_bridge.cpp` wraps the JS trampoline:
it converts HiGHS's live `HighsCallbackInput` into a local C
`HighsCallbackDataIn` snapshot, calls the JS callback with a pointer to the
snapshot, and afterwards copies the snapshot back over the live object
(`*data_in = c_data_in`).

But `Highs_setCallbackSolution`, `Highs_setCallbackSparseSolution` and
`Highs_repairCallbackSolution` do not modify the snapshot: they reach the
live `HighsCallbackInput` through `data_in->cbdata` and set
`user_has_solution = true` there (`HiGHS/highs/interfaces/highs_c_api.cpp:1604-1630`,
`HiGHS/highs/lp_data/HighsCallback.cpp:164-181`). The copy-back then runs
`HighsCallbackInput::operator=(const HighsCallbackDataIn&)`
(`HighsCallback.cpp:156-162`), which sets `user_has_solution` from the
snapshot's still-zero field — so by the time
`HighsMipSolverData::queryExternalSolution` checks
`callback->data_in.user_has_solution` (`HiGHS/highs/mip/HighsMipSolverData.cpp:2769`)
the flag is `false` again and the solution is dropped before any feasibility
check or log line. `event.interrupt()` works only because the JS writes
`user_interrupt` directly into the snapshot.

(HiGHS's own C-callback wrapper in `Highs::setCallback(HighsCCallbackType, void*)`,
`Highs.cpp:2639-2651`, has the same copy-back, so plain C-API users are
affected too; a fix for that is being sent to ERGO-Code/HiGHS separately.
highs-js does not go through that wrapper, so this PR fixes highs-js on its
own with the currently bundled HiGHS.)

### Fix

Two lines in the bridge: OR the live object's `user_has_solution` into the
snapshot before copying it back.

```cpp
if (data_in) {
  c_data_in.user_has_solution |= data_in->user_has_solution ? 1 : 0;
  *data_in = c_data_in;
}
```

This keeps `user_interrupt` flowing through the snapshot as before, keeps a
raw callback that sets the C flag itself working, and still honours a failed
`repairSolution()` (which resets the live flag to `false`). No change to the
JS runtime, the exported function list, `types.d.ts` or the API manifest.

With the fix, HiGHS's log shows the submission as its first incumbent
(`X => User solution`):

```
 X       0       0         0   0.00%   inf             11388              Large ...
```

### Test

`tests/extended/callbacks.test.cjs`: "a solution submitted from the
mipUserSolution callback becomes the incumbent". Deterministic 200×10 binary
knapsack; a greedy feasible solution (objective 7309) is submitted at the
first `mipUserSolution` firing; the test asserts that `mip_primal_bound` at the
second firing is at least the submitted objective, that every improving
solution HiGHS reports afterwards beats it, and that the final solution is at
least as good; it interrupts the search after the second firing so it runs in
about half a second. (HiGHS deliberately does not route user solutions through
the `mipImprovingSolution` callback, hence the primal-bound check.)

* unfixed bridge: `the primal bound at the second firing (99) should be at least the submitted objective (7309)`
* fixed bridge: passes; `node tests/test.js` and all 81 extended tests pass.

Also included: `repro/mip-user-solution.cjs`, the standalone repro
(`node repro/mip-user-solution.cjs [path/to/highs.js]`, `SHOW_LOG=1` prints
HiGHS's log).
