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

Requires OpenSpec's `specs` and `changes` directories. Installs `cliewen-delivery`, the Decision Record template, default project config, a docs entry point if missing, a local ignore file, and an owned-file manifest. Repeating an unchanged installation produces an empty writes list. Conflicting owned files stop installation.

`--default` changes the default schema in `openspec/config.yaml`; without it the current selection is preserved. `--dry-run` lists writes without applying them. Init prints its writes as JSON; `--json` also requests JSON errors. `--default` and `--dry-run` are supported only for init.

The alpha has no upgrade migration. Installing a different package does not refresh an existing installed schema. Keep your authored files and use a separate pilot when trying a changed schema. Do not delete a working project's config or registry to work around conflicts.

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

| Exit code | Meaning |
|---|---|
| 0 | No error findings; warnings and informational findings can remain |
| 1 | One or more check findings are errors |
| 2 | Command usage, configuration, report parsing, or another operation failed |

`--change` and `--fail-on-pending` are only supported by check. Check is read-only and does not recover a transaction or generate evidence.

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

`update` and `uninstall` are not implemented. OpenSpec commands such as `new change`, `validate`, and `archive` belong to OpenSpec, not this CLI.
