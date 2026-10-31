---
type: evaluation
---
# CSV streaming discovery trial 001

On October 31, 2026, a separate agent completed the discovery workflow and recommended **further investigation**, retaining the current string-returning API meanwhile. The recommendation and durable Decision Record remain proposed. Product code, tests, specs, configuration, dependencies, and AC identities were preserved.

The recommendation is supported by a bounded investigation, not a finding that streaming is unnecessary. Production export sizes, memory budgets, latency goals, and caller requirements were unavailable.

## Profile and inputs

| Field | Recorded value |
|---|---|
| Runner | Codex collaboration sub-agent, `fork_turns: none`; not CLI or Harbor |
| Model | Inherited orchestrator session model, gpt-6.1-sol; no explicit override |
| Effort, provider billing, tokens, cost, exact agent runtime | Not exposed or captured |
| Context | Assigned prompt and isolated project; shared system/developer and supplied main-repository AGENTS instructions remained inherited |
| Node / npm / OpenSpec | v24.0.0 / 11.21.0 / 1.15.0 |
| Source revision | `96b42e320a45d1031cd83bd30e671b93e47f4bef`, with starter changes recorded in source status |
| Package SHA-256 | `eedf06264812ae949775f241802db721191938b4244d2e070cba91b67d268a24` |
| Discovery baseline | `d1971f98f05dfeb803ae15807e0b1424a70ca69c` |
| Preserved result revision | `b584aad57bb7f6fc83bbc33fb043dfef0628cca0` |

The agent was instructed not to read sibling evaluator artifacts, other repositories, earlier solutions, or the previous conversation. It reported following those boundaries and disclosed inherited instructions. This tests fresh task context, not fully isolated instructions. The evaluator committed the completed agent artifacts after the agent stopped; the agent itself made no commit. That local commit preserves evidence without accepting the recommendation. A complete tool-event transcript was not available.

## Evidence and review

| Area | Result |
|---|---|
| Instructions | Saved JSON responses for proposal, investigation, decision, and apply identify cliewen-discovery |
| Scope | No implementation, new delivery change, archive, push, dependency change, or altered product inputs |
| Investigation | Compared the existing string API, a separate incremental API, and replacing the return type; discussed compatibility and consumer behavior |
| Experiment | An isolated generator sketch and existing formatter processed 50,000 synthetic two-column rows in separate processes; no production API was added |
| Observed output | Both produced 1,163,900 UTF-8 bytes with SHA-256 `333734c07eaba5b7afb7c2d37f9249630fe3fa15e4e0680b0167c35e1b745312` |
| Limits | Child processes had 20-second timeouts; observed total experiment wall time was 203.901 ms, below the 60-second budget |
| Independent repeat | Same byte count and hash; total wall time 199.565 ms. Timing variation was not graded |
| Product regression | All six baseline tests passed independently; Git verified unchanged product inputs |
| Workflow | Installed schema valid, three artifacts complete, health check returned discovery-review-required |
| Decision | Further investigation with explicit missing data and reopening criteria; both decision records remain proposed |
| Prose and diagrams | Descriptive references, explained backpressure, no unsupported production claims; tables suited the alternatives, and no diagram was needed |

The experiment shows output equivalence for one synthetic fixture. The sketch duplicates encoding logic, generates input incrementally, and hashes output immediately; it does not exercise a production stream API, a slow consumer, or backpressure. The investigation explicitly states that memory, peak heap/RSS, first-output latency, cancellation, production throughput, and partial-write failure behavior were not measured. The result does not establish comparative performance or production suitability.

The proposal makes the absence of production requirements clear. The recommendation identifies what must be measured and agreed before choosing delivery. It avoids inventing a product requirement to justify streaming. The durable record links back to the investigation, though creating both a recommendation artifact and a DR adds some overlap; the schema still leaves the durable record optional when no lasting decision is needed.

The agent saved actual test summaries and workflow JSON, but did not separately persist every native exit code from its pipelined checks. The evaluator reran the tests, schema validation, status, and health commands and recorded their exit codes. Health success was not treated as approval of the recommendation or product evidence.

## Reproducibility and tooling observations

The [starter guide](README.md), [prompt](prompt.md), and [rubric](rubric.md) define the repeat. Restoring `baseline.bundle` and running `npm ci` succeeded. The checker correctly rejected the untouched baseline because discovery artifacts were missing. Its first completed-run check mistakenly counted OpenSpec's empty `archive/.gitkeep` directory as another active change; the checker was corrected, the original failure retained, and all subsequent checks passed. This was evaluator tooling failure, not agent task failure.

The local copy `.tmp/agent-trials/csv-discovery/artifacts/` contains baseline and solution bundles, the tarball, setup metadata, original and final independent checks, the negative check, and independent experiment output. The solution bundle preserves the agent's artifacts and raw logs. These local files are ignored and are not published with this summary. The original trial lives under `C:/Users/flemm/AppData/Local/Temp/cliewen-csv-discovery-1793461800674/`.

All 23 package regression tests passed during this work. One successful investigation does not establish reliability across agents or prove that inherited writing instructions were unnecessary. A later CLI-based run with explicit model/effort and raw event capture would strengthen that comparison.
