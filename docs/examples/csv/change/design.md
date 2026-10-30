# CSV export design

## Context

The example exports string-valued fields with a nonempty explicit list of column names. Columns also supply header labels. Missing fields, null values, invalid column lists, and nonstring values are outside the example's specified input scope.

## Approach and Alternatives

Use a pure ES module function and a shared field encoder. Quote fields containing commas, double quotation marks, CR, or LF; double embedded quotes. Use CRLF between rows and a final CRLF terminator. Return the header alone for an empty record list. A join-only formatter cannot preserve special characters; the limited scope does not require a CSV library.

## Durable Decisions

No new Decision Record is needed for this small formatter. Keep the API example in the README.

## Risks and Verification

Each task runs tests for its own behavior and previous slices. Tests assert exact output for EXP-001 through EXP-006, including special characters in headers and values. Final evidence covers the committed inputs; review assertions before archive.
