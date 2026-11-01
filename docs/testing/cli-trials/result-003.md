---
type: evaluation
---
# CLI trial round 003: OpenCode 1.19.5

The refreshed key worked, and all three primary scenarios ran with OpenCode 1.19.5, `opencode/glm-5.3-flash`, high effort. Each completed model process exited zero, but review classified all three cases as task failures. These findings are preserved rather than repaired in the evaluated outputs.

| Schema | Independent CLI checks | Review outcome |
|---|---|---|
| cliewen-delivery | Pass; 10 tests and current scoped evidence | README contradicts actual option behavior |
| cliewen-discovery | Pass; original six tests and product inputs preserved | Invalid peak-memory measurement and an overstated migration cost |
| cliewen-all | Review stage fails; delivery has 8 passing tests but stale evidence | Early AC allocation, proposed archive overreach, and stale final evidence |

## Reproduced findings

Delivery's README says every `bom` value other than `true` keeps the default output. Its implementation and spec use a truthy check. Evaluator calls with `{ bom: "false" }` and `{ bom: 1 }` both added a marker, contradicting the README. The original prompt did not require strict handling of every invalid value; the failure is the documented promise, not a hidden API requirement.

Discovery uses `setInterval` to sample heap around a synchronous function, then clears it before yielding. An evaluator copy of the probe added a callback counter: both 50,000-row modes took zero samples. The after-GC readings and synthetic byte-equivalence observations remain usable within their limits; maximum heap was not measured. The recommendation also claims streaming requires rewriting all six existing tests, overlooking an additive API that could preserve the current function.

Combined stage 1 correctly stopped with a proposed decision and unchanged product code, but advanced the AC registry from 6 to 8 despite the prompt requiring preservation. Its proposed continuation included unauthorized archive and unverified archive commands. The failed review-stage report and stage-1 bundle are retained. The evaluator then relayed the existing bounded owner authorization with explicit feedback to preserve the failure and remove archive from scope; this continuation was not an unassisted retry or a fresh human approval.

Delivery corrected those scope descriptions and did not archive, push, or open a PR. It finished at `4b1795f410c3f502eef3461a36461a018368e271`, but its report still described `b8e95f2390081826990744fdecf8b4ce9e712491`; independent check returned `stale-evidence`. Later completion does not erase the stage-1 failure.

Evaluator correction: an extra strict-opt-in assertion failed for non-boolean options, but those inputs were explicitly outside the bounded scope. That observation and the original evaluator notes are retained without treating it as an independent task failure. Delivery's README failure above differs because its own documentation explicitly promised behavior for every other value.

## Inputs and retained evidence

Fresh projects reused round 001's per-schema baseline bundles, packed packages, scenario prompts, and rubrics. The clarified project-local-helper wrapper remained in force. A version preflight first rejected the historical 1.18.34 profile because 1.19.5 was installed; no model call occurred in that preflight. A separate `opencode-1-19-5` profile recorded the actual version.

[Machine-readable observations](result-003.json) record final revisions, phase timing, reported costs and token totals, findings, and tested harness hashes. Raw traces, tool arguments, check output, failed assertions, instrumented probe, original packages, and solution bundles are retained under ignored `.tmp/agent-trials/cli-evaluation-003/`. Original evidence was copied without recollection, preserving the stale-report failure.

Delivery took 300.4 seconds, discovery 162.7 seconds, and combined took 238.6 seconds plus 175.5 seconds for the continuation. Reported cost totaled approximately $0.23 across four phases, below each phase's $0.50 local stop. The events did not echo model identifiers; the model and effort were explicitly supplied as CLI arguments. Trace review found project-local activity; it does not establish operating-system isolation.

These are observations from one model/profile attempt. They do not establish OpenCode-wide compatibility or show that green health checks prove writing quality, measurement validity, or assertion sufficiency. Subsequent instruction changes and fresh trials must retain this round as the original failure record.
