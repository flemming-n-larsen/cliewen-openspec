---
type: example
---
# CSV export example

```js
import { exportCsv } from './export.mjs';

exportCsv([{ name: 'Ada', city: 'London, UK' }], ['city', 'name']);
// 'city,name\r\n"London, UK",Ada\r\n'
```

Pass an array of records with string-valued selected fields and a nonempty explicit column list. Columns supply header labels and field order. Output uses CRLF row separators and ends in CRLF. Fields containing commas, quotation marks, CR, or LF are quoted, and embedded quotes are doubled. Empty input produces only the escaped header. Missing fields, null values, invalid columns, and nonstring values are outside this example's specified input scope.

Run `node --test test/export.test.mjs` to verify the six tagged scenarios. Review assertions before collecting evidence or archiving the change.
