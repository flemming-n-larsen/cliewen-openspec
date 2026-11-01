---
type: testing
---
# Evidence alpha contract

The alpha supports `init`, `update`, `uninstall`, `ac next`, `ac rename-prefix`, `check`, and `recover`, and installs `cliewen-delivery`, `cliewen-discovery`, and `cliewen-all`. Package CI exercises OpenSpec 1.15.0 on Windows and Linux. Existing-registry adapters, structural checks for your project's documentation and Mermaid, and independent review tooling remain planned.

Initialize OpenSpec first. Install this package from a locally built tarball. Run `cliewen-openspec init --default` to explicitly select delivery; omit `--default` to preserve the existing schema. `--root PATH` supports an explicit target, and `init --dry-run` makes no changes.

Register a capability-to-prefix mapping, then allocate IDs using `cliewen-openspec ac next --capability export`. Keep the committed `.cliewen-openspec/ac-registry.json`; numbers are never reclaimed. This initial allocator supports sequential work; parallel branches must resolve collisions. Do not use it alongside another allocator until an adapter exists.

`ac.capabilities` maps each OpenSpec capability to its prefix. `ac.padding` controls minimum digit width (default 3). Use `ac rename-prefix CAPABILITY PREFIX` to change an established prefix while retaining its sequence and historical references. See [configuration](../configuration.md) for prefix selection and the default per-task testing workflow.

After implementing and committing the project inputs, run the reference adapter with explicit Node test paths:

```text
node node_modules/cliewen-openspec/adapters/node-test.mjs --change add-export test/export.test.mjs
cliewen-openspec check --change add-export --json
```

Finish README changes, task notes, results, and any PR draft before the final commit. Collect and check on that clean HEAD. A later commit makes the report stale even if it changes only documentation or metadata; collect and check again after that commit. Keep collection logs outside tracked/untracked inputs, such as a project-local ignored directory.

Report the final tested revision and check result in the terminal handoff or an ignored file. A tracked record can describe an earlier tested revision, labeled as historical. Writing the latest revision into that record and committing it creates another revision that needs fresh evidence.

Tests use titles such as `exports rows [EXPORT-001] [Test-type: Unit]`. The reference adapter supports one AC tag and requires exactly one configured test-type tag per mapped test title. It records the declared type, real Node TAP results, and the runner exit code, so failures outside mapped tests also block the check. Reports must be Git-ignored and untracked. The adapter rejects dirty input revisions and changes during execution, and invalidates older evidence when a new run starts. A crash cannot leave an earlier passing report usable.

```json
{
  "version": 1,
  "revision": "<full Git commit>",
  "scope": {"change": "add-export"},
  "execution": {"exitCode": 0},
  "results": [
    {"scenario":"EXPORT-001","test":"exports rows","testType":"Unit","outcome":"passed"}
  ]
}
```

Allowed outcomes: passed, failed, skipped, pending and manual. Pending requires a reason; `--fail-on-pending` makes it blocking. Manual results are reported as warnings and are never described as automated proof. Report schema failures exit 2; failed checks exit 1; checks without errors exit 0. Reviewed sufficiency remains explicitly unassessed in this slice.

`check --change NAME` checks active delta scenarios (REMOVED scenarios are excluded). Without it, check all permanent specs. OpenSpec retains responsibility for semantic merging. After archive changes the tree, commit and regenerate evidence without the adapter's `--change` before checking permanent specs.

## Collect evidence for one change

Pass `--change NAME` once to the Node adapter, followed by explicit test file paths. It runs every test in those files, then includes only results whose AC IDs appear in the selected change's delta specs. This supports files containing both existing tests and tests for the current change. The flag selects report results, not which tests execute.

The report records `scope: {"change": "NAME"}` and the full runner exit code. A failure in any executed test, including an unmapped test or a test outside the change, still produces a failing runner status and blocks `check`. AC-tagged tests across the run must have valid test-type metadata, including tests filtered out of the report.

Run `check --change` with the same name. A named report used for another change or for permanent specs produces `evidence-scope-mismatch`, even if its IDs overlap. Scoped reports require `execution.exitCode`. The report envelope remains version 1.

