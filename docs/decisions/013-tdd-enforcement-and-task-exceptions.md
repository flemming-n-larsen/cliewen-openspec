---
type: decision
category: process
status: accepted
---
# Enforce TDD for behavior changes with explicit task exceptions

## Context

A passing final test suite cannot show whether tests preceded implementation. Agent trials also showed that a failure caused by a wrong expectation can be reported as a red phase even though the new behavior was implemented first. Some tasks need verification without a new failing behavior test.

## Decision

Keep `testing.approach: flexible` as the project default, as established in [004: Test each task and offer TDD as an explicit approach](004-incremental-testing-and-optional-tdd.md). When a project selects TDD, tasks that add or change behavior must follow this sequence: write the relevant executable test, observe its failure because the intended behavior is missing, implement the behavior, then rerun until green and refactor with tests passing. OpenSpec specifications do not substitute for these executable tests.

Each task states its testing method, concrete verification, and completion check. A departure from the TDD sequence requires a reason recorded in the task and reviewed with the task plan, without a separate approval at every command.

| Task | Required approach |
|---|---|
| New or changed behavior | A relevant failing test before implementation, followed by a passing run |
| Existing behavior without coverage | Write the test first; an already-passing characterization test is valid and must be reported honestly |
| Pure refactoring | Run relevant tests before and after; add tests where coverage is insufficient |
| Work without a relevant behavior test | Explain the exception and specify another check, such as building documentation, checking links, or executing an example |

Task categories do not grant blanket exemptions. Configuration or tooling changes can alter behavior and require tests. An exception changes the verification method; it does not remove verification.

The first enforcement stage is a blocking completion check against recorded execution history. For tasks requiring a red phase, that history must connect the relevant test change and failing run to the subsequent production change and passing run. Setup, import, syntax, or mistaken-expectation failures do not establish missing behavior. Missing history remains unverified rather than becoming a pass.

Write blocking is a later stage: a controlled runner could restrict production edits until the required failing test has been observed. That requires control over every write route, including shell commands. Schema instructions alone cannot provide that guarantee.

## Consequences and implementation status

This extends decision 004 without changing its defaults or replacing its reasoning. The project owner accepted the policy in the side conversation and explicitly requested this record. That agreement approves the design; it does not claim that enforcement has been implemented.

Task metadata, execution-history collection, and the blocking completion check remain planned. Write blocking is a subsequent step. Review must still assess exception reasons, assertion quality, and whether a failure represents the intended missing behavior. Preserve the distinction between execution history and final-result evidence described in [008: Treat evidence as core without overstating what it proves](008-evidence-is-core-and-has-explicit-limits.md).
