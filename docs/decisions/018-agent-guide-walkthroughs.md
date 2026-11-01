---
type: decision
category: process
status: accepted
---
# Exercise guides with fresh coding-agent sessions

## Context

Command replays and browser checks find broken commands and rendering problems, but do not show where a reader needs an unstated assumption. The [first Claude guide walkthrough](../testing/guide-walkthrough/result-001.md) completed successfully and still found ambiguous configuration edits, unexpected warnings, and an easily skipped review checkpoint.

This decision extends [Decision 010: Publish user documentation on GitHub Pages during development](010-publish-user-documentation-early.md) using the representative profiles from [Decision 009: Evaluate fixed agent profiles and start with OpenCode pay-as-you-go](009-agent-evaluation-profiles-and-initial-provider.md).

## Decision

Include agent-assisted first-use walkthroughs when validating executable user guides. During development, run one representative agent against changed user journeys, rotating among Codex CLI, Claude Code, and OpenCode. Before release acceptance or after substantial guide restructuring, cover the affected journeys with all three. Minor wording edits can use the existing evidence when commands, defaults, prerequisites, and review boundaries are unchanged; record that rationale.

Each agent starts in a new session and isolated project, with the same guide snapshot and package inputs. Supply user-facing material and normal prerequisites, without the project conversation, prior solutions, evaluator findings, or maintainer decisions. Record unavoidable inherited instructions and access limits. Changed model, CLI, provider, or effort settings use distinct pinned profiles.

Ask the agent to execute the guide before reviewing it. It may know that questions will follow, but the retrospective is requested only after the attempt ends. That follow-up retains only the trial's own experience through its session or saved observations. Preserve the original walkthrough report; ask what was missing, where assumptions or workarounds were necessary, and which concise explanations or diagrams would help. A blocked attempt reviews only steps actually tried.

Independently verify the resulting project, package/source identity, commands, tests, archive state, and fresh evidence as applicable. Assess process deviations as well as final success. A zero exit code or favorable agent opinion alone is insufficient. Keep missing coverage, infrastructure failures, failed instructions, and product defects distinct.

Address supported findings, retain original reports, and replay affected commands after fixes. Repeat fresh-agent attempts when changes materially alter the journey or resolve an actual blocker. Record exact input revisions/hashes, requested and observed profiles, context controls, durations, limits, exposed usage, findings, and untested paths.

## Consequences and current scope

This is maintainer validation, not a requirement for adopting projects to install three agents. Keep deterministic tests and browser checks in ordinary CI. Agent calls run explicitly with existing authentication and bounded budgets; unexecuted profiles are incomplete coverage, never passing results.

The user accepted this decision on November 1, 2026. The guide runner implements all three pinned CLI profiles, with fresh walkthroughs and post-attempt reviews. [Result 002: Three-agent guide walkthroughs and reviews](../testing/guide-walkthrough/result-002.md) records equivalent inputs, independent checks, context limits, and a corrected snapshot-preparation defect. Coverage remains limited to the prepared development-package path; human usability, agent-authored work, and failure recovery remain outstanding.
