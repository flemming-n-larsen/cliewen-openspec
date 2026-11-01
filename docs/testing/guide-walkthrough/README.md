---
type: guide
---
# Try the guide with fresh coding-agent sessions

This maintainer exercise asks an agent to use the public first-change guide, then review it afterward. It complements human usability testing. [Decision 018: Exercise guides with fresh coding-agent sessions](../../decisions/018-agent-guide-walkthroughs.md) defines the cadence: rotate one agent during development; cover affected journeys with all three before release or after substantial restructuring.

Use these pinned profiles from [the evaluation manifest](../agent-evaluation.yaml), with existing local authentication:

| Profile | CLI | Requested model / effort |
|---|---|---|
| `claude-guide-walkthrough` | Claude Code 2.1.316 | `claude-opus-5-5` / medium |
| `codex-guide-walkthrough` | Codex CLI 0.166.0 | `gpt-6.1-sol` / medium |
| `opencode-guide-walkthrough` | OpenCode 2.2.5 | `opencode/glm-5.3-flash` / high |

Calls consume provider allowances or may incur charges; the runner does not buy credits or change authentication. Run each profile in a separate, new directory outside this checkout:

```sh
node scripts/run-guide-walkthrough.mjs prepare ABSOLUTE_NEW_DIRECTORY codex-guide-walkthrough
node scripts/run-guide-walkthrough.mjs walkthrough ABSOLUTE_NEW_DIRECTORY
```

Replace `ABSOLUTE_NEW_DIRECTORY` with an absolute path that does not exist, quoting paths containing spaces. With no arguments after `prepare`, the runner creates a temporary directory for the Claude profile and prints its location. CLI version mismatches stop before the model call.

The agent receives public guide snapshots with website includes expanded, normal prerequisites, and a neutral workspace instruction file. It clones the documented source, builds the development package, and attempts the prepared CSV walkthrough. It knows questions will follow but receives no previous solutions, evaluator findings, or maintainer decisions. The prompt permits npm downloads, a public source clone, and local commits/archive within disposable projects.

After the process ends, inspect `workspace/walkthrough-result.md` and saved events. Independently check a completed pilot before requesting the retrospective:

```sh
node scripts/check-guide-walkthrough.mjs ABSOLUTE_NEW_DIRECTORY
node scripts/run-guide-walkthrough.mjs review ABSOLUTE_NEW_DIRECTORY
```

The checker reruns tests and the installed check, verifies archive and evidence state, and tests CSV escaping independently. The retrospective writes `workspace/guide-review.md`. Claude resumes only its trial session; Codex and OpenCode start new processes with that trial's saved observations. Codex uses [ephemeral non-interactive execution](https://learn.chatgpt.com/docs/non-interactive-mode). The runner rejects changed guide snapshots, refuses to overwrite phase logs, and checks that the original walkthrough report remains unchanged after review. A completed process can still describe a blocked journey; review only attempted steps. A failed runner process needs a retained failure record and a new attempt.

Each phase has a ten-minute wall limit and a 64 MiB log limit. Claude receives a $2 reported-cost budget; OpenCode has a local $0.50 reported-cost stop that may overshoot. Codex exposes neither a cost limit nor a hard token cap here. Reported costs are not subscription invoices. Inspect `artifacts/` for exact arguments, context controls, CLI versions, prompts, timings, usage, and requested/observed model identity. Missing model identity is recorded as unverified. Process `passed` means the CLI protocol completed; it is not the evaluator's grade.

Claude uses safe mode, Codex ignores user configuration and rules, and OpenCode uses private standalone configuration with project/Claude customization disabled. Managed instructions or provider settings may remain. Shell access is not an operating-system sandbox. Each workspace has a separate npm cache to avoid concurrent cache contention.

Use [the rubric](rubric.md) to assess outcomes and process deviations. Compare guide hashes, cloned revisions, and package hashes before calling runs equivalent: preparing together does not pin a later source clone. Preserve original attempts, including infrastructure failures. Keep raw transcripts private; retain snapshots, packages, reports, and a pilot Git bundle locally, then commit a concise evidence-based result. [Result 002: Three-agent guide walkthroughs and reviews](result-002.md) records current coverage and limits.
