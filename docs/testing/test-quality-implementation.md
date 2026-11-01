---
type: testing
---
# Test quality implementation checks

## Scope

Development source for `0.2.0-alpha.1` implements independent coverage, effectiveness, and lifecycle policies under [Decision 017: Separate test coverage, effectiveness, and lifecycle review](../decisions/017-test-quality-and-lifecycle.md). The published 0.1 alpha is unchanged. These observations were collected on Windows with Node v24.0.0 from an uncommitted implementation checkout on November 1, 2026.

## Results

| Check | Observed result |
|---|---|
| `npm test` | 66 passed, zero failed or skipped; includes packed installation, update, delivery/discovery/combined, TDD, and documentation walkthrough tests |
| Final focused quality and adapter checks | Ten passed after refining projection and retirement-only collection |
| `npm run docs:build` | 13 pages, 457 local links, three diagrams, and documented defaults checked |
| `npm run docs:check` | 13 pages passed desktop/mobile, search, appearance, keyboard, rendering, and clipboard checks |
| Controlled consumer faults | 18 real test executions, with expected passes/failures and restored fixtures |
| Candidate policy and record experiments | 21 policy checks and 26 record checks completed; these remain prototypes |
| Current product compatibility probes | Nine completed, including legacy reports, optional case fields, duplicate identities, execution failures, and evidence opt-out |
| Evaluation manifest | Three shipped schemas covered; new quality/retirement agent cases remain planned |
| OpenSpec strict validation | `test-quality-and-lifecycle` valid |

The final focused checks ran with `node --test test/quality.test.mjs test/adapter-scope.test.mjs` after building. Product tests exercise valid and invalid configuration, independent modes, distinct cases, scoped exceptions, assertion-review declarations, changed input digests, removed requirement blocks without scenario text, omitted scenarios in replacement requirements, shared active obligations, changed behavior, refactoring, and optional/ambiguous adapter tags. Delivery refactoring with native `skip_specs: true` selects permanent scenarios rather than discarding verification obligations.

The packed workflow also exercises upgrading a manifest declared as `0.1.0-alpha.1`, preserving project state and checking conflict handling. This is a deterministic ownership fixture, not a trial against every historical alpha build.

## Test effectiveness

`node scripts/trial-quality-mutants.mjs` copied compiled files, schema sources, and the quality regression tests into an isolated directory under `.tmp/`. It then introduced two defects separately:

| Defect | Observed regression |
|---|---|
| Remove coverage minima | The coverage test failed at its missing-category expectation |
| Permit removal of active shared assertions | The lifecycle test failed at its active-test-removal expectation |

Both test processes exited 1 for the expected assertion failure, and the compiled copies were restored after each experiment. Raw stdout/stderr, source hashes, mutant hashes, and outcomes are in `.tmp/quality-mutants-6PY2T9/results.json`. The original regression tests passed before the experiment. These two faults demonstrate bounded effectiveness, not exhaustive mutation coverage.

Other local records are `.tmp/quality-regression.log`, `.tmp/test-quality-1793558049151.json`, `.tmp/quality-records-1793558052594.json`, and `.tmp/quality-compatibility-1793558052701.json`. The tracked scripts reproduce their respective experiments after `npm run build`. The compatibility probe now tests the development parser's accepted policy configuration; the original alpha's rejection remains a historical observation in [the design trial](test-quality-trial.md).

## Limits and follow-up

Requirement-rename projection is unsupported and produces an unresolved-lifecycle finding. Review declarations do not authenticate approval, establish complete dependency/impact analysis, or prove semantic assertion quality. Retained obligations outside a change-scoped report need review and full-suite/permanent evidence. The checker does not execute recorded commands or delete tests.

Fresh-agent quality/retirement cases, Linux checks for this implementation, a new human walkthrough, final clean-revision release evidence, and release acceptance remain outstanding. The OpenSpec change remains active; this record does not authorize archive or npm publication.
