# PR draft for ERGO-Code/HiGHS

Patch: `0001-Keep-user_has_solution-in-sync-for-C-API-callback-so.patch`
(`git am` onto `master` or v1.15.x; applies cleanly to 04024d7 and to master
as of 2026-10-08).

## Title

C API: solutions set with Highs_setCallbackSolution are discarded after the callback returns

## Description

### Problem

With a callback registered through the C API (`Highs_setCallback`), a
solution handed to the MIP solver from the `kHighsCallbackMipUserSolution`
callback with `Highs_setCallbackSolution`, `Highs_setCallbackSparseSolution`
or `Highs_repairCallbackSolution` is never used: the call returns
`kHighsStatusOk`, but the MIP solver's incumbent is unchanged, nothing is
logged, and the search continues as if no solution had been provided.

The C++ API is not affected (`check/TestCallbacks.cpp` sets
`data_in->user_has_solution` / calls `data_in->setSolution` on the C++ object
directly), and `check/TestCAPI.c` has no user-solution test, which is how
this went unnoticed. It affects every C-API consumer: HiGHS.jl-style C users,
and WebAssembly builds such as highs-js (lovasoa/highs-js), where it was
reported as "mipUserSolution callback ignores setSolution".

### Minimal repro

```c
static double good[N];  /* a known feasible solution */
static void cb(int type, const char* msg, const HighsCallbackDataOut* out,
               HighsCallbackDataIn* in, void* ud) {
  static int firings = 0;
  if (type != kHighsCallbackCallbackMipUserSolution) return;
  if (++firings == 1) {
    HighsInt status = Highs_setCallbackSolution(in, N, good);   /* returns kHighsStatusOk */
    printf("user_has_solution after the call = %d\n", in->user_has_solution);  /* 0 */
  } else if (firings == 2) {
    printf("primal bound at next query = %g\n", out->mip_primal_bound);        /* not good's objective */
  }
}
...
Highs_setCallback(highs, cb, NULL);
Highs_startCallback(highs, kHighsCallbackCallbackMipUserSolution);
Highs_run(highs);
```

On a 300-column binary knapsack: `primal bound at next query = 99` while the
submitted solution has objective 11395, and the MIP log never prints an
`X` (user solution) line. If the callback additionally sets
`in->user_has_solution = 1` by hand, the log shows
`X  0  0  0  0.00%  inf  11395 ...` and the primal bound at the next query is
11395 — so the solution itself arrives fine; only the flag is lost.

### Cause

`Highs::setCallback(HighsCCallbackType c_callback, void*)`
(`highs/lp_data/Highs.cpp:2639-2651`) wraps the C callback as

```cpp
HighsCallbackDataIn cc_in;
if (cb_in) cc_in = static_cast<HighsCallbackDataIn>(*cb_in);  // snapshot of the live HighsCallbackInput
c_callback(a, b.c_str(), &cc_out, &cc_in, e);
if (cb_in) *cb_in = cc_in;                                    // copy the snapshot back
```

`Highs_setCallbackSolution` and friends (`highs/interfaces/highs_c_api.cpp:1604-1630`)
do not touch the `HighsCallbackDataIn` they are given; they go through
`data_in->cbdata` to the live `HighsCallbackInput` and call its
`setSolution` / `repairSolution`, which write the values into
`user_solution` (the buffer the snapshot also points at) and set
`user_has_solution = true` on the live object
(`highs/lp_data/HighsCallback.cpp:164-181`, `183-238`, `240-324`). The
snapshot's `user_has_solution` is still `0`, and the copy-back —
`HighsCallbackInput::operator=(const HighsCallbackDataIn&)`
(`HighsCallback.cpp:156-162`) — assigns it over the live flag. When
`HighsMipSolverData::queryExternalSolution` then tests
`callback->data_in.user_has_solution` (`highs/mip/HighsMipSolverData.cpp:2769`)
it is `false`, so the feasibility check and `addIncumbent` are skipped.
`user_interrupt` is unaffected because C callers set it on the struct itself.

### Fix

Keep the C struct in step with the C++ object inside the three C API
functions, so the wrapper's copy-back preserves the result:

```cpp
const HighsStatus status = obj->setSolution(num_entries, value);
data_in->user_has_solution = obj->user_has_solution ? 1 : 0;
return static_cast<int>(status);
```

(same for `Highs_setCallbackSparseSolution` and `Highs_repairCallbackSolution`;
the latter also mirrors the `false` that a failed repair leaves behind). This
is the smallest change that fixes every wrapper built on the documented
pattern, including external ones that copy `HighsCallbackDataIn` back the
same way. An alternative would be to change the wrapper in `Highs.cpp` to
OR the live flag into `cc_in` before the copy-back; that would not help
external wrappers, so the C API functions seemed the better place. Happy to
do both if preferred.

### Test

`check/TestCAPI.c`: new `testCallbackUserSolution()`, run from `main()`
after `testCallback()`. It builds a deterministic 40×4 binary knapsack with
`presolve=off`, computes a greedy feasible solution (objective 937), submits
it with `Highs_setCallbackSolution` at the first
`kHighsCallbackMipUserSolution` firing and asserts that
`data_out->mip_primal_bound` at the second firing is at least that objective.
Before the fix the assertion fails (primal bound at the second query is 99,
from HiGHS's trivial heuristics, against a submitted 937); after it, the whole `capi_unit_tests` binary
passes (≈0.07 s for the new test).
