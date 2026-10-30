---
type: testing
---
# Evidence alpha contract

The alpha supports `init`, `ac next`, `ac rename-prefix`, `check`, and `recover`, and installs `cliewen-delivery`. Package CI exercises OpenSpec 1.15.0 on Windows and Linux. Discovery/all, update/uninstall, existing-registry adapters, structural checks for your project's documentation and Mermaid, and independent review tooling remain planned.

Initialize OpenSpec first. Install this package from a locally built tarball. Run `cliewen-openspec init --default` to explicitly select delivery; omit `--default` to preserve the existing schema. `--root PATH` supports an explicit target, and `init --dry-run` makes no changes.

Register a capability-to-prefix mapping, then allocate IDs using `cliewen-openspec ac next --capability export`. Keep the committed `.cliewen-openspec/ac-registry.json`; numbers are never reclaimed. This initial allocator supports sequential work; parallel branches must resolve collisions. Do not use it alongside another allocator until an adapter exists.

`ac.capabilities` maps each OpenSpec capability to its prefix. `ac.padding` controls minimum digit width (default 3). Use `ac rename-prefix CAPABILITY PREFIX` to change an established prefix while retaining its sequence and historical references. See [configuration](../configuration.md) for prefix selection and the default per-task testing workflow.

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

## Troubleshooting

| Finding or error | What to do |
|---|---|
| `evidence-not-configured` | Commit inputs, run the test adapter, and check that `evidence.report` points to its output |
| `stale-evidence` | Regenerate the report after committing the intended inputs; archive also changes the revision |
| `unverifiable-evidence` | Resolve tracked and untracked changes, then commit and rerun; confirm the project has a Git HEAD |
| `test-failed`, `test-skipped`, or `runner-failed` | Inspect real test output, fix failures, and collect a new report; do not edit a report to claim a pass |
| `missing-ac-id` or `missing-evidence` | Check scenario headings and bracketed IDs in test titles; supply a test result for each selected scenario |
| `unknown-ac-reference` | Use the matching `--change` scope or collect a report containing only the scenarios being checked |
| `duplicate-ac-id` or `duplicate-test-result` | Inspect duplicate scenario identities or repeated test result entries before recollecting |
| `pending-without-reason` | Record why execution is pending; use `--fail-on-pending` when pending work must block |
| `owned-file-modified` | Review edits to installer-owned files; init will not overwrite conflicting files, and alpha update is not implemented |
| `invalid-ac-registry` | Restore a manually changed prefix mapping and use `ac rename-prefix`; preserve the registry and reserved numbers |
| `interrupted-transaction` | Run `cliewen-openspec recover`, then review the restored files |
| Adapter says the output is not ignored | Add the custom report path to `.gitignore`; default output is ignored by init |
| `sufficiency-not-assessed` | Expected informational finding; review whether assertions actually establish the scenarios |

A `manual` result is reported as a warning and does not become automated proof. The current format records free-text context, not a reviewed-sufficiency verdict. A pending result with a reason also remains a warning unless explicitly made blocking.

Test-type configuration and level matching are planned. The Node adapter does not infer whether a test is Unit, Integration, or E2E, and the CLI does not currently enforce the `Test-type` line in a spec. See [the accepted design](../decisions/003-project-defined-test-types.md).
