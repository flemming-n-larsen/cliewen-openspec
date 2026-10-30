# CSV export

## Why

Callers need to export records in a stable column order without losing commas, quotation marks, or line breaks inside fields.

## What Changes

- Add `exportCsv(records, columns)` for string-valued selected fields.
- Include escaped header fields and preserve the explicit column order.
- Cover each behavior with a tagged Node test in its implementation task.

## Capabilities

### New Capabilities

- `csv-export`: Format records as CSV with explicit columns and escaped fields.

### Modified Capabilities

None.

## Impact

Add an ES module and Node tests. No runtime dependency, UI, or storage is needed. Document the API in the project README. No architecture change or new durable Decision Record is needed.
