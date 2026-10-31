---
type: guide
---
# Evaluate every schema

Every shipped schema needs deterministic regression coverage and a reviewed agent trial. [agent-evaluation.yaml](agent-evaluation.yaml) lists the profiles, scenarios, source files, and observed reports. It is a coverage plan, not an agent runner or a record that every listed combination passed.

## Current coverage

| Schema | Development trial | Observed coverage | Still needed before release |
|---|---|---|---|
| cliewen-delivery | Optional CSV BOM with per-task TDD | One Codex collaboration run with fresh task context; [report](csv-bom-trial/result-001.md) | Pinned CLI profiles; flexible and end-of-change variants; repeated runs |
| cliewen-discovery | Investigate CSV streaming | One Codex collaboration run with fresh task context; [report](csv-discovery-trial/result-001.md) | Pinned CLI profiles; targeted no-change and handoff cases; repeated runs |
| cliewen-all | Investigation through delivery | Schema and scenario not implemented | A complete scenario, checker, rubric, agent trials, and deterministic coverage |

The common base is checked through every consuming schema, not as a separate user workflow. Existing deterministic tests also cover discovery ending without implementation and creating a separate delivery change. They do not substitute for the missing agent trials.

## Profiles

Use one named profile per schema for routine development, and hold that profile constant while comparing instruction changes. The current reference is `codex-collaboration-observed`, using the inherited `gpt-6.1-sol` session model. It describes the runs we actually performed. Agent version, effort, provider routing, and full instruction isolation were not exposed, so this is an observed reference rather than a fully pinned repeatable profile.

The release plan reserves one primary profile each for Codex CLI, Claude Code, and OpenCode. Their exact models and settings remain unconfigured. Before a release trial, pin the executable version, exact model identifier, provider/routing, effort or explicit lack of that setting, effective instructions, permissions, time/token/cost limits, and trace format. Save those settings with each run. Do not silently use a changing default or call an unconfigured profile tested.

Choose models already available to maintainers, then compare changes against that baseline. Do not run a full product of agents, models, and efforts. A different model or effort gets a new profile identity and a separate result. Provider purchases, paid runs, and Harbor integration are outside this plan's implementation.

## When to run trials

- For schema-specific instructions or templates, run the affected schema's development scenario from a new baseline.
- For shared writing, diagrams, decisions, configuration, identity, or evidence changes, run each affected shipped schema. If the impact is uncertain, run delivery and discovery.
- For adapter-only behavior, run deterministic evidence regressions and the delivery scenario; add discovery if its review contract changes.
- Before introducing a new selectable schema, add a ready development scenario, independent checker, rubric, and actual reviewed result. A planned row does not satisfy this requirement.
- Before release, run each shipped schema's primary scenario with all three pinned CLI profiles. Run additional behavior variants with the named `releaseVariantProfile`, currently the planned Codex CLI profile. Repeat required combinations at least twice from fresh copies, and retain every attempt.

This keeps the main schema/profile comparison small. Extra model or effort experiments are optional and should answer a specific question.

## Run the existing scenarios

From a source checkout with dependencies installed:

```sh
npm run eval:check
npm run trial:prepare
```

The first command checks plan consistency against the installed schema bundle definitions and referenced files; it does not launch agents or grade results. The second prepares the [delivery trial](csv-bom-trial/README.md). For discovery, run:

```sh
npm run trial:discovery
```

Each preparer prints project and evaluator artifact paths and saves a baseline bundle, package hash, source status, prompt, and rubric. Start a new agent with only the project and prompt. Keep evaluator files and earlier solutions outside the supplied context. Disclose global instructions or permissions that remain inherited. Reuse the saved baseline and package for comparisons; preparing a new baseline can change the inputs.

Use the scenario's checker after completion and review its rubric. Snapshot the implementation or investigation, actual observations, instruction responses, and evaluator output. Preserve raw traces when available. Credentials do not belong in fixtures or reports.

The flexible and end-of-change delivery variants and targeted discovery outcome variants are planned; their runnable fixtures and prompts still need implementation. A no-change case must permit an honest recommendation, rather than reward reaching a predetermined answer.

## Assess and report

Score planning and final outcomes separately. Check readability, explained references, useful diagrams, scope, preserved project authorities, and the quality of evidence. For delivery, independently test the implementation, review task boundaries and type matching, and inspect actual red/green observations when TDD is configured. For discovery, review sources, experiment limits, uncertainty, proposed status, and the reasoning behind any handoff or no-change outcome.

For the planned combined schema, also check that the recommendation leads into one coherent delivery plan, shared explanations are linked rather than duplicated, accepted decisions are not invented, and investigation findings do not count as product test evidence. The combined schema must define its no-delivery outcome before it is marked ready.

Record one result per attempt with schema/scenario/profile IDs, baseline and final revision, package hash, exact configuration, start/end timestamps, instructions and access, commands, actual outcomes, independent checks, human review findings, cost/token usage where available, and missing observations. Use these outcomes:

| Outcome | Meaning |
|---|---|
| pass | Required checks and review criteria met within the stated limits |
| task-failure | The agent completed or stopped with an incorrect result or violated the task boundary |
| infrastructure-failure | Setup, authentication, provider, or runner prevented evaluation |
| incomplete | Required evidence or review is missing |

Keep unknown observations explicit. Do not treat green tests as proof of writing quality, decision acceptance, or historical TDD order. After an infrastructure retry or a task fix, retain the earlier attempt and explain what changed. Release acceptance requires the planned fixtures and pinned profiles to exist, the repeated required runs to pass, and unresolved failures to be reviewed before making a compatibility claim.
