---
type: decision
category: process
status: accepted
---
# Use familiar test types and preserve project definitions

## Context

Scenarios need an explicit verification boundary. Teams use different test taxonomies, so a fixed vocabulary would force existing projects to relabel tests without improving their meaning. The user accepted configurable types with familiar defaults.

## Decision

Default to `Unit`, `Integration`, and `E2E` when the project does not define test types. Let a project replace that set through `testing.types`, mapping names to descriptions of their verification boundaries. Preserve project spelling and meaning; do not silently translate existing types into the defaults.

```yaml
testing:
  types:
    Unit:
      description: Isolated behavior without external dependencies
    Integration:
      description: Interaction between components or dependencies
    E2E:
      description: Complete user or system workflow
```

Specs declare the required type through `Test-type`. Tasks identify the concrete test and boundary, and evidence identifies the executed test and its type. Validate known type names and consistency between the declared requirement and evidence. Do not infer that one type automatically substitutes for another; an E2E test and a unit test can establish different properties.

## Consequences

Descriptions make names useful across teams. Smoke, regression, and security generally describe purpose or selection rather than a verification level, but existing projects may retain their own terminology.

The alpha implements configuration, scenario parsing, adapter export, and exact type-consistency checks. Tasks receive guidance to name the concrete test and boundary; their meaning still requires review. The Node adapter requires a [Test-type: NAME] title tag and exports testType. Older reports without types fail validation and must be regenerated after adding explicit metadata.

Test type is independent of [test placement and TDD](004-incremental-testing-and-optional-tdd.md) and does not establish [assertion sufficiency](008-evidence-is-core-and-has-explicit-limits.md).
