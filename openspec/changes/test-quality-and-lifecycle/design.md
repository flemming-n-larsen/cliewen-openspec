# Design

## Context

The [proposal](proposal.md) defines scope. Current version-1 reports identify scenario, test name, test type, outcome, and revision. The checker rejects duplicate scenario/test pairs and stale evidence; it does not assess case categories or retirement intent. The Node adapter maps one scenario per test.

## Goals / Non-Goals

Separate mechanically checked records from reviewed test meaning. Preserve flexible testing, optional TDD, and project-defined types. Automatic test deletion, mandatory mutation tools, and semantic proof are outside scope.

## Decisions

### Independent configuration

Proposed defaults, not supported by the current parser:

```yaml
testing:
  quality:
    coverage:
      mode: review
      minimumCases:
        positive: 1
        negative: 1
        boundary: 0
    effectiveness:
      mode: review
  lifecycle:
    mode: review
```

Each mode accepts `off`, `review`, or `enforce`. Off skips that policy's checks and guidance. Review reports incomplete records as warnings; enforce blocks on missing or invalid records. Minima are nonnegative integers. Unknown keys and invalid values fail configuration validation. Boundary cases still receive review where meaningful despite a zero minimum.

Enforce requires `features.evidence: true`; contradictory configuration fails with recovery instructions. With evidence disabled, review mode supplies guidance and explicitly reports execution-backed assessment as unavailable. Policies are independent of placement, TDD, documentation, and optional independent-review guidance. Existing installation, registry, and TDD checks retain their contracts.

Warn-first adoption avoids new blocking requirements in existing projects. A universal minimum without exceptions was rejected because some scenarios lack a meaningful negative case. Exceptions name the policy, scenario, reason, and reviewed disposition. They waive only the stated obligation, never failed tests or stale evidence. A status field cannot authenticate human approval.

### Coverage and effectiveness

Give each case a stable identity within its scenario and one primary category. Several distinct cases may satisfy one category. Count only distinct passed, fresh, type-consistent automated cases. Retries, duplicate identities, skipped, pending, and manual results do not increase automated counts. Semantic distinctness and appropriate classification require review.

Effectiveness records identify the scenario, cases, inspected assertion, controlled defect or relevant TDD failure, command, observed result, inspected inputs, and review conclusion. Syntax errors, missing dependencies, and unrelated failures do not establish assertion effectiveness. Mutation tools are optional. Deterministic validation checks record structure and freshness; reviewers assess the failure cause and behavioral meaning.

Use committed change-local review records and generated ignored execution evidence. Bind review claims to inspected input hashes, avoiding a committed record that must contain its own commit hash. Relevant input changes invalidate review claims; every later commit still requires fresh execution evidence under the current contract.

Extend report version 1 with optional `caseId` and `coverage` result fields. The [compatibility trial](../../../docs/testing/test-quality-trial.md#limits-and-remaining-work) confirmed that the existing checker accepts these fields while retaining its execution and identity checks; it rejects version 2. Keep scenario/test-name pairs unique even when case IDs differ. New checks must validate the added fields rather than relying on the old parser's tolerance.

Finalize exact review-record fields, identity encoding, and diagnostics before implementation. Version-1 reports without case metadata remain usable with these policies off; stricter policies request recollection or missing review records explicitly. Multi-scenario adapter export is deferred; lifecycle review must still preserve shared-test obligations.

### Lifecycle

Record a baseline revision, affected criteria, and each affected case's disposition: retain, update, remap, or remove. Refactoring preserves valid behavior assertions; accepted behavior changes update affected assertions. A missing ID is unresolved intent, not permission to delete tests.

Retirement requires an explicit accepted requirement change and reason. Preserve reserved IDs and historical results. Remove obsolete assertions only when they serve no active obligation; retain, split, or remap shared tests. Reuse the existing identity authority. Record completeness can be checked; completeness of impact analysis and semantic suitability remain review responsibilities.

## Risks / Trade-offs

The [first design trial](../../../docs/testing/test-quality-trial.md) confirms that positive-only coverage and weak assertions miss relevant defects, and that changed or retired behavior needs targeted test maintenance. Its candidate evaluator is experimental; product parser compatibility and review-record validation remain unverified.

Categories and review conclusions may be wrong even when structurally valid. Keep semantic limits visible in passing diagnostics. Controlled defects run in disposable fixtures, with restoration verified. Trial observations remain separate from delivery evidence.

## Migration Plan

Run the four bounded trials in [the tasks](tasks.md), revise the contract and Decision 017, and obtain agreement before runtime implementation. Ship small slices with tests and affected documentation. Verify omitted defaults, independent opt-outs, old reports, and evidence disabled. Preserve authored records when disabling or uninstalling facilities.
