---
type: evaluation
---
# Verify official change scoping in the BOM pilot

On October 30, 2026, the completed fresh-context pilot was cloned into `.tmp/agent-trials/scoped-bom/`. The original pilot and original trial were preserved. This follow-up was a scripted integration check, not another agent trial.

The clone installed a current local tarball containing the new adapter scope support. Its custom evidence filtering was replaced with a small wrapper around:

```sh
node node_modules/cliewen-openspec/adapters/node-test.mjs --change add-optional-csv-bom test/export.test.mjs
```

All nine tests passed. The report contained only EXP-007 through EXP-009, declared `scope.change: add-optional-csv-bom`, and retained the full runner exit code of zero. The matching check returned `ok: true`, with the expected sufficiency-not-assessed information.

Inputs were committed at `dd9c0b5c76322cf662720c0bfff092ceeaa55a3f` in the isolated clone. The report revision matched that commit. Raw output and the report are stored locally in `.tmp/scoped-bom-result.json`. No change was archived or pushed. The clone retained its installed schema files; changing the package did not perform a schema upgrade.

The official adapter removes the need for the filtering logic identified in [trial 001](result-001.md). Separate regression tests verify that failures outside the selected change still block, and that declared scope mismatches are rejected.
