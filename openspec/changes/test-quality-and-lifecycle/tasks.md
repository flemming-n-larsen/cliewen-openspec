# Tasks

## 1. Review and trial gate

- [x] 1.1 Record the approved direction in Decision 017 and prepare the proposal; detailed defaults and formats require the review in task 1.5.
- [x] 1.2 Trial a missing negative test, ineffective assertion, changed expected behavior, and retired criterion in disposable fixtures. Include valid controls; record actual observations and failure causes. See [the design trial](../../../docs/testing/test-quality-trial.md): 18 executions and 21 candidate policy checks; product compatibility and record validation remain outstanding.
- [x] 1.3 Exercise duplicates, multiple distinct cases, shared-test retirement, refactoring, independent policy modes, evidence disabled, and old report compatibility. Candidate checks cover future policy rules; nine checks against the existing product establish current parser behavior. See the trial report for limits.
- [x] 1.4 Revise the design and Decision 017 from findings. Define the proposed record fields, identities, freshness inputs, diagnostics, and report compatibility in [the record contract](record-contract.md).
- [x] 1.5 Review the concrete policy defaults and record contract and obtain agreement before runtime implementation. The user's instruction to continue following the design approval request authorized implementation. Declared-input and post-archive review limits remain documented.

## 2. Implementation after agreement

- [x] 2.1 Add configuration and diagnostics with positive/negative tests; run `npm run build` and `node --test test/core.test.mjs`.
- [x] 2.2 Add case metadata and coverage checks with adapter and scoped-evidence regressions; build and run `node --test test/adapter-scope.test.mjs test/core.test.mjs`.
- [x] 2.3 Add effectiveness/lifecycle records, exceptions, and freshness checks. Test unrelated failures, invalid retirement, active shared obligations, and invalidated review inputs; run relevant package tests.
- [x] 2.4 Update delivery/all guidance and examples while preserving discovery-only behavior; run `npm test`.

## 3. Documentation and acceptance

- [x] 3.1 Update configuration, evidence compatibility, workflow guidance, troubleshooting, decisions, and evaluation cases with each behavior slice. Preserve executable examples and state semantic limits.
- [x] 3.2 Run `npm run docs:build`, `npm run docs:check`, and `npm test`; record results and limitations. Consumer controlled-fault trials were repeated, and two isolated checker mutants were detected by product regression tests with restoration verified. See [implementation checks](../../../docs/testing/test-quality-implementation.md).
- [ ] 3.3 Review acceptance scenarios against evidence, update decision status following agreement, and update roadmap progress. Archive only after implementation and authorized acceptance.
