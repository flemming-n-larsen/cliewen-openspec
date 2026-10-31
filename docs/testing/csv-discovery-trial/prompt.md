# Should CSV export support streaming?

Investigate whether this project's CSV exporter should support streaming or keep its current string-returning function. Use `cliewen-discovery` in a new change named `investigate-csv-streaming`.

No production workload measurements, export-size limits, latency goals, or memory budget are available. Do not invent them. Compare keeping the current function with a streaming approach and explain what information would justify changing the API. A recommendation of no change or further investigation is valid; you are not expected to implement streaming.

Read the installed schema instructions and project configuration. Save the JSON instruction response for proposal, investigation, decision, and apply under `docs/testing/instructions/`. Write the three discovery artifacts with concise explanations, descriptive source references, actual observations, and explicit uncertainty. Keep the recommendation proposed for human review. Use diagrams only if they improve understanding.

You may inspect local code and run small local experiments. Each experiment must finish within 20 seconds and use at most 50,000 synthetic rows; the total experiment runtime budget is 60 seconds. Do not install dependencies, use network services, spend money, change production code/tests/specs/AC identities, or create a delivery change. If local tools cannot answer a question, record it as unresolved. Synthetic measurements are not production requirements or proof that streaming is faster.

Record reproducible experiment commands, input sizes, actual outputs, relevant revision, and limitations in `docs/testing/`. Check existing tests, installed schema validity, artifact status, and Cliewen health. Explain what those checks do and do not establish. You may commit the investigation locally. Stop before accepting the decision, implementing product changes, archiving, pushing, or opening a PR.

Local commands are available through:

```text
node node_modules/@fission-ai/openspec/bin/openspec.js
node node_modules/cliewen-openspec/dist/cli.js
```
