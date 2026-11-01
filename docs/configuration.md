---
type: reference
---
# Project configuration

Cliewen reads project settings from `.cliewen-openspec/config.yaml`.

This reference describes the development source for `0.2.0-alpha.1`. The published `0.1.0-alpha.1` does not accept the `quality` or `lifecycle` settings below. Use that package's bundled reference when working with the published alpha.

## Full defaults

This is the complete configuration written by `init`. Omitted fields use these values; unknown settings and invalid values fail validation. Changes apply when the next operation reads the config. They do not rewrite existing proposals or task lists.

<!-- defaults -->
```yaml
docsRoot: docs
features:
  documentation: true
  decisions: true
  mermaid: true
  planning: true
  review: true
  evidence: true
evidence:
  report: .cliewen-openspec/evidence.json
ac:
  capabilities: {}
  padding: 3
testing:
  placement: per-task
  approach: flexible
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
  types:
    Unit:
      description: Isolated behavior without external dependencies
    Integration:
      description: Interaction between components or dependencies
    E2E:
      description: Complete user or system workflow
```

## Test quality and lifecycle

Each of `testing.quality.coverage.mode`, `testing.quality.effectiveness.mode`, and `testing.lifecycle.mode` accepts `off`, `review`, or `enforce`. The default is `review`: incomplete assessments produce warnings. `enforce` makes missing or invalid records blocking and requires `features.evidence: true`. `off` disables that policy's checks and guidance. Evidence opt-out leaves review guidance available but reports that execution-backed assessment is unavailable.

Coverage counts distinct passed cases by scenario and category. Configure nonnegative safe-integer minima under `testing.quality.coverage.minimumCases`; omitted categories retain their defaults. One positive and one negative case are required by default, with relevant boundary cases assessed during review. A reviewed exception can waive a category minimum for a particular scenario.

For example, to enforce coverage while leaving other policies advisory:

```yaml
testing:
  quality:
    coverage:
      mode: enforce
      minimumCases:
        positive: 2
```

This requires two positive and one negative case per scenario. It does not count retries or prove cases are meaningfully different. See [test quality and lifecycle](testing/test-quality.md) for tagging tests, writing review records, and handling exceptions.

## Documentation and features

| Setting | Default | Effect |
|---|---|---|
| `docsRoot` | `docs` | Root for durable explanations; init creates an entry README if absent |
| `features.documentation` | `true` | Guidance to assess and maintain affected documentation |
| `features.decisions` | `true` | Guidance for considering and recording durable decisions |
| `features.mermaid` | `true` | Guidance to use embedded Mermaid where useful |
| `features.planning` | `true` | Makes optional planning guidance available; does not require a plan |
| `features.review` | `true` | Makes review guidance available; a separate reviewer remains optional |
| `features.evidence` | `true` | Scenario-ID and execution-report checks |
| `evidence.report` | `.cliewen-openspec/evidence.json` | Repository-local path to the execution report |

All paths must stay inside the project; absolute paths, parent traversal, and symlink components are rejected. A custom evidence report path must be Git-ignored and untracked before the reference adapter can write it. New installations ignore the default `evidence.json` report, `transaction.json`, and local `tdd/` history in `.cliewen-openspec/.gitignore`. Existing ignore files are preserved.

## Test types

`testing.types` defaults to `Unit`, `Integration`, and `E2E`, with the descriptions shown above. A project-defined mapping replaces the entire default set. Names are case-sensitive, may contain spaces, and must be nonempty, single-line names without surrounding whitespace or square brackets. Each entry requires a nonempty `description`; an empty mapping is invalid.

For example, a project that calls its tests Component and System can use:

```yaml
testing:
  types:
    Component:
      description: One component tested in process with controlled dependencies
    System:
      description: A complete workflow against a deployed system
```

Each scenario needs exactly one `Test-type: Component` line beneath its heading. With the Node adapter, give each mapped test a title such as `exports rows [EXPORT-001] [Test-type: Component]`. Tasks should name the concrete test, type, and verification boundary. The checker requires evidence `testType` to match the scenario's declared type exactly; it does not assume one type substitutes for another. Task descriptions and the actual quality of the test boundary still require review.

