# Schema sources

Edit agent instructions and Markdown templates here. `src/delivery.ts` defines the artifact dependencies and assembles these sources into the standalone `cliewen-delivery` schema during installation.

```text
schemas/
|-- base/
|   |-- instructions/    Shared writing, diagrams, routing, and testing guidance
|   `-- templates/       Decision Record template
`-- delivery/
    |-- instructions/   Proposal, specs, design, tasks, and apply guidance
    `-- templates/      OpenSpec artifact templates
```

Instruction files contain prose, with sentences on separate lines for review. The assembler joins those lines with spaces. In the tasks and apply instructions, `${testingApproach}` inserts the shared testing guidance. Markdown templates retain their line breaks. Both kinds of files normalize Windows line endings to LF.

The npm package includes this directory. File loading is relative to the installed module, so consumers can run the CLI from their own project directory. Installed destinations remain `openspec/schemas/cliewen-delivery/` and `.cliewen-openspec/templates/decision.md`.

Run `npm test` after changes. The suite includes installation from a packed tarball and OpenSpec schema validation. `base` is shared source material, not a selectable OpenSpec schema. Discovery and all remain planned.
