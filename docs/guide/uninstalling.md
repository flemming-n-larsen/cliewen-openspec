---
type: guide
---
# Remove installed Cliewen resources

`uninstall` removes unchanged installer-owned schemas and templates plus their ownership manifest. It preserves authored docs, active/archived change files, permanent specs, project configuration, AC registry, evidence, and custom files. The npm package remains installed unless you remove it separately afterward.

## Preview first

Finish or explicitly migrate active changes that use a schema being removed. The command blocks those references, including changes inheriting a removed project default. It does not rewrite change metadata or choose how to finish a change. Archived changes are preserved and do not block removal; schema-aware commands on that history may require reinstalling its schema later.

If the project default selects Cliewen, choose an existing replacement explicitly:

```sh
npx --no-install cliewen-openspec uninstall --dry-run --default-schema spec-driven --json
```

`spec-driven` is OpenSpec's standard schema. The replacement must not be one of the schemas being removed and must pass OpenSpec's public `schema validate` command. Cliewen uses a locally resolvable OpenSpec package for that validation; if unavailable, install OpenSpec locally before retrying. Custom project/user schemas can be selected when that CLI resolves and validates them.

If the current default is unrelated or absent, omit `--default-schema`:

```sh
npx --no-install cliewen-openspec uninstall --dry-run --json
```

An unnecessary replacement flag is rejected. OpenSpec config is preserved byte-for-byte when no replacement is needed. When explicitly replacing the default, its other YAML values and comments are retained.

If the schema value anchors other fields, replacement could change those fields through aliases. Uninstall refuses that case; resolve the aliases explicitly before retrying.

## Apply the reviewed plan

The JSON preview lists `writes` and `deletes`. The only possible config write is your explicit OpenSpec default replacement. Deletions are restricted to the validated ownership manifest and the files it owns. No dry-run recovery, writes, or deletions are performed.

For the default-replacement case:

```sh
npx --no-install cliewen-openspec uninstall --default-schema spec-driven --json
```

Otherwise run the same command without `--default-schema spec-driven`. All commands support `--root PATH`.

Local edits to any owned file stop removal. There is no force option, and matching a newer package's content does not override a mismatch with the recorded ownership hash. Review useful edits and preserve them in project-owned files before deliberately restoring the installer-owned version. Missing owned files are tolerated. Unowned files are never adopted or recursively removed; empty directories and custom files can remain.

Apply recovers a leftover valid transaction first, then checks conflicts and references before removing resources. Rollback restores deleted files, the manifest, and the original default if a write/delete fails. The manifest is removed last. A successful uninstall exits 0; invalid usage, unsupported ownership, active references, validation failures, or conflicts exit 2.

## What remains

`.cliewen-openspec/config.yaml`, its registry, evidence, and local ignore file remain, along with authored project files. Their contents are not migrated or validated as a prerequisite to removal. Keep the registry to preserve identity history. The command currently supports `0.1.0-alpha.1` manifests; other versions require an explicit supported migration. Without a manifest, it refuses removal rather than guessing ownership. A repeated uninstall therefore reports a missing manifest.

Review the resulting Git diff. `check` reports not-installed after removal; run `init` again if you want to restore the schemas. Reinstallation retains configuration and the AC high-water marks, rather than restarting numbering. Removing the npm dependency is a separate choice, performed after the resource command if desired.
