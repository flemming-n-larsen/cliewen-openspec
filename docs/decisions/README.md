---
type: index
---
# Decisions

These accepted records capture choices confirmed in the project conversation. Acceptance describes the intended design, not implementation or release status; each record states relevant limits. Existing accepted records retain their reasoning. Detailed commands live in [configuration](../configuration.md) and [the evidence contract](../testing/evidence.md).

| Record | Decision | Current scope |
|---|---|---|
| [001](001-shared-base-and-schemas.md) | A small schema collection shares a common base | Delivery, discovery, and all implemented; release-profile evaluation pending |
| [002](002-base-and-workflow-names.md) | Base names the internal foundation, not a selectable workflow | Naming and product boundary |
| [003](003-project-defined-test-types.md) | Default to Unit/Integration/E2E and allow a project-defined replacement | Configuration, Node export, and exact scenario/evidence type checks implemented; task boundaries reviewed |
| [004](004-incremental-testing-and-optional-tdd.md) | Per-task testing by default, flexible ordering, optional TDD | Configuration and agent guidance implemented in current source |
| [005](005-capability-owned-ac-identities.md) | Capabilities own sequences across prefix changes | Native allocation implemented; external adapters planned |
| [006](006-preserve-existing-project-authorities-and-paths.md) | Preserve existing addresses, identities, and authorities | Guidance; full brownfield adapters planned |
| [007](007-durable-documents-and-general-decision-records.md) | Lightweight docs, general DRs, frontmatter, Mermaid, optional plans | Guidance/templates implemented; structural validators planned |
| [008](008-evidence-is-core-and-has-explicit-limits.md) | Evidence is core, with linkage/execution/freshness distinct from sufficiency | Alpha checks implemented; sufficiency requires review |
| [009](009-agent-evaluation-profiles-and-initial-provider.md) | Use representative agent profiles and trial OpenCode pay-as-you-go with Harbor | Accepted evaluation direction; runner trial and automated agent suite pending |
| [010](010-publish-user-documentation-early.md) | Publish navigable user documentation on GitHub Pages during alpha development | Site, replay fixture, and build/browser checks implemented in source; Pages deploys pushed main commits |
| [011](011-mermaid-and-plain-text-diagrams.md) | Prefer Mermaid for diagrams and plain text for file trees and simple sketches | Design and implementation guidance; no consumer-project diagram validator |
| [012](012-clear-writing-across-agent-output.md) | Apply clear writing and diagram guidance to all agent-authored text, including code comments, commits, and PR descriptions | Repository instructions and all delivery stages; advisory guidance |
| [013](013-tdd-enforcement-and-task-exceptions.md) | When TDD is selected, enforce test-first behavior changes with explicit task exceptions | Accepted design; task metadata and execution-history completion checks planned; write blocking later |
