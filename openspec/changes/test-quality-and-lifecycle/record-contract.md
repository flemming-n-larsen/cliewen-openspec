# Test review record contract

This contract is implemented in the unreleased `0.2.0-alpha.1` source. The published 0.1 alpha does not implement it. [The design](design.md) owns rationale; [the user reference](../../../docs/testing/test-quality.md) describes usage and current limits. Trial scripts remain experiments, separate from product checks.

## Execution results

Keep evidence report `version: 1`, scope, runner status, and final-revision rules. Extend each automated result with:

```json
{
  "scenario": "COUNT-001",
  "test": "parses one [COUNT-001] [Test-type: Unit] [Case: ordinary] [Coverage: positive]",
  "testType": "Unit",
  "outcome": "passed",
  "caseId": "ordinary",
  "coverage": "positive"
}
```

`caseId` is a lowercase kebab-case slug, unique within a scenario. `coverage` is exactly `positive`, `negative`, or `boundary`. The Node adapter reads `[Case: SLUG]` and `[Coverage: CATEGORY]` tags. Missing tags omit the corresponding field; multiple tags emit `null` for that field, making ambiguity visible without dropping execution results. Keep malformed single values for policy validation. Optional metadata errors must not make collection fail in review mode. Duplicate scenario/test names remain invalid; distinct IDs cannot legitimize duplicate results. Retries must be collapsed by the adapter, not counted as cases. A duplicated identity is a finding even if outcomes or categories differ.

Case metadata may be absent when coverage is off. Old reports remain usable with new policies off. In review mode, absent metadata warns and cannot satisfy minima; enforce blocks. Invalid metadata cannot increase counts. Existing failures, skipped tests, unknown scenarios, mismatched types, and stale evidence retain their current blocking behavior regardless of exceptions. Manual verification remains separate from automated case counts.

## Authored review record

Use `.cliewen-openspec/reviews/change-NAME.yaml` for `check --change NAME` and `.cliewen-openspec/reviews/specs.yaml` for permanent-spec checks. These are project-authored files, preserved on update, disable, and uninstall. They add no OpenSpec artifact dependency.

Each record has exactly these top-level fields: `version`, `scope`, `baseline`, `inputs`, `effectiveness`, `lifecycle`, and `exceptions`. Reject unknown fields and invalid types. Lists may be empty when their policy has no obligations. Missing records warn in review mode and block in enforce mode; off skips that policy's requirements.

| Field | Contract |
|---|---|
| `version` | Integer `1` |
| `scope` | Exactly `{change: NAME}` or `{specs: true}`, matching the command |
| `baseline` | Full Git commit ID, available locally and an ancestor of checked HEAD; lifecycle compares against it |
| `inputs` | Nonempty mapping of repository-relative file paths to lowercase SHA-256 digests; deleted inspected files use `null` |
| `effectiveness` | List of scenario assessments described below |
| `lifecycle` | List of affected-scenario dispositions described below |
| `exceptions` | List of scoped waivers described below |

Input digests identify Git blob bytes after Git's normal clean filters, not platform-specific checkout bytes. Authors inspect/stage intended inputs before recording digests; final checks compare them with committed HEAD. Never include the review record itself. Existing path confinement and symlink restrictions apply.

At minimum, inputs must include configuration, specs used by the assessment, the change's tasks when present, and referenced test and source files. Reviewers also include relevant helpers and dependency files. The checker verifies required references and every declared digest; it cannot prove all semantic dependencies were declared. A changed declared input, deleted file, or newly present file recorded as absent invalidates the affected record. Updating the record's own prose does not invalidate its own digest. Execution evidence still requires recollection after every commit.

After archive, use the permanent-spec record, update inspected spec paths/digests, and review the scope again before claiming enforced permanent checks. Do not silently reuse a change-scoped record. This conservative re-review is intentional; automatic carryover can be considered separately.

### Effectiveness assessments

Each entry contains `scenario`, nonempty `cases` (case IDs), nonempty `testFiles` and `sourceFiles` (paths covered by inputs), `method` (`controlled-fault` or `tdd`), nonempty `assertion`, nonempty `defect`, a nonempty `command` argument list, nonempty `observation`, `failureKind` (`behavior`, `setup`, or `unrelated`), and `status` (`proposed` or `reviewed`).