For existing projects, add types to scenarios and test titles, commit the inputs, then regenerate evidence. Older reports without `testType` fail the check and are not automatically upgraded. Evidence opt-out skips these checks. Testing types do not change per-task placement or TDD ordering.

The alpha supplies guidance for documentation, decisions, Mermaid, planning, and review. It does not structurally validate those documents or independently enforce agent behavior. Disabling a facility preserves authored files. Evidence opt-out skips product evidence checks; installation, registry, and explicitly selected TDD completion checks still run.

For example, to use a different documentation root and turn off Mermaid guidance:

```yaml
docsRoot: project-docs
features:
  mermaid: false
```

Other fields retain their defaults. The YAML objects `features`, `ac`, and `testing` support partial settings. If you provide `evidence`, include its `report` string. Changing `docsRoot` does not move existing files. The schema artifact graph is selected by the OpenSpec schema and is not rewritten by feature flags.

## Testing and IDs at a glance

```yaml
ac:
  padding: 3
  capabilities: {}
testing:
  placement: per-task
  approach: flexible
  types:
    Unit:
      description: Isolated behavior without external dependencies
    Integration:
      description: Interaction between components or dependencies
    E2E:
      description: Complete user or system workflow
```

## Acceptance criterion IDs

An ID consists of an uppercase prefix, a hyphen, and a positive sequence number. Register a prefix for each capability before allocating IDs:

```yaml
ac:
  padding: 3
  capabilities:
    csv-export: EXP
    account-management: ACC
    support: SUP
```

Capability names match their directories under `openspec/specs/` or the change's `specs/`. A new capability can be registered before its spec directory exists. There is no global prefix or automatic prefix selection.

Choose a short, recognizable capability or domain name with your team. `EXPORT` and `EXP` are equally valid; Cliewen does not infer either from the change title. Reuse the chosen prefix for that capability across changes. The prefix must start with an uppercase letter and contain only uppercase letters and digits.

```sh
cliewen-openspec ac next --capability csv-export  # EXP-001 initially
cliewen-openspec ac next --capability support     # SUP-001 initially
cliewen-openspec ac next EXP                      # Same registered sequence as csv-export
```

`padding` is the minimum number of digits, from 1 to 12. For example, 1 produces `EXP-1`, 3 produces `EXP-001`, and 4 produces `EXP-0001`. Numbers grow beyond the minimum width without truncation. The separator is always a hyphen; arbitrary ID templates are not supported.

Each capability owns one numeric sequence. The allocator consults the committed `.cliewen-openspec/ac-registry.json` and existing OpenSpec Markdown, including active and archived changes. It never reclaims allocated numbers. Changing padding continues the same sequence and does not rewrite existing IDs. Commit the registry together with config and specs. Parallel branches still need collision resolution; this allocator supports sequential work rather than distributed allocation.

### Renaming a prefix

Use the command rather than editing an established mapping directly:

```sh
cliewen-openspec ac rename-prefix csv-export EXPORT
cliewen-openspec ac next --capability csv-export
```

If the highest allocated number was `EXP-017`, the next ID is `EXPORT-018`. Existing scenarios and tests keep their `EXP-...` references. The command updates config and registry in one recoverable transaction, preserving YAML comments. Config and registry mismatches block allocation and are reported by `check`, including when evidence is disabled. Restore the registered prefix in config before running the rename command if you edited it manually.

Current and historical prefixes remain reserved to their original capability, even if its config mapping is removed. Allocation using a retired prefix is rejected with guidance to use the current capability. Previously used prefixes cannot be reassigned, including renaming back to a historical prefix. The command also rejects target prefixes already appearing in OpenSpec documents.

The registry records each capability's current prefix, previous prefixes, and highest allocated number. Existing flat alpha registries are adopted on the next allocation or rename: first map each used prefix to its original capability. Unmapped legacy counters remain reserved; they are never silently discarded or assigned to new capabilities. `check` validates this state without writing it. Removing the registry loses allocation history, so retain it in version control.

The earlier experimental `ac.prefix` setting is no longer supported. Replace it with `ac.capabilities` before using this version. Existing bracketed IDs remain valid evidence references regardless of prefix history.

## Test placement

