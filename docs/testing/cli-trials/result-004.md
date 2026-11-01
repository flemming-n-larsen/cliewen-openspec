---
type: evaluation
---
# CLI trial round 004: interrupted OpenCode 2.2.5 runs

The first three OpenCode 2.2.5 primary scenarios were interrupted before the runner recorded an exit status or completion timestamp. They are incomplete, without a pass/fail grade. Partial documents are not evidence of completed delivery or a respected review boundary.

The `opencode-2-2-5` profile used `opencode/glm-5.3-flash#high`, a standalone server per phase, and native V2 permission/policy controls. Each case began from its original per-schema baseline and package; no earlier solution or review findings were supplied.

[Machine-readable observations](result-004.json) record baseline inputs, partial revisions, working-tree status, start times, and last recorded events. The ignored `.tmp/agent-trials/cli-evaluation-004/` capture preserves raw traces, phase metadata, packages, partial Git bundles, and working-tree snapshots, including uncommitted files. No completed independent grade is claimed. Fresh instruction-regression trials use new directories and reports.
