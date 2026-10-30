---
type: evaluation
---
# CSV BOM trial 001: fresh task context

On October 30, 2026, a separate Codex agent completed the task from the prepared baseline. All nine project tests and the independent behavior checks passed. The change remains active and unarchived. No external PR or push was performed.

## Inputs and profile

| Field | Recorded value |
|---|---|
| Agent | Codex collaboration sub-agent, started with `fork_turns: none` |
| Model/profile | Inherited session model, gpt-6.1-sol; no explicit model or effort override |
| Runner | Collaboration tool; not a Codex CLI or Harbor run |
| CLI version, provider billing, effort, token usage, cost | Not exposed for this sub-agent run |
| Access | Local shell/filesystem tools; instructed to work only inside the trial project |
| Prompt and assessment | [Task prompt](prompt.md), [review criteria](rubric.md) |
| Node / npm / OpenSpec | v24.0.0 / 11.21.0 / 1.15.0 |
| Source revision | `dcf6a3a0ccdfb7b21d39c837a80febb0003345fc`, with starter-tool changes recorded in source status |
| Package SHA-256 | `7233ff302646160df640417554f5942b3954f1a9da5df66512ce4a12746aed3d` |
| Baseline revision | `329d07901af8c8fdb3ffefe9b13e69e8b2366211` |
| Final input revision | `70863872896f0e06570cbbf2f2956d90a5b9aa23` |

The agent received the prompt location and project directory, without prior conversation turns or the previous solution. It reported inherited system/developer instructions and the main repository's AGENTS context. It reported reading only the assigned prompt and trial project files. This is fresh task context with shared instruction carryover, not complete instruction isolation or a controlled comparison of schema-only guidance. Model identity is recorded from the orchestrator session, not an independent provider receipt. A complete tool-event transcript and exact agent runtime were not exposed or captured; no duration or cost estimate is claimed.

## Review

| Area | Assessment and evidence |
|---|---|
| Baseline | Pass: six existing tests passed before the trial; replay from `baseline.bundle` with `npm ci` also passed and next allocation was EXP-007 |
| Instructions | Pass: saved JSON responses for proposal, specs, design, tasks, and apply; all identify cliewen-delivery |
| Identity | Pass: EXP-001–006 preserved; EXP-007–009 allocated through CLI according to the agent's run; registry and resulting specs are consistent |
| Planning and prose | Reviewed: proposal explains opt-in behavior, disabled default, affected files, and scope; design explains options-object choice and risk; references have useful labels |
| Task size | Reviewed: one implementation task covers the small prefix behavior with its three cases, immediate tests, and README update; final regression is separate |
| TDD | Observed logs: preimplementation run had seven passing tests and two intended missing-BOM assertion failures; postimplementation and regression runs passed nine tests. The already-passing default case is reported honestly. Full chronological tool-event verification remains unavailable |
| Behavior | Pass: independent exact-string and byte assertions cover omitted/empty/false options, opt-in, non-ASCII content, escaping, CRLF, empty input, and UTF-8 EF BB BF prefix |
| Regression | Pass: original test file content remains an unchanged prefix with new tests appended; permanent baseline specs remain unchanged; nine tests pass |
| Evidence | Pass: real adapter results at clean final HEAD; all nine results retained, three results scoped to the active change; exact Unit matching and CLI check pass |
| Completion | Pass: README and PR draft explain API/default/validation/limits; tasks marked complete; no archive, external PR, or push |
| Diagrams | Appropriate omission: one optional string prefix does not benefit from a diagram |

The agent added a local evidence helper because its new tests shared the original test file. It preserves all nine adapter results, then filters only the active change's three IDs without changing outcomes, runner status, or revision. This meets the current scoped-report contract but reveals a usability gap: users currently have to separate test files or write their own scoping helper. A product-level scoping option deserves a separate change.

## Artifacts and repeatability

The local artifact copy is `.tmp/agent-trials/fresh-csv-bom-artifacts/` in the source checkout. It contains the tarball, setup commands, `baseline.json`, baseline and solution Git bundles, independent checker output, and copies of ignored agent evidence. The solution bundle preserves the proposal, design, specs, tasks, README, PR draft, observations, and red/green logs. These files are local and ignored; they are not part of the published repository.

The original trial project is `C:/Users/flemm/AppData/Local/Temp/cliewen-csv-bom-1793398019904/project`. Preserve the artifact directory before cleaning temporary files. The [starter guide](README.md) explains preparing and replaying trials. The starter's existing-directory rejection and baseline replay were exercised; all 20 package regression tests also passed.

One successful run supports continuing the workflow, not a reliability claim across agents. A CLI-based repeat with explicitly recorded model/effort and raw event capture would reduce the remaining instruction-context and execution-trace uncertainty. Harbor and multi-provider evaluation remain future work.