Every active scenario in scope requires an assessment covering its counted cases, or a scenario-scoped effectiveness exception. One experiment may cover several cases, provided the reviewer explains its relevance. Only reviewed behavior failures satisfy the obligation. Missing dependencies, syntax errors, and unrelated failures do not. The checker validates the declaration and references; a reviewer establishes whether the observation actually demonstrates the assertion's effectiveness. Command strings are recorded data and are never executed by `check`.

### Lifecycle dispositions

Each entry contains `scenario`, `change` (`unchanged`, `modified`, or `retired`), nonempty `reason`, `status` (`proposed` or `reviewed`), and a `tests` list. Each test entry contains `file`, `test` (exact recorded name), `action` (`retain`, `update`, `remap`, or `remove`), and `remainingScenarios` (unique active IDs). `remap` also requires nonempty `replacementScenarios`.

Retired entries additionally require `retirement: {status: accepted, source: PATH}`. The source is a nonempty repository document present in the inputs, with the accepted change and reason. Recorded acceptance remains a declaration, not authenticated approval.

Compare baseline scenarios and their parent requirement text with the effective target specs (permanent specs with the selected change's added/modified/removed requirement blocks applied, or current permanent specs). Every modified or removed criterion requires a disposition. Requirement renames currently produce an unresolved finding. New scenarios follow coverage and effectiveness rules. For implementation-only delivery changes, native `skip_specs: true` selects permanent scenarios; record affected unchanged criteria, and review the completeness of impact analysis.

A removed criterion without explicit accepted retirement is unresolved. Removing a shared test with nonempty `remainingScenarios` is invalid; retain, split, or remap its active obligations first. Remapped and in-scope remaining obligations need passing execution evidence. Retained obligations outside the command's scope need review, full-suite verification, and permanent evidence; a scoped report does not prove their execution individually. Completely removed test files use `null` in inputs and must exist at the baseline. IDs stay reserved in the current registry; the checker never deletes tests or recycles IDs.

### Exceptions

Each entry contains `policy` (`coverage`, `effectiveness`, or `lifecycle`), `scenario`, nonempty `reason`, and `status` (`proposed` or `reviewed`). Coverage also requires `category`. Other policies forbid a category. Reject duplicate policy/scenario/category keys and unknown scenarios.

Only reviewed, fresh exceptions waive a matching obligation. Coverage exceptions waive just that category minimum. Effectiveness exceptions waive the experiment obligation for one scenario. Lifecycle exceptions waive a missing disposition for an active scenario, such as a documentation-only change; they cannot waive explicit retirement or permit deleting active assertions. No exception suppresses execution, freshness, installation, registry, or TDD failures.

## Findings

Configuration errors and existing product errors keep their current exit behavior. New incomplete/invalid policy findings are warnings in review mode and errors in enforce mode. Off skips that policy; a shared malformed record affects each enabled policy that needs it.

| Code | Meaning / recovery |
|---|---|
| `coverage-metadata-missing` | Recollect with case and category metadata |
| `coverage-case-invalid` | Correct malformed or duplicate case identities/categories |
| `coverage-minimum-unmet` | Add meaningful cases or review a scoped exception |
| `test-review-missing` / `test-review-invalid` | Author or correct the required review record |
| `test-review-scope-mismatch` | Supply the record for the command's actual scope |
| `test-review-stale` | Reinspect changed inputs and update the record |
| `effectiveness-unreviewed` | Review a relevant behavior failure or a scoped exception |
| `lifecycle-unresolved` | Explain affected tests and requirement changes |
| `retirement-unaccepted` | Establish explicit accepted retirement before removing obligations |
| `active-test-removal` | Preserve or remap remaining active assertions |
| `quality-evidence-unavailable` | Enable evidence for execution-backed assessment; review guidance remains available |

Passing record checks still report that semantic sufficiency and approval authenticity require review. Discovery-only and genuine no-delivery combined changes do not require product-quality records; installation, outcome, and registry checks retain their current behavior.
