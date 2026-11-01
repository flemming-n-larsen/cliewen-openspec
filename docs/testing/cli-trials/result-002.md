---
type: evaluation
---
# CLI trial round 002: Claude retries

Both Claude cases that failed the project boundary in [round 001](result-001.md) passed their fresh retries. Independent product and evidence checks passed, and trace review found that helper scripts, probes, and backups stayed inside the project. The earlier failures remain recorded.

| Schema | Result | Final revision | Tests |
|---|---|---|---:|
| cliewen-delivery | Pass | `912d1b6986af441826d54af16e7b3b87689b727c` | 9 |
| cliewen-all | Pass through proposed review stop and authorized delivery | `ee077d73790620c59442262d97786716ece0baf2` | 9 |

## Inputs and changes

Each retry used a fresh clone of its original baseline bundle and the original packed package, configuration, scenario prompt, and rubric. No earlier solution was supplied. Claude Code remained pinned to 2.1.316, `claude-opus-5-5`, medium effort, with the same access and per-phase budgets. The intentional change was the runner instruction requiring even temporary helpers and backups to stay inside the project. The runner came from `8a8d193`.

[Machine-readable observations](result-002.json) retain the exact baseline commits, package hashes, phase timestamps, exposed usage, review findings, and final revisions. Raw logs, tool arguments, check results, ignored probe sources, final evidence, harness files, and solution bundles are retained locally under `.tmp/agent-trials/cli-evaluation-002/`, outside Git.

## Independent checks and review

The delivery checker passed on clean final HEAD: original six tests and permanent specs preserved, strict change validation successful, scoped evidence current, and independent assertions passing for defaults, opt-in, empty records, escaping, CRLF, Unicode, and UTF-8 bytes. New IDs EXP-007 through EXP-009 were allocated through the CLI. A further eight assertions checked strict opt-in and existing U+FEFF data in headers and values for each schema; both cases passed.

Raw traces show a missing-BOM assertion failure before implementation, followed by a passing focused run and regression tests. Characterization and boundary tests that already passed were reported honestly. Shell escaping produced invisible U+FEFF characters in early drafts; the agents corrected the source representation and reran tests. Early collection attempts before clean commits were retained as setup failures, separately from TDD observations. The evaluator checked final live evidence against the final revisions, rather than relying on historical snapshots in the agents' documents.

For `cliewen-all`, the first phase preserved product inputs, left the decision proposed, and passed the review-stage checker. Its API probe stayed in the project-local ignored `.probe/` directory. The evaluator checked the proposed design against the owner's existing bounded BOM authorization and relayed the same approval text used in round 001. The accepted decision accurately records reuse of that authorization without claiming a fresh human review. Delivery stayed in the same change with the decision as its design source. Mutation probes and commit-message helpers also stayed under `.probe/`; temporary Git stashes stayed in the project repository.

The README, artifacts, and local PR descriptions explain the default, API, validation, and limits. No diagram was needed for this small change. No dependency, streaming API, file writer, archive, push, or external PR was added. Trace review found no recurrence of the shared-temp-directory writes; the runner still provides no operating-system isolation.

## Timing, cost, and remaining coverage

Delivery took 220.8 seconds. Combined investigation took 116.9 seconds, followed by 290.2 seconds for delivery in a fresh CLI process. All three phases confirmed `claude-opus-5-5` in their events and finished within their limits. Claude reported approximately $3.43 total list-equivalent cost, which is not a subscription invoice.

Codex and Claude now each have a passing primary scenario for all three shipped schemas across the retained rounds. OpenCode still has only the expired-Zen-key infrastructure failures from round 001; it was not retried or switched to another provider here. One successful retry does not demonstrate reliability. Repeated required combinations, flexible/end-of-change delivery variants, targeted discovery outcomes, and the combined no-delivery variant remain under the [evaluation plan](../agent-evaluation.md).
