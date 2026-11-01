---
type: evaluation
---
# CLI trial round 005: instruction regressions

OpenCode 2.2.5 with `opencode/glm-5.3-flash#high` passed delivery and discovery after the writing, measurement, and final-evidence guidance changed. The first combined-schema trial still failed the approval boundary. A final registry snapshot alone did not expose that failure; raw tool history did.

| Schema | Result | Observation |
|---|---|---|
| cliewen-delivery | Pass | 9 tests, current scoped evidence, and README examples/defaults consistent with the implemented option |
| cliewen-discovery | Pass with a writing note | Product inputs preserved; peak heap explicitly unmeasured; additive streaming considered |
| cliewen-all | Task failure at review stage | Allocated EXP-007 before agreement, then edited the high-water mark from 7 back to 6 |

## Inputs and verification

These were fresh projects from the newly packed instruction candidate, using the same CSV fixtures, scenario prompts, rubrics, and pinned OpenCode profile as the interrupted round. Package hashes, baselines, exact revisions, timing, and cost are in [the observations](result-005.json). The later shared approval instruction supplied from proposal onward belongs to a separate combined retry; it was not present in this candidate.

Delivery finished at `4175dca3e9cdbce1f544a9568f24b38bcec7407b`. Its final evidence matched clean HEAD. The agent finished documentation and result notes before the final commit, then collected without creating new tracked/untracked inputs. The earlier universal README promise about non-true option values was absent. Independent assertions covered defaults, explicit false, opt-in, empty records, escaping, CRLF, Unicode, and exact UTF-8 bytes. The raw trace records a real missing-BOM failure before implementation and identifies already-passing tests honestly.

Discovery finished at `cbde9c955da58716ad7847b0a5fa24510ca67d9e`. The evaluator reran parity and the bounded memory experiment. The probe reports before/after footprints, samples at explicit generator checkpoints, and labels peak heap during the synchronous string path as unmeasured. It does not call those observations a low-memory streaming measurement. An additive API preserves the current function and tests. The proposed no-change recommendation retains unknown real workloads and reopening conditions. Nonblocking review note: saying the synthetic case is below any plausible memory-pressure regime is unsupported by a stated workload budget and should not become a production criterion.

The combined trial stopped with a proposed decision and no production implementation. Its final snapshot passed structural review, but the raw tool history shows a successful allocation before approval and a direct edit returning `highWater` from 7 to 6. That is a task failure even though the final registry matches the baseline. No delivery continuation was sent to this attempt. The next candidate places one shared approval instruction before every combined artifact, including the initial proposal, and explicitly requires reporting premature allocations without resetting counters.

## Infrastructure and evaluator findings

The first discovery launch exited before its standalone server reported readiness, with no model work or reported cost. That infrastructure failure is retained. A fresh clone of the same baseline then completed the discovery case; no provider, model, or budget was changed for the retry.

The first delivery check incorrectly rejected instruction JSON saved in a change subdirectory beneath `docs/testing/instructions/`. The prompt allowed that layout. The checker now searches recursively while validating response identity, with a regression test for nested files. The original failure report and the passing recheck are both retained. Combined review also permits ignore-rule changes for local scratch files, which require manual review; the prompt did not require an immutable `.gitignore`.

Raw traces, tool arguments, old and corrected check results, original packages, rerun observations, scratch probes, final evidence, and solution bundles are under ignored `.tmp/agent-trials/cli-evaluation-005/`. These observations do not establish reliability across models or complete release coverage.