Without the adapter flag, collection retains all mapped results and omits `scope`, preserving the existing behavior. Reports without scope metadata remain accepted; the checker still detects unrelated or missing scenario references. The checker cannot infer a collection scope that an older report does not declare.

The adapter exits 0 when the runner passes, 1 when it fails with reportable results, and 2 for collection errors. Missing change specs, invalid names or options, no selected scenarios, no matching results, and incomplete runner execution are collection errors. Once collection starts from valid clean inputs and an ignored output path, an earlier report is removed before scope validation and execution, so failed recollection cannot reuse a previous pass. Scenario completeness and exact test-type matching remain the checker's responsibility.

The current alpha validates installation hashes and evidence only. Enabling other features supplies schema guidance, not implemented structural validators. The schema does not add a post-implementation artifact as an apply prerequisite. Archive is deliberately performed with OpenSpec, after reviewing evidence.

For `cliewen-discovery` changes, `check --change NAME` reads the schema selection from OpenSpec metadata and checks installation and registry health only. With evidence enabled, it reports `discovery-review-required` instead of requesting a product test report. Review research sources, actual observations, uncertainty, and the recommendation yourself. An `ok: true` result does not validate discovery documents or prove product behavior. See [the discovery guide](../guide/discovery.md).

For `cliewen-all`, check first validates decision frontmatter and the outcome branch. Delivery needs accepted status and must not skip specs, then follows this product evidence contract. No-change or further-investigation needs native `skip_specs: true` and no Markdown product deltas; it reports `discovery-review-required` without assessing product evidence. Outcome consistency and accepted-status checks remain active if evidence is disabled. Metadata cannot prove real human approval. See [the combined guide](../guide/all.md).

## Troubleshooting

| Finding or error | What to do |
|---|---|
| `evidence-not-configured` | Commit inputs, run the test adapter, and check that `evidence.report` points to its output |
| `stale-evidence` | Regenerate the report after committing the intended inputs; archive also changes the revision |
| `unverifiable-evidence` | Resolve tracked and untracked changes, then commit and rerun; confirm the project has a Git HEAD |
| `test-failed`, `test-skipped`, or `runner-failed` | Inspect real test output, fix failures, and collect a new report; do not edit a report to claim a pass |
| `missing-ac-id` or `missing-evidence` | Check scenario headings and bracketed IDs in test titles; supply a test result for each selected scenario |
| `unknown-ac-reference` | Use the matching `--change` scope or collect a report containing only the scenarios being checked |
| `evidence-scope-mismatch` | Collect for the requested change and pass the same name to `check`; after archive, recollect without the adapter's `--change` for permanent specs |
| `duplicate-ac-id` or `duplicate-test-result` | Inspect duplicate scenario identities or repeated test result entries before recollecting |
| `pending-without-reason` | Record why execution is pending; use `--fail-on-pending` when pending work must block |
| `owned-file-modified` | Review edits to installer-owned files; update replaces unmodified owned content and rejects conflicting local edits. See the update guide |
| `invalid-ac-registry` | Restore a manually changed prefix mapping and use `ac rename-prefix`; preserve the registry and reserved numbers |
| `interrupted-transaction` | Run `cliewen-openspec recover`, then review the restored files |
| Adapter says the output is not ignored | Add the custom report path to `.gitignore`; default output is ignored by init |
| `sufficiency-not-assessed` | Expected informational finding; review whether assertions actually establish the scenarios |

A `manual` result is reported as a warning and does not become automated proof. The current format records free-text context, not a reviewed-sufficiency verdict. A pending result with a reason also remains a warning unless explicitly made blocking.

Each selected scenario requires exactly one nonempty `Test-type` line. Each result requires `testType`, including pending and manual results. Types must belong to `testing.types` and match the scenario exactly. Findings are `invalid-scenario-test-type`, `missing-test-type`, `unknown-test-type`, and `test-type-mismatch`. Fix the scenario or test metadata, commit, and recollect evidence. Reports without types must be regenerated. The report envelope remains version 1 with stricter result checks.

The adapter records explicit metadata; it cannot establish whether a test actually exercises the claimed boundary. Review that boundary and task descriptions alongside assertions. See [test-type configuration](../configuration.md#test-types).