`testing.placement` controls the schema's planning and implementation guidance:

- `per-task` (default): Each implementation task includes its relevant tests, a test command, and a completion check. Implement a small slice, run its tests, fix failures, and then continue to the next task. Documentation-only tasks can use an appropriate validation check. This provides fast feedback throughout implementation.
- `end-of-change`: Plan tests in a final verification section, with explicit links to the implementation tasks they cover.

Both modes retain final regression testing and revision-bound evidence collection. Per-task test runs provide immediate feedback; the evidence adapter records results for the final committed inputs. Disabling evidence does not disable ordinary task-level testing.

In flexible mode, placement is guidance supplied by the installed schema and task template. Selecting TDD also enables the completion checks below. Configuration changes do not rewrite existing task lists; revise the task plan when changing this setting.

## Test-driven development

Test placement and test-driven development (TDD) are separate choices. Enable TDD with:

```yaml
testing:
  placement: per-task
  approach: tdd
```

`approach: flexible` is the default and permits tests before or after implementation within the selected placement. Existing config files that omit `approach` keep this behavior. `approach: tdd` requires `placement: per-task`; contradictory settings are rejected.

With TDD, each implementation task contains one red-green-refactor cycle:

1. Write a focused test before implementing the behavior. Run it and observe failure for the intended missing behavior. Setup, import, and syntax errors do not establish this red phase.
2. Implement the minimum behavior needed for the test to pass and run it again.
3. Refactor with relevant tests remaining green, then continue to the next task.

For example: "Add quotation-mark escaping: write and run the tagged test first and confirm the expected failure; implement escaping until the test passes; refactor and rerun the relevant tests." Record commands and observed red/green outcomes in task completion notes. If a new test already passes against existing code, report that honestly rather than claiming an observed red phase. Documentation-only work uses appropriate validation checks.

With TDD selected, `check --change NAME` also requires task metadata and recorded execution history. This applies to delivery and the delivery outcome of `cliewen-all`, including when `features.evidence` is false. Discovery and combined no-delivery closure do not require delivery history. Flexible mode keeps its existing behavior.

### Describe each task

Add one `yaml cliewen-tasks` fenced block to the change's `tasks.md`. Every checkbox needs a unique numeric ID and a matching entry. Keep the normal task text and completion check; the block supplies the machine-readable verification details.

````markdown
- [ ] 1.1 Add CSV quoting and verify quotation marks at the Unit function boundary.

```yaml cliewen-tasks
version: 1
tasks:
  "1.1":
    method: tdd
    command: [node, --test, test/export.test.mjs]
    tests: [test/export.test.mjs]
    implementation: [export.mjs]
```
````

`command` is an executable followed by its arguments, run from your project root without a shell. Use explicit project-relative file paths, including files that will be created. Globs and directories are not file lists. Test and implementation lists must be distinct and together cover the task's verification boundary. Review that coverage; Cliewen cannot discover omitted production files or infer which assertions a command runs.

Choose a method for each task:

| Method | Recorded sequence | When to use it |
|---|---|---|
| `tdd` | start → red → green | New or changed behavior; tests change before red while implementation stays unchanged |
| `characterization` | start → baseline → green | Add coverage for existing behavior; baseline already passes against unchanged implementation |
| `refactor` | start → baseline → green | Existing tests pass before and after refactoring; test files stay unchanged |
| `verification` | start → verify | Work with another suitable completion check, such as documentation links or a build |

Every method uses `command`, `tests`, and `implementation`. TDD requires both file lists to be nonempty; characterization and refactor require test files. Verification can use `tests: []` and list documents under `implementation`. Every method other than `tdd` requires a nonempty `reason` explaining the departure. For example, a documentation task can use `method: verification`, `reason: "Only the command reference changes; build the docs and check links."`, and its documentation build command. Review reasons with the task plan. A configuration or tooling change that changes behavior still needs a behavior test.

### Record actual runs

Run these commands from the adopting project's root. Start before changing the task's declared files:

```sh
npx --no-install cliewen-openspec tdd start --change add-csv-export --task 1.1
```

Write the focused test, then record the red run using the exact command argument list from the task:

