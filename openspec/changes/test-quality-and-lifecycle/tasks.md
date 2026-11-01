# Tasks

## 1. Review and trial gate

- [ ] 1.1 Review the proposal, policy defaults, exceptions, and Decision 017.
- [x] 1.2 Trial a missing negative test, ineffective assertion, changed expected behavior, and retired criterion in disposable fixtures. Include valid controls; record actual observations and failure causes. See [the design trial](../../../docs/testing/test-quality-trial.md): 18 executions and 21 candidate policy checks; product compatibility and record validation remain outstanding.
- [ ] 1.3 Exercise duplicates, multiple distinct cases, shared-test retirement, refactoring, independent policy modes, evidence disabled, and old report compatibility. Separate mechanical findings from semantic review.
- [ ] 1.4 Revise the design and Decision 017 from findings. Define exact record schemas, identities, freshness inputs, diagnostics, and report compatibility; obtain agreement before runtime implementation.

## 2. Implementation after agreement

- [ ] 2.1 Add configuration and diagnostics with positive/negative tests; run `npm run build` and `node --test test/core.test.mjs`.
- [ ] 2.2 Add case metadata and coverage checks with adapter and scoped-evidence regressions; build and run `node --test test/adapter-scope.test.mjs test/core.test.mjs`.
- [ ] 2.3 Add effectiveness/lifecycle records, exceptions, and freshness checks. Test unrelated failures, invalid retirement, active shared obligations, and invalidated review inputs; run relevant package tests.
- [ ] 2.4 Update delivery/all guidance and examples while preserving discovery-only behavior; run `npm test`.

## 3. Documentation and acceptance

- [ ] 3.1 Update configuration, evidence compatibility, workflow guidance, troubleshooting, decisions, and evaluation cases with each behavior slice. Preserve executable examples and state semantic limits.
- [ ] 3.2 Run `npm run docs:build`, `npm run docs:check`, and `npm test`; record results and limitations. Repeat controlled-fault trials against implementation and verify fixture restoration.
- [ ] 3.3 Review acceptance scenarios against evidence, update decision status following agreement, and update roadmap progress. Archive only after implementation and authorized acceptance.
