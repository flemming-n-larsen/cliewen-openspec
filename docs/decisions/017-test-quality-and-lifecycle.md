---
type: decision
category: process
status: accepted
---
# Separate test coverage, effectiveness, and lifecycle review

## Context

Passing tests and scenario links do not establish sufficient cases, effective assertions, or correct test retirement. The approved roadmap puts a bounded design and trials before implementation.

## Decision

Provide independent coverage, effectiveness, and lifecycle policies. Default to review guidance, with explicit opt-out and opt-in enforcement of record completeness. Count distinct cases and require scoped reasons for exceptions. Assess assertion effectiveness through relevant failures. Maintain tests against accepted behavior and explicit retirement, preserving active obligations and identity history.

The [change design](../../openspec/changes/test-quality-and-lifecycle/design.md) owns draft configuration, alternatives, record boundaries, and migration. Review trial findings before accepting these details. Update affected documentation and decisions with each implementation slice.

## Consequences

The [design trials](../testing/test-quality-trial.md) exercise controlled defects, test maintenance, and existing report compatibility. Candidate-record checks reinforce the limits of scoped exceptions and declared-input freshness; they do not establish future product enforcement or authenticate retirement approval. The [proposed record contract](../../openspec/changes/test-quality-and-lifecycle/record-contract.md) makes those boundaries concrete for review before implementation.

This extends [Decision 008: Treat evidence as core without overstating what it proves](008-evidence-is-core-and-has-explicit-limits.md). It preserves [Decision 003: Use familiar test types and preserve project definitions](003-project-defined-test-types.md) and [Decision 005: Let capabilities own persistent AC sequences](005-capability-owned-ac-identities.md).

The user accepted this decision on November 1, 2026. These new policies are unimplemented; detailed configuration defaults and record formats still need trial-based review. Existing evidence and TDD contracts remain in force; semantic suitability remains a review responsibility.
