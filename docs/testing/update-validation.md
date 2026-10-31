---
type: evaluation
---
# Validate updates against the original CSV pilot

On October 31, 2026, a clone of `C:/Code/cliewen-pilot` at revision `18e5769ee74f5dcb9fffbd993dcf538f7fb64379` exercised the new update command. The original pilot was not changed. The clone installed a local current tarball, preserving the older schema installation and ownership manifest until update ran.

Dry-run and apply produced the same plan: 12 resource writes, no retired-file deletions in this particular installation. The operation installed the missing discovery and combined bundles and refreshed owned delivery resources. All three OpenSpec schemas validated, six original tests passed, and a second update reported no writes/deletes.

Exact contents were checked before and after update for project config, AC registry, OpenSpec config, README, formatter, and test file. They were unchanged. Package installation itself updated npm metadata as expected; this was separate from the resource update. The test did not claim a successful product evidence check against legacy test titles lacking current type tags.

The local clone is `.tmp/agent-trials/update-pilot/`; captured preview, apply results, schema output, test output, and preservation checks are in `.tmp/update-pilot-result.json`. These generated files are ignored.

Automated regressions additionally exercise locally edited current/retired files, unowned collisions, identical-current-content adoption, missing/new bundle files, unsupported or unsafe manifests, preserved authored state, dry-run, interrupted-transaction recovery, and rollback after deletions when manifest publication fails. A dangling symlink check prevents creating an outside target through an owned path. Packed-installation coverage exercises update through the distributed CLI.

This validates updates within the supported alpha manifest version. It does not establish migration support for other package versions or old config/registry formats. See [the update guide](../guide/updating.md).
