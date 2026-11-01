---
type: guide
---
# Evaluate every schema

Every shipped schema needs deterministic regression coverage and a reviewed agent trial. [agent-evaluation.yaml](agent-evaluation.yaml) lists the profiles, scenarios, source files, and observed reports. Use the [CLI trial guide](cli-evaluation.md) to run the pinned profiles and capture raw traces. Plan validation alone does not establish that a combination passed.

## Current coverage

| Schema | Development trial | Observed coverage | Still needed before release |
|---|---|---|---|
| cliewen-delivery | Optional CSV BOM with per-task TDD | Codex CLI and Claude have passing observations; OpenCode 2.2.5 passes the instruction regression | Flexible and end-of-change variants; repeated current-candidate runs |
| cliewen-discovery | Investigate CSV streaming | Codex CLI and Claude have passing observations; OpenCode 2.2.5 passes with a writing note | Targeted no-change and handoff cases; repeated current-candidate runs |
| cliewen-all | One CSV investigation through delivery with an explicit human review stage | Codex CLI and Claude have passing observations; OpenCode 2.2.5 now respects the approval boundary and final evidence, but fails configured TDD order | Resolve/retest the TDD finding; no-delivery agent coverage; repeated current-candidate runs |

The [first CLI round](cli-trials/result-001.md) and [Claude retries](cli-trials/result-002.md) retain earlier observations. [OpenCode 1.19.5](cli-trials/result-003.md) exposed content and evidence failures; the [first V2 runs](cli-trials/result-004.md) were interrupted. The [instruction regressions](cli-trials/result-005.md) and [combined retry](cli-trials/result-006.md) record improvements and the remaining TDD failure. Earlier passes do not certify every later instruction candidate.

The common base is checked through every consuming schema, not as a separate user workflow. Existing deterministic tests also cover discovery ending without implementation and creating a separate delivery change. They do not substitute for the missing agent trials.

## Profiles

Use one named profile per schema for routine development, and hold that profile constant while comparing instruction changes. The current reference is `codex-cli-primary`, which passed the primary scenario for each schema. The earlier `codex-collaboration-observed` profile remains a historical reference: it used the inherited `gpt-6.1-sol` session model without exposed agent version, effort, routing, or full instruction isolation.

The release plan pins Codex CLI 0.166.0 with `gpt-6.1-sol` at medium effort, Claude Code 2.1.316 with `claude-opus-5-5` at medium effort, and OpenCode 2.2.5 with `opencode/glm-5.3-flash` at high effort. OpenCode's `opencode-2-2-5` profile uses native V2 controls; the older 1.18.34 and 1.19.5 profiles and their results remain unchanged. The manifest records provider, access, context, budgets, and trace settings. The runner saves those settings with each attempt and refuses version mismatches. A pinned profile still needs successful, reviewed trials.

Choose models already available to maintainers, then compare changes against that baseline. Do not run a full product of agents, models, and efforts. A different model or effort gets a new profile identity and a separate result. Explicit trial commands can consume existing subscription allowances or incur usage charges. Provider purchases and Harbor integration remain outside this implementation.

## When to run trials

- For schema-specific instructions or templates, run the affected schema's development scenario from a new baseline.
- For shared writing, diagrams, decisions, configuration, identity, or evidence changes, run each affected shipped schema. If the impact is uncertain, run delivery and discovery.
- For adapter-only behavior, run deterministic evidence regressions and the delivery scenario; add discovery if its review contract changes.
- Before introducing a new selectable schema, add a ready development scenario, independent checker, rubric, and actual reviewed result. A planned row does not satisfy this requirement.
- Before release, run each shipped schema's primary scenario with all three pinned CLI profiles. Run additional behavior variants with the named `releaseVariantProfile`, currently Codex CLI. Repeat required combinations at least twice from fresh copies, and retain every attempt.

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

The flexible and end-of-change delivery variants, targeted discovery outcomes, and combined no-delivery agent variant remain planned. The combined primary scenario is staged: its first prompt stops at a proposed decision, and actual human agreement is required before the agent's delivery stage. A correct approval-boundary stop does not complete end-to-end coverage. A no-change case must permit an honest recommendation, rather than reward reaching a predetermined answer.

## Assess and report

The separate [first-use guide exercise](guide-walkthrough/README.md) runs fresh Codex CLI, Claude Code, and OpenCode sessions, then asks for missing information and a retrospective only after each attempt. [Result 001: Claude first-use walkthrough and retrospective](guide-walkthrough/result-001.md) records the initial findings; [Result 002: Three-agent guide walkthroughs and reviews](guide-walkthrough/result-002.md) records equivalent revised-guide inputs and independent checks for all three. These prepared-example observations are not delivery/discovery/combined release-profile passes.

[Decision 018: Exercise guides with fresh coding-agent sessions](../decisions/018-agent-guide-walkthroughs.md) requires recurring guide checks: one rotating agent for changed journeys during development, and all three representative CLIs for affected journeys at release or after substantial restructuring. All three guide adapters are implemented. Human first-use testing, agent-authored work, and recovery paths remain outside the observed guide coverage.

For 0.2, add fresh-agent delivery and combined cases exercising missing negative coverage, relevant versus setup failures, a reviewed scoped exception, changed behavior, and partial/full criterion retirement. Check that agents preserve active shared assertions and refresh reviews after inspected inputs or archive scope change. `test/quality.test.mjs` supplies deterministic controls; passing those controls does not complete the planned `delivery-quality-and-retirement` or `combined-quality-and-retirement` agent evaluations.

Score planning and final outcomes separately. Check readability, explained references, useful diagrams, scope, preserved project authorities, and the quality of evidence. For delivery, independently test the implementation, review task boundaries and type matching, and inspect actual red/green observations when TDD is configured. For discovery, review sources, experiment limits, uncertainty, proposed status, and the reasoning behind any handoff or no-change outcome.

For the combined schema, also check that the recommendation leads into one coherent delivery plan, shared explanations are linked rather than duplicated, accepted decisions are not invented, and investigation findings do not count as product test evidence. Its no-delivery branch must use native skip_specs and genuine closure checks without fake product specs or implementation tasks.

Record one result per attempt with schema/scenario/profile IDs, baseline and final revision, package hash, exact configuration, start/end timestamps, instructions and access, commands, actual outcomes, independent checks, human review findings, cost/token usage where available, and missing observations. Use these outcomes:

| Outcome | Meaning |
|---|---|
| pass | Required checks and review criteria met within the stated limits |
| task-failure | The agent completed or stopped with an incorrect result or violated the task boundary |
| infrastructure-failure | Setup, authentication, provider, or runner prevented evaluation |
| incomplete | Required evidence or review is missing |

Keep unknown observations explicit. Do not treat green tests as proof of writing quality, decision acceptance, or historical TDD order. After an infrastructure retry or a task fix, retain the earlier attempt and explain what changed. Release acceptance requires the planned fixtures and pinned profiles to exist, the repeated required runs to pass, and unresolved failures to be reviewed before making a compatibility claim.
