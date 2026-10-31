# Investigate and plan optional CSV encoding support

Use the installed `cliewen-all` schema in one change named `add-optional-csv-bom`. Investigate how to support an optional UTF-8 byte order mark while preserving existing CSV output by default. Compare API choices, inspect existing behavior, and recommend a small dependency-free approach. Spreadsheet application compatibility is outside the trial.

Read project configuration and retrieve/save JSON instructions for proposal, investigation, and decision in `docs/testing/instructions/`. Use one proposal and decision as the design source; no separate discovery change, delivery change, or design.md. Record sources, actual observations, and uncertainty. Preserve existing code, tests, specs, and AC registry during this investigation stage.

Stage 1 ends at human review. Leave decision.md status proposed, choose an honest outcome, and explain what approval would authorize. You may prepare draft specs/tasks after the recommendation, but do not implement product code or claim acceptance. Save an exact local instruction for continuing after human agreement in docs/testing/review-request.md. Stop before acceptance, implementation, archive, push, or external PR. You may commit the investigation locally.

If a person later approves delivery, continue in the same change, record the real approval source, set accepted status, write specs and per-task tests using the configured approach, implement, collect scoped evidence, and run check. Retrieve the remaining artifact and apply instructions before that stage. If the agreed outcome is no-change or further-investigation, use native skip_specs: true and genuine closure tasks, without fake product requirements or implementation tasks.

Local tools:

```text
node node_modules/@fission-ai/openspec/bin/openspec.js
node node_modules/cliewen-openspec/dist/cli.js
```
