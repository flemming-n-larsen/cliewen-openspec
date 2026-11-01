---
type: reference
---
# Test quality and lifecycle

These checks are available in the development source for `0.2.0-alpha.1`, not the published 0.1 alpha. They assess case declarations and review records. You still review whether assertions prove the intended behavior.

## Choose the checks your project needs

Coverage, effectiveness, and lifecycle each have an independent mode: `off`, `review` (the default), or `enforce`. Review produces warnings; enforce makes incomplete or invalid records blocking and requires evidence enabled. See [configuration](../configuration.md#test-quality-and-lifecycle) for defaults and overrides.

Add case tags to Node tests, alongside their existing scenario and test type:

```js
test('parses one [COUNT-001] [Test-type: Unit] [Case: ordinary] [Coverage: positive]', () => {
  assert.equal(count('1'), 1);
});
```

Each case needs a unique kebab-case ID within its scenario and one category: `positive`, `negative`, or `boundary`. Passing distinct cases count toward configured minima. Retries, skipped tests, manual results, wrong test types, and stale evidence do not count. Missing or ambiguous tags remain visible in the report; review mode does not stop collection because of optional metadata.

## Record what you reviewed

For a change named `add-count`, author `.cliewen-openspec/reviews/change-add-count.yaml`. For permanent specs, use `.cliewen-openspec/reviews/specs.yaml`. These are project documents, preserved by update and uninstall.

The record contains `version: 1`, matching `scope` (`{change: add-count}` or `{specs: true}`), a full Git `baseline` commit, an `inputs` mapping, and `effectiveness`, `lifecycle`, and `exceptions` lists. Unknown fields are rejected. The baseline must be available locally and an ancestor of HEAD.

Inputs map inspected paths to SHA-256 digests of Git blob bytes. Include configuration, assessed specs, change tasks when present, tests, implementation, and relevant helpers or dependency files. Use `null` for an inspected file removed by the change. Exclude the review record itself.

Lifecycle comparison reads the permanent spec set as well as the change's deltas, so include all current permanent spec files when that policy is active.

To calculate a digest, stage the intended files, then run this in your project, replacing `src/count.mjs` with an inspected path:

```sh
git add .
node --input-type=module -e 'import {execFileSync} from "node:child_process"; import {createHash} from "node:crypto"; console.log(createHash("sha256").update(execFileSync("git", ["show", ":src/count.mjs"])).digest("hex"));'
```

After authoring the record, commit project inputs, recollect execution evidence, and run `check` as usual. Changed declared inputs invalidate the review. Undeclared dependencies can escape this check, so review dependency completeness. Every commit still requires fresh execution evidence, including edits to review prose.

### Assertion effectiveness

Each assessment identifies `scenario`, `cases`, `testFiles`, `sourceFiles`, `method` (`controlled-fault` or `tdd`), `assertion`, `defect`, `command` (an argument list), `observation`, `failureKind`, and `status`.

Only `failureKind: behavior` with `status: reviewed` satisfies the obligation. Setup and unrelated failures do not demonstrate assertion effectiveness. Referenced test/source files must have inspected input digests; case IDs must exist in the report. One relevant experiment can cover several cases. Commands are recorded evidence and are never executed by `check`.

### Test maintenance and retirement

Lifecycle entries identify `scenario`, `change` (`unchanged`, `modified`, or `retired`), `reason`, `status`, and affected `tests`. Each test declares `file`, its exact `test` name, `action` (`retain`, `update`, `remap`, or `remove`), and `remainingScenarios`. Remapping also needs `replacementScenarios` with passing evidence.

Retirement needs `retirement: {status: accepted, source: PATH}` pointing to an inspected document recording agreement. A missing criterion alone never authorizes test removal. Removing a shared test while it declares active obligations is rejected. Retain or remap those assertions instead. Out-of-scope retained obligations require review and verification with the full suite and permanent evidence; a change-scoped report does not prove their execution individually.

The checker projects added, modified, and removed requirement blocks against permanent specs, including removal blocks without scenario text. Requirement renames currently produce an unresolved-lifecycle finding; use review mode until rename projection is supported. Refactoring still needs a reviewed disposition or scoped exception for affected unchanged criteria. Review whether the impact analysis found all affected tests.

For delivery refactoring with no behavior delta, native `skip_specs: true` selects permanent scenarios for scoped execution evidence and lifecycle checks. Keep the change free of product delta files. This preserves test obligations without inventing new requirements.

### Scoped exceptions

Exceptions declare `policy`, `scenario`, `reason`, and `status: reviewed`. Coverage exceptions also name `category`. They waive only that category minimum or the named scenario's effectiveness/lifecycle review obligation. Duplicate or unknown references are invalid. Exceptions cannot waive explicit retirement, removal of active assertions, failed execution, stale results, installation checks, or TDD checks.

## Resolve findings

| Finding | Action |
|---|---|
| `coverage-metadata-missing` / `coverage-case-invalid` | Correct tags and recollect results |
| `coverage-minimum-unmet` | Add meaningful cases or review a scoped exception |
| `test-review-missing` / `test-review-invalid` | Author or correct the record and commit it |
| `test-review-scope-mismatch` | Use the record matching the command |
| `test-review-stale` | Reinspect changed inputs and update their digests |
| `effectiveness-unreviewed` | Review a relevant failure or a justified exception |
| `lifecycle-unresolved` / `retirement-unaccepted` | Explain affected tests and establish retirement agreement |
| `active-test-removal` | Preserve or remap active assertions |

After archive, refresh the permanent-spec review and its input paths before claiming enforced permanent checks. Recollect evidence after committing it. Discovery-only and genuine no-delivery combined changes do not require product-quality records. A reviewed status records a claim; it cannot authenticate who approved it.
