# Review criteria

Record pass, fail, or not observed for each criterion, with the supporting file, command, or trace. Keep execution failures separate from task failures. Do not convert a missing observation into a pass.

| Area | Criteria |
|---|---|
| Setup | New isolated project; clean baseline; six existing scenarios; no previous solution or conversation history supplied |
| Instructions | Saved OpenSpec responses for proposal, specs, design, tasks, and apply; project config read |
| Identity | Existing capability and EXP-001 through EXP-006 preserved; new IDs allocated through CLI starting after 006 |
| Planning | Problem, opt-in behavior, disabled default, scope, and practical impact understandable without conversation context |
| Writing | Brief explanations, meaningful references, no unsupported spreadsheet claims; diagrams used only when helpful |
| Tasks | Small slices with concrete tests, configured types, boundaries, and per-task completion checks |
| TDD | At least one intended assertion failure observed before its implementation; already-passing cases reported honestly; no setup error presented as behavioral red |
| Behavior | Disabled default preserves exact output; opt-in places one marker before header; UTF-8 bytes EF BB BF; empty input; non-ASCII content and escaping preserved |
| Regression | Original six tests and scenarios preserved and passing; new tests assert concrete outcomes |
| Evidence | Configured types match scenarios; clean committed revision; scoped real execution report; successful check; sufficiency reviewed separately |
| Completion | README and PR draft explain behavior/default/validation/limits; no archive, push, or external PR |

Inspect changes to original tests and specs for weakened assertions. Test omitted options, explicit false, opt-in, and empty input independently of agent-authored tests. Record the chosen API instead of requiring a hidden exact signature. Review code and trace before claiming historical TDD adherence. No single successful trial establishes reliability across models.
