---
type: testing
---
# Claude first-use walkthrough and retrospective

## Outcome

On November 1, 2026, a fresh Claude Code process completed the prepared CSV guide through archive and refreshed permanent-spec evidence. An independent checker confirmed the final state. Only afterward, a second invocation resumed that trial's session to ask what was missing and review the guide. The agent had been told beforehand that those questions would follow.

Claude reported no blockers, but identified useful clarity improvements. The guide was then revised and its executable walkthrough replay passed. This is an agent-assisted first-use exercise, not a human usability test or an overall release pass.

## Profile and inputs

| Field | Observed value |
|---|---|
| CLI | Claude Code 2.1.316 |
| Requested and observed model, both phases | `claude-opus-5-5` |
| Effort | Medium |
| Authentication | Existing local Claude account; no credentials supplied in prompts |
| Initial context | New UUID with safe mode; no prior project conversation |
| Follow-up context | Same trial session, resumed after the completed attempt |
| Source cloned by the agent | `aff066ebfe6a7aeb786a155b7b320a88cc532ebe` |
| Package built by the agent | `cliewen-openspec@0.2.0-alpha.1` |
| Tarball SHA-256 | `3c7be71bd1bbe74215af00e098dd8edcf30c08b8b0a82981a3f51ce90cdba1ae` |
| Environment | Windows, Git Bash, Node 24.0.0, npm 11.21.0 |
| Walkthrough duration / reported cost | 173.6 seconds / $0.7700 |
| Retrospective duration / reported cost | 99.9 seconds / $1.1121 |

Costs are CLI-reported values, not subscription invoices. Each phase used a ten-minute wall limit, 64 MiB log limit, and `--max-budget-usd 2`. No fallback model was selected. The initial guide snapshot expanded website include directives and contained public guide/reference pages, not prior evaluation findings. The agent was instructed not to read cloned maintainer plans, decisions, or earlier results.

Original artifacts remain at `C:\Users\flemm\AppData\Local\Temp\cliewen-guide-1793559384117`. A durable local copy under ignored `.tmp/agent-trials/guide-001/` preserves prompts, raw events, CLI results, guide snapshots, the two unedited agent reports, the packed artifact, and `pilot.bundle`.

Preparation initially copied the primary Claude profile's context description, which incorrectly says session persistence is disabled. Actual arguments used a new `--session-id` and then `--resume`; persistence was intentional for the retrospective. A separate `claude-guide-walkthrough` profile now describes that behavior. `artifacts/context-controls.json` records this correction without overwriting the original metadata. Safe mode disables customizations but admin policy may remain; shell access is not an OS sandbox. The agent also noted an incorrect repository-state hint in its initial environment context, while confirming that the pilot itself was an independent Git repository.

## Independent observations

The pilot finished at revision `a535d3adec446a4794b4b12908dff3de6241ac69`. Its working tree was clean, the active change was archived, permanent specs retained EXP-001 through EXP-006, and the unscoped evidence report matched that revision with six passing results. Rerunning the tests, the installed checker, and an independent CSV escaping assertion passed.

The installed checker returned `ok: true` with 20 advisory warnings and two informational findings: missing case metadata, unmet minima, missing review records, and semantic-review reminders. This matched the development policies' default review mode; it did not establish test-quality sufficiency.

The agent copied prepared artifacts and implementation files. It did not exercise agent-authored proposals or code, TDD, quality-record remediation, discovery, combined delivery, or published-package installation. It also disclosed that it read code/tests after the completion helper and first feature commit, though before archive. That process deviation prevents treating this as proof that review boundaries were followed.

## Findings and changes

| Observed friction | Change after the retrospective |
|---|---|
| Existing YAML sections made “add these settings” ambiguous | Explain replacement of `ac.capabilities` and merging into existing sections; explicitly prohibit appending duplicate keys |
| Expected-output sentence understated advisory warnings | Describe warning categories before interpreting `ok`, and name both semantic-review reminders |
| Completion and commit commands were easy to batch before review | Name the implementation, tests, and scenario file to inspect; separate completion from commit blocks |
| Installation and implementation had no separate Git checkpoint | Add an installation commit before feature work |
| Dry run omitted the real command's default-schema selection | Use `init --default --dry-run` before `init --default` |
| Clone location and `.gitignore` creation required assumptions | Start from an empty parent directory and provide a Node command to write the ignore file |
| Archive scope and persistent warnings needed explanation | Explain `--yes`, dropping `--change`, permanent review records, and the evidence refresh cycle with a diagram |

The reviewer had not tested whether appending YAML would fail. A separate maintainer probe confirmed that the actual development configuration parser rejects duplicate map keys. The updated walkthrough passed `node --test test/docs.test.mjs`, including the new installation checkpoint and commands. Further documentation build/browser checks are recorded with this change.

The updated documentation build passed with 13 pages, 457 local links, four diagrams, and configuration-default checks. Browser checks passed for all 13 pages at desktop/mobile sizes. The evaluation manifest and 44 local reference targets also passed validation. A second independent result explicitly checked the dated archive directory; both independent outputs are retained unchanged.

Dependency warnings, untested recovery paths, and broader shell coverage remain observations rather than established product defects. No blanket instruction to ignore install-script warnings was added. A later fresh-user pass should check recovery instructions and whether the revised review checkpoint is understood.
