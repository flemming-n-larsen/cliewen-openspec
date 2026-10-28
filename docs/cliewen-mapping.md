# Practice mapping

This supersedes the earlier configuration-only mapping. See the [implementation plan](../plan.md).

| Practice | Owner / carrier | Validation boundary |
|---|---|---|
| Change lifecycle and behavioral specs | OpenSpec | Native validation, sync and archive |
| Delivery, discovery and combined workflow | Schemas from shared definitions | Schema validation and workflow fixtures |
| Durable architecture/design | Shared docs and maintenance instructions | Metadata/links; factual accuracy reviewed |
| Decision Records | Decisions folder; category/status frontmatter | Status/replacement links; humans accept |
| Mermaid | Embedded Markdown diagrams | Syntax/rendered examples; meaning reviewed |
| Vision/goals | Optional documents; inferred intent unconfirmed | Human confirmation, never invented at installation |
| Plans/milestones | Repo plans or ticket system | Handoff links, no duplicate status source |
| Acceptance identities | Registry adapter or persistent high-water marks | Duplicates, unknown/retired references, no reuse |
| Test types and behavioral boundaries | Scenarios and evidence metadata | Structure checked, adequacy reviewed |
| Execution evidence | Repository adapters and neutral JSON | Linkage, outcomes and freshness separate |
| Positive/negative/boundary cases | Evidence declarations and focused review | Markers do not prove assertion quality |
| Independent review | Optional fresh-context procedure | Retained findings; no mandatory platform |
| Documentation impact | Proposal/tasks/apply/archive instructions | Advisory guidance versus deterministic checks |
| Safe installation | Manifest and transaction journal | Conflict, rollback, idempotence, removal tests |

## Compatibility and limits

Reuse Intent Engineering conventions, AC IDs, tags and scripts. Neither iec nor Cliewen runtime is required. Existing ADRs may stay in place during adoption. Specs own behavior; durable docs describe decisions and implemented architecture.

No global artifact graph, automatic Git/merge policy, merge-bound acceptance record, mandatory independent review, automatic migration or guarantee of semantic test correctness. Completed plans are not mechanically immutable. Parallel ID allocations can collide and must be checked. Unknown references alone do not establish why a scenario disappeared.

## Sources

Original research: Cliewen v0.31.0 (`dc12a58`) and OpenSpec 1.14.1. Revised decisions reflect project planning; revalidate released-package compatibility before claiming support.

- [OpenSpec customization](https://github.com/Fission-AI/OpenSpec/blob/main/docs/customization.md)
- [Intent Engineering](https://intent-engineering-for-coding-agents.github.io/book/)
- [AC IDs and coverage](https://intent-engineering-for-coding-agents.github.io/book/quality/ac-ids-coverage.html)
- [Credits](../CREDITS.md)
