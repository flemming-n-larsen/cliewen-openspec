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

The record experiment `node scripts/trial-quality-records.mjs` completed 26 candidate checks, recorded in `.tmp/quality-records-1793548241545.json`. Checks cover matching and mismatched exception scopes, proposed/blank/stale exceptions, preservation of execution failures, accepted and unaccepted retirement declarations, shared-test removal, retained assertions, input changes/deletions, and ineffective failure classifications.

One deliberate control confirms a limit: changing an undeclared helper does not invalidate a hash-bound review. Another confirms that editing review prose does not cause a self-hash cycle. These findings informed the [record contract](../../openspec/changes/test-quality-and-lifecycle/record-contract.md), which requires relevant inputs and explicit review of dependency completeness.

A follow-up run of `node scripts/trial-quality-compatibility.mjs` completed nine checks against the actual alpha checker on Windows with Node v24.0.0. The raw record is `.tmp/quality-compatibility-1793547753988.json`. Build the package with `npm run build` before rerunning it.

The current parser accepts an original version-1 report and additive `caseId`/`coverage` fields. It still rejects duplicate scenario/test names even when case IDs differ, failed tests, stale evidence, missing test types, and report version 2. Future configuration keys remain rejected. Evidence opt-out still permits a missing report. This supports extending version 1 additively while retaining existing validation; accepting additional fields does not mean the alpha checks their meaning.

Candidate policy and record checks exercise small experimental models. The compatibility script establishes the existing parser's behavior; future-policy migration remains unimplemented. The record experiment checks selected declaration and hash rules, not a complete YAML validator or authenticated retirement authority. Actual Git-input capture, required-path completeness, and full contract validation remain implementation work in [the change tasks](../../openspec/changes/test-quality-and-lifecycle/tasks.md).

Distinct identities cannot prove meaningfully distinct cases. The lifecycle experiment demonstrates test behavior after a controlled change; deciding that the requirement may be retired remains a separate review. No independent fresh-agent trial was run.
