---
type: testing
---
# Test quality and lifecycle design trial

## Scope and reproduction

On November 1, 2026, `node scripts/trial-test-quality.mjs` completed 18 real Node test executions and 21 candidate policy checks on Windows with Node v24.0.0. All expected outcomes matched, including deliberately failing runs, and the product fixture was restored after each execution. The command creates a new temporary fixture and writes source snapshots, hashes, test commands, exit codes, and raw output to a timestamped JSON file under ignored `.tmp/`.

The observed run is `.tmp/test-quality-1793544143314.json`. This is local experiment evidence, not a committed release report. The tracked script reproduces the experiment. The working checkout was uncommitted; these observations do not certify a released package or a clean candidate revision.

## Observations

| Trial | Observed control and defect behavior | Design implication |
|---|---|---|
| Missing negative case | Positive-only tests passed both strict and malformed-input-accepting implementations; adding a rejection assertion detected the defect | Positive execution alone cannot establish negative coverage |
| Ineffective assertion | A number-type assertion passed an implementation returning the wrong number; exact equality failed it | Passing tests and category labels cannot establish assertion quality |
| Changed behavior | Accepting zero broke the old rejection assertion; the updated assertion passed the new behavior and rejected the old implementation | Verify updated tests against both intended behavior and a relevant counterexample |
| Retired upper limit | The obsolete upper-limit assertion failed after removing the limit; retained shared assertions passed and still caught a malformed-input defect | Retire only obsolete obligations and preserve active assertions |

An unrelated missing-import run also failed. Its output shows why a nonzero exit code alone cannot establish assertion effectiveness. A behavior-preserving refactor passed unchanged assertions.

The candidate evaluator rejected duplicate case identities even when categories differed, accepted distinct positive identities, and excluded skipped, pending, manual, failed, stale, and type-inconsistent records from counts. It exercised off/review/enforce outcomes and evidence-disabled combinations.

## Limits and remaining work

A follow-up run of `node scripts/trial-quality-compatibility.mjs` completed nine checks against the actual alpha checker on Windows with Node v24.0.0. The raw record is `.tmp/quality-compatibility-1793547753988.json`. Build the package with `npm run build` before rerunning it.

The current parser accepts an original version-1 report and additive `caseId`/`coverage` fields. It still rejects duplicate scenario/test names even when case IDs differ, failed tests, stale evidence, missing test types, and report version 2. Future configuration keys remain rejected. Evidence opt-out still permits a missing report. This supports extending version 1 additively while retaining existing validation; accepting additional fields does not mean the alpha checks their meaning.

Candidate policy checks in the first script exercise a small experimental model. The follow-up establishes the existing parser's behavior, but future-policy migration is unimplemented. Neither script validates accepted retirement authority, exception records, review freshness, or completeness of impact analysis. Those checks and exact record formats remain outstanding in [the change tasks](../../openspec/changes/test-quality-and-lifecycle/tasks.md).

Distinct identities cannot prove meaningfully distinct cases. The lifecycle experiment demonstrates test behavior after a controlled change; deciding that the requirement may be retired remains a separate review. No independent fresh-agent trial was run.
