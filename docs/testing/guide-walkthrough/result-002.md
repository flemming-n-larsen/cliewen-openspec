---
type: testing
---
# Three-agent guide walkthroughs and reviews

## Outcome

On November 1, 2026, fresh Codex CLI, Claude Code, and OpenCode sessions completed the revised prepared CSV guide through archive and refreshed permanent-spec evidence. Each then answered the retrospective questions. Independent checks passed for all three pilots. The runner now supports all three guide profiles, with regression tests for context controls, sequencing, report preservation, and failure handling.

This extends [Result 001: Claude first-use walkthrough and retrospective](result-001.md). It covers the prepared development-package path, not human usability or overall release acceptance.

## Profiles and equivalent inputs

| CLI / profile | Requested model / effort | Model observed in both phases | Walkthrough / review duration | Reported cost, walkthrough / review |
|---|---|---|---|---|
| Codex CLI 0.166.0 / `codex-guide-walkthrough` | `gpt-6.1-sol` / medium | Not exposed | 182.9 / 87.8 seconds | Not exposed |
| Claude Code 2.1.316 / `claude-guide-walkthrough` | `claude-opus-5-5` / medium | `claude-opus-5-5` | 161.9 / 184.1 seconds | $0.6848 / $1.3399 |
| OpenCode 2.2.5 / `opencode-guide-walkthrough` | `opencode/glm-5.3-flash` / high | Not exposed | 228.5 / 47.4 seconds | $0.0336 / $0.0117 |

Costs are CLI-reported observations, not invoices or a price comparison. Requested settings do not establish actual model identity when the event stream omits it. Limits and inherited-context caveats are documented in [the runner guide](README.md) and saved per attempt.

All three received byte-identical public guide snapshots, cloned source revision `aff066ebfe6a7aeb786a155b7b320a88cc532ebe`, and independently built `cliewen-openspec@0.2.0-alpha.1`. Each tarball had SHA-256 `3c7be71bd1bbe74215af00e098dd8edcf30c08b8b0a82981a3f51ce90cdba1ae`. The environment was Windows with Node 24.0.0 and npm 11.21.0. Codex used PowerShell; Claude used Git Bash. Trial instructions excluded previous findings and maintainer material. Claude's retrospective resumed its own UUID; the other two received their saved observations in new processes.

## Independent evidence

| Agent | Final pilot revision | Independent check |
|---|---|---|
| Codex | `c4a5baa41408f137c538537b1628becb82d40e14` | Passed |
| Claude | `60a534d9db3efafcfc5f63428248fd0f9f5e8f8d` | Passed |
| OpenCode | `6ddc9019ec529cbfcfa1c8ab2a056b80a9ff889b` | Passed |

Each pilot had six passing tests, a clean working tree, one dated archive, permanent EXP-001 through EXP-006 scenarios, and unscoped evidence matching its final revision. Independent test reruns, the installed checker, and a separate CSV escaping assertion passed. Every checker result had `ok: true`, 20 advisory warnings, and two informational findings. Source package tests also passed in each walkthrough.

The agents reported no guide blocker. Reviews followed completed attempts, and original walkthrough reports remained unchanged. The revised stop-and-read instruction led agents to compare assertions with scenarios before completion. Copying finished files does not demonstrate incremental implementation or the task list's historical sequence of filtered test runs. The completion helper checks file contents, not execution history.

## Findings and corrections

| Finding | Assessment and action |
|---|---|
| Codex and Claude found nested fences/front matter in the CSV API excerpt | Harness defect: snapshot preparation fenced a Markdown include as JavaScript. The website already handled it correctly. Preparation and site generation now share one include helper, with a regression test. Original snapshots remain unchanged; these runs do not validate the corrected secondary excerpt. |
| First OpenCode attempt rejected `opencode v2.2.5` | Infrastructure failure before any model call. Accept the version prefix, test it, and retain the failed attempt alongside a fresh successful retry. |
| Claude found a colon separated from its intended command | Changed it to a period; commands and review order are unchanged. |
| Codex wanted the clean-input rule beside collection | Added a reminder of the existing requirement, with `git status --porcelain` and log placement. |
| OpenCode wanted an explicit test success signal | State six passing tests and no failures beside the existing command. |
| OpenCode's prose claimed 24 findings and labeled a 40-character shasum SHA-512 | Logs and independent checks show 22 findings; the package's 40-character shasum is SHA-1. Preserve the report and use independently verified values here. |

Other suggestions included a separate planning commit, additional recovery guidance, a final-state checklist, and shorter configuration examples. They are usability suggestions rather than observed command failures. The current guide links evidence troubleshooting and explains merging into existing YAML sections. No advice to approve dependency install scripts was added: observed builds succeeded without changing permissions.

The small prose edits clarify existing expectations without changing commands, defaults, prerequisites, or review boundaries. Under [Decision 018: Exercise guides with fresh coding-agent sessions](../../decisions/018-agent-guide-walkthroughs.md), retain these trials and use deterministic replay/build/browser checks for those edits. A materially changed journey requires new sessions.

Final validation passed: all 70 package tests, including the packed guide replay and four runner regressions; the evaluation manifest check; and the documentation build with 13 pages, 457 local links, four diagrams, and CLI-default checks. Browser checks passed for all 13 pages at desktop/mobile sizes. Eleven local references in the new decision and guide-trial documents resolved, and `git diff --check` found no whitespace errors.

## Preservation and remaining coverage

Original trials are under `C:\Users\flemm\AppData\Local\Temp\cliewen-guide-suite-1793561605730`. Ignored `.tmp/agent-trials/guide-suite-002/` preserves original metadata, prompts, events, snapshots, reports, checker results, packages, and pilot Git bundles. `opencode` is the failed preflight; `opencode-retry` is the successful fresh attempt. A preservation record explains the retry and snapshot defect without rewriting originals.

Human first-use testing, recovery under actual failures, published-package substitution, agent-authored proposals and code, TDD capture, quality-review remediation, and other operating systems remain untested by this exercise. The optional-learnings and Humanizer increments and required schema release trials remain outstanding. No npm package was staged or published.
