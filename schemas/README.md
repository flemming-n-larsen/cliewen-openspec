# Schema sources

Edit agent instructions and Markdown templates here. `src/delivery.ts`, `src/discovery.ts`, and `src/all.ts` define their artifact dependencies and assemble standalone schemas during installation. `src/schema-source.ts` loads shared instructions and normalizes source files. The combined bundle reuses discovery investigation and delivery spec/task guidance rather than composing installed schemas at runtime.

```text
schemas/
|-- base/
|   |-- instructions/    Shared writing, diagrams, routing, and testing guidance
|   `-- templates/       Decision Record template
|-- delivery/
|   |-- instructions/   Proposal, specs, design, tasks, and apply guidance
|   `-- templates/      OpenSpec artifact templates
|-- discovery/
|   |-- instructions/   Proposal, investigation, decision, and closure guidance
|   `-- templates/      Investigation artifact templates
`-- all/
    |-- instructions/   Combined outcome and approval guidance
    `-- templates/      One proposal, decision/design source, and branch-aware tasks
```

Instruction files contain prose, with sentences on separate lines for review. The assembler joins those lines with spaces. In the tasks and apply instructions, `${testingApproach}` inserts the shared testing guidance. Markdown templates retain their line breaks. Both kinds of files normalize Windows line endings to LF.

The npm package includes this directory. File loading is relative to the installed module, so consumers can run the CLI from their own project directory. Installation writes all three bundles under `openspec/schemas/` and `.cliewen-openspec/templates/decision.md`.

Run `npm test` after changes. The suite includes installation from a packed tarball, schema validation, discovery handoff, native no-delivery closure, combined delivery, and evidence through archive. `base` is shared source material, not a selectable OpenSpec schema.
