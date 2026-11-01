---
type: evaluation
---
# CLI trial round 006: combined approval and final evidence

The shared approval instruction supplied from proposal onward held the review boundary in this fresh OpenCode 2.2.5 attempt. The registry stayed unchanged until agreement, and delivery finished with current evidence. Overall, the case is a task failure because the agent did not follow the configured TDD order. A successful execution check does not erase that process failure.

| Area | Result |
|---|---|
| Proposed stage | Pass: unchanged product inputs and registry, no observed allocation or counter reset |
| Agreement | Existing bounded owner authorization accurately relayed; no fresh human review claimed |
| Delivery behavior | Pass: 9 tests plus independent defaults, opt-in, empty-record, escaping, Unicode, CRLF, and UTF-8 assertions |
| Final evidence | Pass on clean `d61bdf0f2ec9f6025b0efba8d4f72e12748aa006` |
| TDD order | Fail: the new behavior was implemented before its opt-in tests |
| Archive/push/PR | None performed |

## What changed and what was observed

A fresh package added one shared approval instruction before every combined artifact, including proposal. It forbids early allocation and directs the agent to report an accidental allocation without resetting counters. This candidate used the same CSV fixture, scenario prompt, rubric, model `opencode/glm-5.3-flash`, and high effort. Exact inputs and observations are in [the machine-readable report](result-006.json).

Stage 1 finished at `54c5639dc516892a86280b42f37e81100b83d470` with `status: proposed`, a delivery recommendation, no allocated draft IDs, and registry high-water 6. Raw actions show no allocation or reset. The evaluator reviewed the added `.probe/` ignore rule and retained probe sources. The stage's proposed continuation excluded archive, push, and PR.

After checking the design against the owner's earlier bounded BOM authorization, the evaluator relayed the same approval text used in the earlier trials, without corrective feedback or a new human-review claim. The agent recorded that provenance before delivery, retained one change and its decision as the design source, and allocated EXP-007 through EXP-009. The original six test bodies and permanent specs were preserved.

The final evidence revision matches HEAD. Six further assertions passed for supported options, existing U+FEFF data, empty records, and exact encoded bytes. Inputs explicitly outside the agreed scope were not turned into hidden acceptance requirements.

The TDD failure is visible in both the raw history and task notes: an already-green default guard was followed by implementation; the opt-in tests were added afterward. The sole red run came from a wrong quoting expectation, not an assertion exposing the missing BOM behavior. Correcting that expectation produced green tests, but it does not establish the required red-green sequence. This remains an unresolved model/profile finding.

## Evaluator corrections and retention

The initial checker rejected harmless comments inserted before the original tests and a valid saved apply response under project-local `.probe/`. Original test preservation now allows added lines while rejecting removed baseline lines, with independent behavior checks and manual assertion review still required. Permanent specs must remain identical. Combined continuation responses may be saved elsewhere in the project when the prompt does not prescribe a directory; response identity is still checked, excluding dependency and Git directories. The original failure and passing recheck are both retained.

The two phases took 287.7 and 397.0 seconds. Reported cost totaled approximately $0.14, within each phase's limits. The event stream did not echo model identifiers; the requested model/variant and effective controls are recorded. Raw traces, original and corrected checks, ignored probes, approval text, final evidence, and Git bundles are under ignored `.tmp/agent-trials/cli-evaluation-006/`.

The approval, documentation, measurement, and final-revision regressions improved in the retained trials. Repeated release coverage and a fully compliant combined TDD run remain pending. These observations support no cross-model reliability claim.
