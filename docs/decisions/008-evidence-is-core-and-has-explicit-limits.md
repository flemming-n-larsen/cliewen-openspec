---
type: decision
category: architecture
status: accepted
---
# Treat evidence as core without overstating what it proves

## Context

Stable scenario IDs and passing test counts are useful but cannot establish whether assertions prove the intended behavior. Evidence is a central part of Cliewen's value and must be present from the first working implementation.

## Decision

Keep the name evidence and enable the facility by default. Distinguish scenario/test linkage, execution outcomes, tested-revision freshness, and reviewed sufficiency. Preserve explicit missing, failed, skipped, pending, and manual states; missing setup never counts as passing. Pending requires a reason and can be made blocking.

Use adapters to export framework-neutral execution results while respecting existing test metadata and project authorities. Evidence is collected after implementation and checked before archive; it cannot be an existence prerequisite for starting implementation. Discovery findings are not proof of unimplemented product behavior.

## Consequences

The alpha records real Node test outcomes and runner status, checks the report against a clean Git revision, and reports linkage errors separately. Assertion sufficiency remains explicitly unassessed by the CLI. Human review must assess whether assertions establish the scenario at the intended boundary.

Final passing evidence cannot establish historical TDD order. Test-type consistency is also not yet checked; it requires [the planned test-type support](003-project-defined-test-types.md). See [the current evidence contract](../testing/evidence.md) for supported outcomes and limitations.
