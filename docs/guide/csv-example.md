---
type: guide
---
# CSV example

The [first-change guide](getting-started.md) uses these files. The documentation test installs the packed alpha in a clean repository, copies the same files, runs the tests, collects evidence, and archives the change. This checks the reference workflow. It does not evaluate an agent's ability to write the code or follow TDD.

## API and scope

{{include:docs/examples/csv/README.md}}

## Implementation

The function builds the header and data rows in column order. One field encoder handles both headers and values.

{{include:docs/examples/csv/export.mjs}}

## Tests

Each top-level test title has one bracketed AC ID. The reference adapter uses that ID to match execution results to scenarios. Assertions use exact output, including CRLF separators and escaped quotation marks.

{{include:docs/examples/csv/test/export.test.mjs}}

## Try TDD with an agent

Use a fresh pilot and set `testing.approach: tdd` before asking the agent to plan the change. Keep `testing.placement: per-task`. Ask it to implement the reviewed tasks using the [task metadata and TDD recorder](../configuration.md#test-driven-development), starting capture before task edits. Do not copy the finished implementation for a TDD trial.

Check that the first failure is an assertion about missing behavior, followed by a passing run after implementation. Some later boundary tests may already pass; record that outcome without inventing a red phase. A final green report alone cannot establish the order of earlier work.
