# Schema sources

Edit agent instructions and Markdown templates here. `src/delivery.ts` and `src/discovery.ts` define their artifact dependencies and assemble standalone schemas during installation. `src/schema-source.ts` loads shared instructions and normalizes source files.

```text
schemas/
|-- base/
|   |-- instructions/    Shared writing, diagrams, routing, and testing guidance
|   `-- templates/       Decision Record template
|-- delivery/
|   |-- instructions/   Proposal, specs, design, tasks, and apply guidance
|   `-- templates/      OpenSpec artifact templates
`-- discovery/
    |-- instructions/   Proposal, investigation, decision, and closure guidance
    `-- templates/      Investigation artifact templates
```

Instruction files contain prose, with sentences on separate lines for review. The assembler joins those lines with spaces. In the tasks and apply instructions, `${testingApproach}` inserts the shared testing guidance. Markdown templates retain their line breaks. Both kinds of files normalize Windows line endings to LF.

The npm package includes this directory. File loading is relative to the installed module, so consumers can run the CLI from their own project directory. Installation writes `openspec/schemas/cliewen-delivery/`, `openspec/schemas/cliewen-discovery/`, and `.cliewen-openspec/templates/decision.md`.

Run `npm test` after changes. The suite includes installation from a packed tarball, OpenSpec schema validation, discovery closure without code changes, and separate delivery handoff. `base` is shared source material, not a selectable OpenSpec schema. The combined all workflow remains planned.
