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

Bind product execution evidence to the adopting project's clean final commit. Finish authored documentation and result notes before collection. Any later commit, including documentation-only changes, requires fresh collection and another check; unchanged production code alone does not establish report freshness.

A change-scoped report selects scenario results without hiding failures in the executed suite. Preserve the full runner exit status, including failures outside the selected scenarios, and check the report against the same change scope.

Review whether an experiment actually observes the quantity it claims to measure. Distinguish peak memory from memory retained after completion or garbage collection. An invalid method leaves that quantity unmeasured; revise conclusions that depended on it instead of labeling invalid numbers approximate.

## Consequences

The alpha records real Node test outcomes and runner status, checks the report against a clean Git revision, and reports linkage errors separately. Assertion sufficiency remains explicitly unassessed by the CLI. Human review must assess whether assertions establish the scenario at the intended boundary.

Final passing evidence cannot establish historical TDD order. Test-type names and exact scenario-to-evidence consistency are checked under [the test-type decision](003-project-defined-test-types.md); the claimed boundary still requires review. See [the current evidence contract](../testing/evidence.md) for supported outcomes and limitations.

The current adapter and checker implement final-revision freshness and change-scope/full-runner-status checks. Experiment validity and assertion sufficiency remain review responsibilities in adopting projects. Execution-history enforcement is planned under [013: Enforce TDD for behavior changes with explicit task exceptions](013-tdd-enforcement-and-task-exceptions.md). Maintainer pilot results demonstrate bounded observations, not verification of another project's tests or research.
