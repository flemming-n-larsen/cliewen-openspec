---
type: decision
category: process
status: accepted
---
# Test each task and offer TDD as an explicit approach

## Context

Deferring tests until all implementation is complete delays feedback and compounds debugging. Requiring TDD for every project would also impose a sequence that may not fit existing tests, integrations, or maintenance work.

## Decision

Default to `testing.placement: per-task` and `testing.approach: flexible`. Each implementation task includes relevant tests, a test command, and a completion check; failures are fixed before the next task. Flexible permits tests before or after code within the selected placement. An explicit `end-of-change` placement remains available.

Offer `approach: tdd`, requiring `placement: per-task`. Each implementation task describes a red-green-refactor cycle: run a focused test and observe failure for the intended missing behavior, implement until green, then refactor while keeping tests green. Setup, import, or syntax failures do not establish the intended red phase. Record actual commands and outcomes; report an already-passing test honestly rather than manufacturing a failure. Documentation-only work uses appropriate validation.

## Consequences

Final regression and committed-revision evidence collection remain necessary in either approach. This changes task planning and implementation instructions, not OpenSpec spec syntax. Configuration rejects contradictory settings; the CLI does not enforce historical execution order or prove TDD from a final passing report.

The current source implements this configuration and guidance. The CSV pilot exercised the workflow; one pilot is bounded feedback, not evidence that all agents follow it. See [configuration](../configuration.md#test-driven-development) and [the evidence boundary](008-evidence-is-core-and-has-explicit-limits.md).

[013: Enforce TDD for behavior changes with explicit task exceptions](013-tdd-enforcement-and-task-exceptions.md) extends this decision with per-task exceptions and staged enforcement when TDD is selected. The defaults above remain unchanged.
