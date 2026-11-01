---
type: reference
---
# Command reference

Run commands from the project root. All commands accept `--root PATH` to select another project. For example, `npx --no-install cliewen-openspec check --root ../my-project --json`. The examples below omit `npx --no-install` for readability.

## init

```sh
cliewen-openspec init --dry-run
cliewen-openspec init
cliewen-openspec init --default
```

Requires OpenSpec's `specs` and `changes` directories. Installs `cliewen-delivery`, `cliewen-discovery`, `cliewen-all`, the Decision Record template, default project config, a docs entry point if missing, a local ignore file, and an owned-file manifest. Repeating an unchanged installation produces an empty writes list. Conflicting owned files stop installation.

`--default` selects `cliewen-delivery` as the default schema in `openspec/config.yaml`; without it the current selection is preserved. Select discovery explicitly when creating a change with OpenSpec. `--dry-run` lists writes without applying them. Init prints its writes as JSON; `--json` also requests JSON errors. `--default` is supported only for init. Dry-run also works with update.

Installing a different package does not automatically refresh an existing installed schema. Use update for supported ownership manifests; do not delete project configuration or the registry to work around conflicts.

## update

```sh
cliewen-openspec update --dry-run --json
cliewen-openspec update --json
```

Refreshes owned schema files/templates using the installed package. Output contains `dryRun`, `writes`, and `deletes`. It adds new bundle files, replaces unchanged owned content, and deletes unchanged retired owned files. Edited files conflict unless already identical to the new content. Unowned paths are never adopted. Current alpha updates support `0.1.0-alpha.1` manifests; other versions require an explicit future migration.

Configuration, default schema, AC registry, authored changes/docs, and evidence are preserved. Apply recovers an interrupted transaction first and uses rollback; dry-run does neither. The command has no `--default` or force option. Usage, config, ownership, or write failures exit 2; success exits 0. See [the update guide](updating.md) for the full workflow and conflict rules.

## uninstall

```sh
cliewen-openspec uninstall --dry-run --default-schema spec-driven --json
cliewen-openspec uninstall --default-schema spec-driven --json
```

Removes only unchanged installer-owned resources and the ownership manifest, preserving authored files, config, registry, evidence, and custom resources. If the project default is not being removed, omit `--default-schema`; an unnecessary replacement flag is rejected. Otherwise an explicit replacement must validate through the public OpenSpec CLI. Active changes using removed schemas block uninstall, including inherited-default references. No change metadata is rewritten.

Output includes `dryRun`, `writes`, and `deletes`. Apply supports recovery/rollback; dry-run does neither. Missing owned files are tolerated; edited owned files conflict. No force option or automatic npm dependency removal is provided. Supported manifest version is `0.1.0-alpha.1`; a missing manifest is an error. Success exits 0 and usage, validation, conflict, or operation failures exit 2. See [the uninstall guide](uninstalling.md).

## ac next

```sh
cliewen-openspec ac next --capability csv-export
cliewen-openspec ac next EXP
```

Allocates one ID and writes the registry. The capability must be registered in `ac.capabilities`. The positional form accepts only a registered active prefix. There is no implicit global prefix. This command has no dry-run or JSON option.

