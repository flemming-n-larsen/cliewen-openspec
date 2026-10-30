---
type: guide
---
# Cliewen for OpenSpec

Cliewen adds project documentation, Decision Records, stable acceptance criterion IDs, and test evidence to an OpenSpec workflow. Use it when you want an agent to leave behind an explanation of what changed and a record of which scenarios were tested.

The current alpha provides two workflows. `cliewen-delivery` takes an understood change through proposal, behavior specs, design, implementation tasks, and verification. [Discovery](discovery.md) investigates a question and produces a recommendation, including the option to make no change. OpenSpec owns the change files, spec synchronization, and archive. Your coding agent writes the artifacts and implementation; Cliewen supplies instructions, templates, configuration, ID allocation, and evidence checks.

[Start with your first change](getting-started.md). It uses a small CSV exporter and ends with an archived change and fresh evidence.

Use the search button to find commands, configuration fields, and guide sections. The appearance switch selects the site's light or dark colors; the default follows your system preference.

## What works today?

| Feature | What you can use |
|---|---|
| Delivery schema | Proposal, specs, design, and tasks templates with guidance for documentation and verification |
| Discovery schema | Proposal, investigation, and decision templates for research, no-change conclusions, or delivery handoff |
| Installation | Preview writes, preserve the existing default schema, or explicitly select delivery |
| Acceptance IDs | Configure a prefix per capability, allocate numbers, and change a prefix while preserving existing IDs |
| Task-level testing | Test each implementation task before continuing; optionally use TDD |
| Evidence | Run tagged Node tests, record their Git revision, and check outcomes and scenario references |
| Decision Records | A Markdown template and guidance for recording choices that affect future work |
| Documentation and Mermaid | Guidance for maintaining explanations and embedded diagrams |
| Recovery | Restore files from an interrupted installer transaction |

The package has no npm release yet. Build and install a local tarball. The deterministic workflow test uses OpenSpec 1.15.0; package CI exercises Node 22 and 24 on Windows and Linux.

## Defaults

Testing uses `placement: per-task` and `approach: flexible`. Each task gets its relevant tests, but you can write those tests before or after the code. TDD is an explicit choice.

Documentation lives under `docs/`. Documentation, decisions, Mermaid, planning, review, and evidence are all enabled. A facility being enabled makes it available; it does not require a new document or a separate review for every change. Acceptance numbers have at least three digits, and each capability needs a prefix mapping before allocation.

The [configuration reference](../configuration.md) lists every accepted setting and its default. The CLI rejects unknown settings.

## What is still planned?

`cliewen-all` remains planned. `cliewen-base` names the shared internal foundation and is not a selectable schema.

The alpha supports configurable test types and checks declared scenario types against evidence. It does not implement `update`, `uninstall`, or existing-registry adapters. Structural checks for your project's documentation and Mermaid diagrams also remain planned.

Cliewen checks test execution, ID linkage, and revision freshness. You still need to review whether the assertions prove the intended behavior. The CLI also does not enforce the historical order of TDD steps.
