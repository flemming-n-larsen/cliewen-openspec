---
type: evaluation
---
# CSV BOM agent trial

## Result

On October 30, 2026, the current Codex session implemented an optional CSV encoding marker in an isolated copy of the local CSV pilot. All nine Unit tests passed, strict OpenSpec validation passed, and the evidence check passed for the three new scenarios. The change remains unarchived for review.

This was a supervised continuation of the project conversation, with setup and implementation performed by the same agent. It was not a fresh-context or independent agent evaluation. The reference prompt below captures the task for a future repeat; it was not submitted to a separate agent in this run.

## Reference prompt

> Extend the existing CSV export capability with an optional UTF-8 byte order mark. Keep existing output unchanged by default. Support an explicit opt-in marker before the header, including empty record lists, while preserving escaping, column order, and CRLF separators. Read the installed Cliewen schema instructions and project configuration. Create proposal, specs, design, and per-task tests, then implement the change using the configured test approach. Preserve existing IDs and allocate new ones through the CLI. Record actual test outcomes, validate the OpenSpec change, collect revision-bound evidence, and write a concise PR description. Stop before archive. Use diagrams only where they improve understanding. Do not claim compatibility with a spreadsheet application without testing it.

## Profile and setup

| Setting | Value |
|---|---|
| Agent | Current Codex session |
| Model | gpt-6.1-sol, as identified by the session |
| CLI version, effort, cost, token usage | Not exposed or measured for this run |
| Access | Local shell and filesystem; existing conversation context |
| Package | Local tarball from Cliewen commit `dcf6a3a`, version `0.1.0-alpha.1` |
| Pilot baseline | `18e5769` in the local `cliewen-pilot` repository |
| Testing | Per-task, TDD, default Unit/Integration/E2E types |
| Trial branch | `trial/csv-bom` in `.tmp/agent-trials/csv-bom/` |
| Final input revision | `555641639bd95019f759322d5c06236364e08a09` in that isolated repository |

Setup cloned the pilot without hard links, installed the current packed package, and verified existing installer-owned file hashes before replacing those files and their manifest. This was trial-only preparation; the product still has no update command. Setup also added explicit Unit tags to the existing six tests and archived the completed original change to establish permanent baseline specs. The source pilot was left unchanged.

## Observations

- The agent kept capability `csv-export` and allocated `EXP-007` through `EXP-009`, preserving `EXP-001` through `EXP-006`.
- The API became `exportCsv(records, columns, options = {})`, with the marker enabled only for `options.bom === true`.
- The first new test failed on the intended missing U+FEFF character, then passed after implementation. The other two tests passed immediately and were recorded as boundary checks, without invented red phases.
- The first recorder invocation accidentally targeted the old test file and selected no BOM tests. The recorder rejected that run as an expected-red failure. Its log was retained, and the recorder gained an explicit test-file argument before the actual red run.
- The proposal explains the default and scope in plain language. The design and PR description distinguish string/byte checks from spreadsheet application compatibility. No new DR or diagram was needed for a single prefix operation.
- Task descriptions name the concrete Unit tests and function boundary. README updates accompanied the implementation tasks. Type matching passed for the new scenario evidence.

The agent reviewed its own output. These observations do not establish independent review quality, reliable behavior across models, or adherence in a fresh session. The agent queried the proposal instruction explicitly, but did not separately capture the OpenSpec instruction response for each later artifact. A repeat should capture every artifact's instruction response and use a fresh context.

## Validation and local artifacts

From the isolated repository, run:

```sh
node --test test/export.test.mjs test/bom.test.mjs
node node_modules/@fission-ai/openspec/bin/openspec.js validate add-optional-csv-bom --type change --strict
node node_modules/cliewen-openspec/adapters/node-test.mjs test/bom.test.mjs
node node_modules/cliewen-openspec/dist/cli.js check --change add-optional-csv-bom --json
```

The first command passed nine tests. The adapter report contains the three new scenarios, scoped to the active change, at the final input revision. The checker returned `ok: true` with only the expected `sufficiency-not-assessed` information. No archive or external PR was created for the new change.

Local artifacts in that repository:

```text
openspec/changes/add-optional-csv-bom/
|-- proposal.md
|-- design.md
|-- specs/csv-export/spec.md
`-- tasks.md
test/bom.test.mjs
docs/testing/bom-pr-description.md
docs/testing/tdd-observations.json
.cliewen-openspec/evidence.json
```

The implementation, planning artifacts, PR draft, and observations are committed in the isolated repository. Evidence is ignored and can be regenerated using the commands above. The isolated repository is under `.tmp/` and is not distributed with the main repository. This report is the durable result summary, not an automated or fully reproducible agent benchmark.
