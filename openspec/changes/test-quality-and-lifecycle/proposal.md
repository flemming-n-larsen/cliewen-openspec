# Proposal

## Why

Passing execution evidence can hide missing negative cases, ineffective assertions, or tests that no longer match accepted behavior. The alpha needs explicit coverage and lifecycle review while preserving its distinction between execution checks and semantic assessment.

## What Changes

- Add independent coverage, effectiveness, and lifecycle policies, with configurable modes and scoped exceptions.
- Count distinct positive, negative, and boundary cases per scenario, separately from project-defined test types.
- Record focused evidence that assertions detect relevant defects.
- Review retained, updated, remapped, and removed tests against accepted behavior changes and explicit retirement.
- Trial the design before runtime implementation; update documentation and decisions with each shipped slice.

## Capabilities

### New Capabilities

- `test-quality-policy`: Configurable coverage and effectiveness review.
- `test-lifecycle`: Maintenance of tests through behavior changes and criterion retirement.

### Modified Capabilities

None. This repository has no existing native OpenSpec capability specs. Accepted decisions and the alpha evidence contract remain the baseline.

## Impact

Likely implementation surfaces: `src/core.ts`, `src/ac.ts`, `adapters/node-test.mjs`, delivery/all instructions, tests, guides, and report compatibility. This stage adds planning artifacts only.

See [Decision 017: Separate test coverage, effectiveness, and lifecycle review](../../../docs/decisions/017-test-quality-and-lifecycle.md), the [draft design](design.md), and the [trial and implementation tasks](tasks.md). Detailed defaults remain proposed until reviewed.