The allocator considers the stored high-water mark and bracketed IDs in OpenSpec Markdown, including active and archived changes. Commit the registry; parallel branches still need collision resolution. See [AC configuration](../configuration.md#acceptance-criterion-ids).

## ac rename-prefix

```sh
cliewen-openspec ac rename-prefix csv-export EXPORT
```

Updates config and registry together. It preserves existing IDs and continues the capability's number sequence. The old prefix stays reserved and cannot allocate new IDs. The command rejects prefixes owned by another capability, historical prefixes, and target prefixes already present in OpenSpec documents. It has no dry-run or JSON option.

## check

```sh
cliewen-openspec check --change add-csv-export --json
cliewen-openspec check --json
cliewen-openspec check --change add-csv-export --fail-on-pending
```

With `--change`, checks that change's active delta scenarios; removed scenarios are excluded. Without it, checks permanent specs. The report must be scoped to the selected scenarios; unrelated IDs are unknown references. `--json` returns `ok` and findings. Without it, the command prints readable severity/code/message lines.

Installation and registry checks remain active when evidence is explicitly disabled. Evidence errors include missing reports, failed/skipped tests, missing/unknown/duplicate references, stale revisions, and dirty working trees. Pending with a reason is a warning unless `--fail-on-pending` is set. Manual verification is a warning. See [the report contract](../testing/evidence.md).

For a change whose OpenSpec metadata selects `cliewen-discovery`, check performs installation and registry checks only and reports `discovery-review-required` when evidence is enabled. It does not request a product test report or validate the investigation. See [discovery review](discovery.md#configuration-and-verification).

For `cliewen-all`, check requires valid decision outcome/status fields. Delivery requires accepted status, unskipped product specs, and ordinary evidence when enabled. No-delivery outcomes require native `skip_specs: true` and no Markdown product deltas, and return `discovery-review-required`. Findings include `all-decision-required`, `all-decision-unaccepted`, and `all-outcome-conflict`. These outcome checks remain active with evidence disabled; actual human agreement and research sufficiency require review. See [the combined workflow](all.md).

| Exit code | Meaning |
|---|---|
| 0 | No error findings; warnings and informational findings can remain |
| 1 | One or more check findings are errors |
| 2 | Command usage, configuration, report parsing, or another operation failed |

When `testing.approach: tdd` is selected, delivery checks also assess every numbered task's metadata, completion, and recorded execution history. Missing or invalid history blocks completion even with product evidence disabled. Discovery and combined no-delivery closure are exempt. Without `--change`, the checker warns that TDD ordering was not assessed. See [the task format and limits](../configuration.md#test-driven-development).

`--change` is supported by check and tdd; `--fail-on-pending` is only supported by check. Check is read-only and does not recover a transaction or generate evidence. The separate [Node test adapter](../testing/evidence.md#collect-evidence-for-one-change) also accepts `--change NAME` when collecting reports. Use the same change name for collection and checking; a mismatched declared scope is an error.

## tdd

```sh
cliewen-openspec tdd start --change add-csv-export --task 1.1
cliewen-openspec tdd run --change add-csv-export --task 1.1 --phase red --reason "CSV quoting is missing" -- node --test test/export.test.mjs
cliewen-openspec tdd run --change add-csv-export --task 1.1 --phase green -- node --test test/export.test.mjs
```

`start` records the declared files before a task's edits. `run` executes the task's exact command argument list from the project root and appends its output, exit code, and before/after file hashes to `.cliewen-openspec/tdd/CHANGE.jsonl`. Both require `--change` and `--task`; run also requires `--phase` and a command after `--`. Put recorder options, including `--root`, before the separator. Arguments after it belong to the test command and are passed unchanged, without a shell.

Phases are `red`, `green`, `baseline`, and `verify`. Red requires `--reason`; it preserves a failing command's nonzero exit code. Other runs also return the command's exit code. Recorder/usage failures exit 2. Start exits 0 on success. Neither command accepts `--json` or `--dry-run`. The recorder can be used to prepare history before selecting TDD; it never changes project configuration or task checkboxes.

Use baseline/green for characterization or refactoring and verify for a justified alternative check. History retains failed runs; review the output and declared files. A leftover `.lock` file blocks recording and completion checks. Confirm that no recorder command is running before removing that specific lock. The [configuration reference](../configuration.md#test-driven-development) provides the metadata format, sequence rules, and adoption steps.

## recover

```sh
cliewen-openspec recover
```

Restores originals and removes new files recorded in an interrupted transaction journal. With no journal, there is nothing to restore. Use it when check reports `interrupted-transaction`; review the restored files afterward.

## Version and help

```sh
cliewen-openspec --version
cliewen-openspec --help
```

OpenSpec commands such as `new change`, `validate`, and `archive` belong to OpenSpec, not this CLI.