```sh
npx --no-install cliewen-openspec tdd run --change add-csv-export --task 1.1 --phase red --reason "Quotation marks are not escaped yet" -- node --test test/export.test.mjs
```

The recorder returns the test command's exit code. A red run should exit nonzero. Inspect the captured failure before implementing: syntax, import, setup, or wrong-expectation failures do not establish missing behavior. `--reason` records your explanation; it does not validate it.

Implement the behavior and record green:

```sh
npx --no-install cliewen-openspec tdd run --change add-csv-export --task 1.1 --phase green -- node --test test/export.test.mjs
```

Keep test files unchanged between red and green. After refactoring production code, record green again. Failed green attempts are retained; the last run must pass. Changing tests requires another start and verification cycle. Do not manufacture a red phase for behavior already implemented; choose the honest method and explain it in the reviewed plan.

For characterization or refactoring, use `--phase baseline` for the passing run before production changes, then `--phase green`. For a verification exception, use `--phase verify` after the work. Each task begins with `tdd start`. If its definition changes, start a new cycle; the recorder appends history and preserves earlier attempts.

After the task's actual verification succeeds, mark its checkbox complete. Once all tasks are complete, run:

```sh
npx --no-install cliewen-openspec check --change add-csv-export --json
```

Keep final evidence collection and this completion check outside numbered task checkboxes and recorded task commands. A final verification task should run the actual regression suite or documentation check. Recording `check` itself would make it assess its own unfinished history while a recorder lock exists.

### Completion checks and limits

The recorder appends JSON events to `.cliewen-openspec/tdd/add-csv-export.jsonl`. Events contain task-definition and file hashes, command arguments, output, exit code, and recording time. It compares snapshots before and after each command; commands that change declared inputs cannot establish the required sequence. It blocks simultaneous recording for the same change. Later tasks can edit shared files if their recorded starting states continue from the earlier task's recorded state.

Missing metadata/history, unchecked tasks, stale definitions/files, malformed history, and incomplete or invalid ordering produce errors. A final passing product evidence report cannot replace this history. `check` reads it without running tests or writing files. Without `--change`, permanent-spec checks report that TDD ordering was not assessed; they do not establish task completion after archive.

History is local verification data, separate from the final revision-bound evidence report. Keep it available until completion review; CI needs the same history as an artifact if it performs this check. Existing installations must add `tdd/` to `.cliewen-openspec/.gitignore` before recording. Update preserves that file. Review captured project output before sharing it; do not hand-edit events or discard failures to obtain a pass.

The history is not tamper-proof and the recorder does not restrict writes through other tools. Review the actual failure cause, assertions, declared file coverage, and exception reasons. These checks establish consistency of the captured sequence, not a guarantee that every edit was observed. Stronger write control remains planned.

Final regression and clean committed-revision evidence collection remain required when evidence is enabled. Finish task notes before committing and collecting evidence. Install the updated package and refresh installed schemas with `update`; older authored task lists need explicit metadata and honest new verification, not reconstructed historical claims.

## Decision filenames

New projects use `NNN-short-title.md`, such as `001-use-a-shared-base.md`, for new Decision Records. The sequence starts at 1, padded to a minimum of three digits for filename sorting. Numbers above 999 grow naturally. This is a naming convention in the schema guidance, not a configurable setting or an implemented decision allocator.

Existing filenames and paths are stable public addresses: never rename, move, or renumber documents to normalize naming, titles, categories, or padding. External systems such as GitHub may link to them. Edit content and metadata in place, even when a title or category changes. Existing projects retain conventions such as `ADR-059-title.md` and `PDR-074-title.md`; read their allocation rules and use their existing ID authority rather than starting a competing counter. These conventions are not yet configurable in the alpha. The project owner explicitly authorized normalizing this repository's first two decision filenames to three digits; that local exception does not authorize renaming documents in other projects.

## Existing alpha installations

Install the new package, then use [update](guide/updating.md) to preview and refresh owned schema files and templates. Development source accepts `0.2.0-alpha.1` and `0.1.0-alpha.1` manifests; the published 0.1 package accepts its own manifests only. Configuration, registry, authored artifacts, and document paths are preserved. Adding config settings alone does not replace installed instructions. Other manifest versions and general config/registry migrations are not supported automatically.
