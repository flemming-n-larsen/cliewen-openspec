# Optional CSV encoding marker

Extend the existing CSV export capability with an optional UTF-8 byte order mark (BOM). Keep the existing output unchanged by default. Allow callers to opt in to one marker before the header, including for empty record lists. Preserve escaping, column order, and CRLF separators. Keep the implementation small and dependency-free. Spreadsheet application compatibility is outside the task; test the formatter and resulting UTF-8 bytes.

Use the installed `cliewen-delivery` schema and project configuration. Create a new OpenSpec change named `add-optional-csv-bom`. Retrieve and save the JSON instruction response for every artifact and apply before using it, under `docs/testing/instructions/`. Read existing specs and allocate any new AC IDs through the Cliewen CLI.

Create the proposal, specs, design, and tasks, then implement the change using the configured testing approach. Record the exact commands and actual red/green outcomes, including already-passing tests, under `docs/testing/`. Update the README with the API, default, and an example. Write a concise PR description in `docs/testing/pr-description.md`. Diagrams are optional where they improve understanding.

Run the existing and new tests, strictly validate the change, and review the assertions against the scenarios. You may commit changes locally to collect revision-bound evidence. Collect evidence scoped to the active change and run `cliewen-openspec check --change add-optional-csv-bom --json`. Stop before archive. Do not push or open a PR.

Use explicit local executable paths if command shims are unavailable:

```text
node node_modules/@fission-ai/openspec/bin/openspec.js
node node_modules/cliewen-openspec/dist/cli.js
node node_modules/cliewen-openspec/adapters/node-test.mjs
```
