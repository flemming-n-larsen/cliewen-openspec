---
type: guide
---
# Run the CLI agent trials

Use these trials to check whether agents can follow the shipped schemas in a small CSV project. The runner saves their actual commands and responses. Separate checkers test the resulting project; a reviewer assesses the explanation, decision, and evidence.

The [evaluation plan](agent-evaluation.yaml) lists the current profiles under each schema's `releaseProfiles` and retains historical profiles beside them. Changing a model, provider, effort, or CLI version requires a distinct profile and result. The runner supports the named Codex and Claude primary profiles and pinned OpenCode CLI profiles. These comparisons change both agent and model, so they cannot establish which agent alone is better.

## Prepare nine isolated projects

Install this repository's dependencies and the CLI versions listed in the plan. Authenticate each CLI locally using your existing account. The scripts neither install agent CLIs nor buy credits. Model calls can consume subscription allowances or incur usage charges.

```powershell
npm ci
npm run eval:check
npm run trial:cli:prepare
```

The preparer builds and packs this checkout, creates one baseline per schema, then clones it for the other profiles. It prints a `suite.json` path with nine cases: three schemas times three profiles. Each schema's three projects have the same baseline commit and package. The saved metadata includes the package hash and any uncommitted source changes.

By default, files go into a new operating-system temporary directory. To choose a location, supply a new absolute directory outside this checkout:

```powershell
npm run trial:cli:prepare -- C:\Trials\cliewen-run-001
```

Preparation refuses existing directories. Keep the printed suite path; every following command uses it. The examples below assume the explicit location above.

## Run one case

```powershell
npm run trial:cli -- C:\Trials\cliewen-run-001\suite.json codex-cli-primary cliewen-delivery
```

Replace the profile with `claude-code-primary` or `opencode-2-2-5`, and the schema with `cliewen-discovery` or `cliewen-all`, to select another prepared case. OpenCode 2.2.5 is the current profile; `opencode-primary` and `opencode-1-19-5` retain the historical V1 settings and results. Each initial run requires its exact clean baseline. Runs are explicit; preparation makes no model calls.

Each run saves `prompt.txt`, `events.jsonl`, `stderr.txt`, and `run.json` in the case's evaluator artifacts, outside the project. Metadata records the requested profile, CLI version, arguments, timing, observed model identifiers and usage where exposed. An empty observed-model list means the event stream did not identify it. CLI exit zero leaves `evaluation: not-graded` until independent checks and review are complete.

The defaults are a 600-second wall limit and 64 MiB of combined logs per phase. Claude has a $2 reported-cost limit; OpenCode has a $0.50 local stop based on reported events. The OpenCode limit can overshoot because it acts after a response; it is not a provider spending limit. Claude's reported list-equivalent cost is not a subscription invoice. Codex cost and hard token limits are unavailable and recorded as unknown. Combined-schema continuation starts another phase with its own limits.

The runner rejects CLI version mismatches and preserves every attempt. Authentication failures are infrastructure failures, not evidence that a schema failed. Correct the setup and prepare a fresh suite for a retry; keep the failed logs. Do not silently switch provider or model.

## Check and review the result

Use the project and artifact paths from the selected suite case:

```powershell
node scripts/check-csv-bom-trial.mjs PROJECT ARTIFACTS
node scripts/check-csv-discovery-trial.mjs PROJECT ARTIFACTS
```

Run the checker matching the case, then review its saved rubric against the files and raw trace. Checkers preserve earlier reports and refuse to overwrite them. If a checker defect requires a recheck, retain the original report under a descriptive name and explain the correction.

For discovery, inspect the experiment's source, scope and limitations. For delivery, check assertion quality and actual red/green observations. An already passing characterization test is useful, but does not demonstrate a red phase. Neither CLI completion nor green tests establish decision acceptance or writing quality.

## Continue the combined scenario after agreement

`cliewen-all` first stops with a proposed decision. Preserve a clean checkpoint and run:

```powershell
node scripts/check-csv-all-review.mjs PROJECT ARTIFACTS
```

Obtain actual human agreement before delivery. Write its source and bounded scope into a UTF-8 text file outside the project. Existing authorization may be reused only when it covers the reviewed design; describe that provenance instead of claiming a new review. The runner reads this file as a continuation prompt; it cannot verify that the stated approval is genuine.

```powershell
npm run trial:cli -- C:\Trials\cliewen-run-001\suite.json codex-cli-primary cliewen-all C:\Trials\approval.txt
node scripts/check-csv-all-trial.mjs PROJECT ARTIFACTS
```

Continuation uses a fresh CLI process and the existing project artifacts. It writes a separate `approved-continuation` log directory. Review both phases and the final result together.

## Access and reproducibility limits

The runner tells agents to work only in their project and disables extra agents and web tools where the CLI supports it. Codex ignores user configuration and execution-policy rules; Claude uses safe mode. OpenCode V1 uses pure mode. V2 uses a standalone server and private config directory per phase, with native policies for provider and tool access. Project config and Claude skill discovery are disabled; the prompt requires an explicit project AGENTS read. Shell tools still have the maintainer's access, and system or Console settings may remain. These controls provide no operating-system isolation; use a disposable machine or container if enforced isolation is required.

OpenCode V2 selects effort through `provider/model#variant`. Its ordered `permissions` and hard `policies` replace V1's permission map. The profile allows only the `opencode` provider, denies MCP and skills, and permits built-in `opencode.*` plugins while excluding external plugins. See [V2 automation](https://dev.opencode.ai/v2/docs/cli/commands/), [permissions](https://dev.opencode.ai/v2/docs/permissions/), and [policies](https://dev.opencode.ai/v2/docs/policies/). The saved arguments and controls describe each attempt; switching versions requires a new profile rather than reusing an earlier result.

Keep raw traces, baseline bundles, package tarballs, and completed project snapshots locally under ignored `.tmp/agent-trials/` or in private artifact storage. Traces may contain local paths and project content; review them before sharing. Never put credentials in prompts or reports. A committed result should link the local artifact location, record limits and findings, and distinguish task failures from infrastructure failures. Repeat required combinations from fresh baselines before making a release compatibility claim.

CLI behavior references: [Codex non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode), [Claude Code programmatic usage](https://code.claude.com/docs/en/headless), and [OpenCode CLI](https://opencode.ai/docs/cli/). The installed versions and recorded arguments define each attempt.
