---
type: index
---
# Decisions

These accepted records capture choices confirmed in the project conversation. Acceptance describes the intended design, not implementation or release status; each record states relevant limits. Existing accepted records retain their reasoning. Detailed commands live in [configuration](../configuration.md) and [the evidence contract](../testing/evidence.md).

| Record | Decision | Current scope |
|---|---|---|
| [001](001-shared-base-and-schemas.md) | A small schema collection shares a common base | Delivery implemented; discovery/all planned |
| [002](002-base-and-workflow-names.md) | Base names the internal foundation, not a selectable workflow | Naming and product boundary |
| [003](003-project-defined-test-types.md) | Default to Unit/Integration/E2E and allow a project-defined replacement | Configuration, export, and consistency validation planned |
| [004](004-incremental-testing-and-optional-tdd.md) | Per-task testing by default, flexible ordering, optional TDD | Configuration and agent guidance implemented in current source |
| [005](005-capability-owned-ac-identities.md) | Capabilities own sequences across prefix changes | Native allocation implemented; external adapters planned |
| [006](006-preserve-existing-project-authorities-and-paths.md) | Preserve existing addresses, identities, and authorities | Guidance; full brownfield adapters planned |
| [007](007-durable-documents-and-general-decision-records.md) | Lightweight docs, general DRs, frontmatter, Mermaid, optional plans | Guidance/templates implemented; structural validators planned |
| [008](008-evidence-is-core-and-has-explicit-limits.md) | Evidence is core, with linkage/execution/freshness distinct from sufficiency | Alpha checks implemented; sufficiency requires review |
