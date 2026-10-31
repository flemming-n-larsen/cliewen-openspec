---
type: evaluation
---
# Validate uninstall and reinstallation in the original pilot

On October 31, 2026, a clone of the original CSV pilot at `18e5769ee74f5dcb9fffbd993dcf538f7fb64379` exercised uninstall from a current local tarball. The source pilot was preserved. Setup first used update to refresh the older installation's owned resources.

The first uninstall preview correctly refused removal because `add-csv-export` was still active and referenced a schema being removed. The scripted test then archived that completed change in the isolated clone using OpenSpec. It did not silently migrate change metadata.

After archive, preview and apply selected the same 17 owned files, including the ownership manifest. Eighteen authored/config/history files were compared and preserved. All six CSV tests still passed, and the remaining OpenSpec `spec-driven` schema validated. Reinstallation succeeded and the next allocation was EXP-007, preserving the registry's earlier six identities.

The clone is `.tmp/agent-trials/uninstall-pilot/`; `.tmp/uninstall-pilot-result.json` contains the refusal, preview/apply lists, preservation list, schema/test output, and next-ID result. Those local generated files are ignored. This was a scripted integration check, not another agent/model trial.

Automated tests also cover explicit default replacement, validation through the public OpenSpec CLI, custom schemas, inherited/nested active references, archived history, YAML anchors/comments, unrelated defaults, local edit conflicts, missing files, unsafe ownership, supported-version limits, rollback after partial deletion/default replacement, interrupted recovery, and packed CLI uninstall/reinstall. No successful product evidence check is claimed for legacy test titles lacking current metadata.

See [the uninstall guide](../guide/uninstalling.md) for behavior and limits.
