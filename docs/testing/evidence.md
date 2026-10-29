---
type: testing
---
# Evidence alpha contract

The first slice supports `init`, `ac next`, `check` and `recover`, and installs cliewen-delivery. It has been tested against OpenSpec 1.15.0 on Windows and Linux. This is not the complete first release: discovery/all, update/uninstall, existing-registry adapters, automated documentation/Mermaid checks and independent review tooling remain planned.

Initialize OpenSpec first. Install this package from a locally built tarball. Run `cliewen-openspec init --default` to explicitly select delivery; omit `--default` to preserve the existing schema. `--root PATH` supports an explicit target, and `init --dry-run` makes no changes.

Allocate IDs using `cliewen-openspec ac next EXPORT`. Keep the committed `.cliewen-openspec/ac-registry.json`; numbers are never reclaimed. This initial allocator supports sequential work; parallel branches must resolve collisions. Do not use it alongside another allocator until an adapter exists.

After implementing and committing the project inputs, run the reference adapter with explicit Node test paths:

```text
node node_modules/cliewen-openspec/adapters/node-test.mjs test/export.test.mjs
cliewen-openspec check --change add-export --json
```

Tests use titles such as `exports rows [EXPORT-001]`. The reference adapter currently supports one AC tag per test title. It records real Node TAP results and the runner exit code, so failures outside mapped tests also block the check. Reports must be Git-ignored and untracked. The adapter rejects dirty input revisions and changes during execution, and invalidates older evidence when a new run starts. A crash cannot leave an earlier passing report usable.

```json
{
  "version": 1,
  "revision": "<full Git commit>",
  "execution": {"exitCode": 0},
  "results": [
    {"scenario":"EXPORT-001","test":"exports rows","outcome":"passed"}
  ]
}
```

Allowed outcomes: passed, failed, skipped, pending and manual. Pending requires a reason; `--fail-on-pending` makes it blocking. Manual results are reported as warnings and are never described as automated proof. Report schema failures exit 2; failed checks exit 1; checks without errors exit 0. Reviewed sufficiency remains explicitly unassessed in this slice.

`--change` checks active delta scenarios (REMOVED scenarios are excluded). Supply a report scoped to that change; unrelated IDs are unknown references. Without it, check all permanent specs. OpenSpec retains responsibility for semantic merging. After archive changes the tree, commit and regenerate evidence for the new revision before checking permanent specs.

The current alpha validates installation hashes and evidence only. Enabling other features supplies schema guidance, not implemented structural validators. The schema does not add a post-implementation artifact as an apply prerequisite. Archive is deliberately performed with OpenSpec, after reviewing evidence.
