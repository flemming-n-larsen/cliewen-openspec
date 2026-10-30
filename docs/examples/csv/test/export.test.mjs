import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exportCsv } from '../export.mjs';

test('exports a header and one record [EXP-001]', () => {
  assert.equal(exportCsv([{name: 'Ada'}], ['name']), 'name\r\nAda\r\n');
});

test('selects and orders explicit columns for every record [EXP-002]', () => {
  const records = [{name: 'Ada', city: 'London', hidden: 'ignore'}, {name: 'Grace', city: 'New York', hidden: 'ignore'}];
  assert.equal(exportCsv(records, ['city', 'name']), 'city,name\r\nLondon,Ada\r\nNew York,Grace\r\n');
});

test('quotes comma fields in values and headers and leaves plain fields unquoted [EXP-003]', () => {
  assert.equal(exportCsv([{'home,city': 'London, UK', name: 'Ada'}], ['home,city', 'name']), '"home,city",name\r\n"London, UK",Ada\r\n');
  assert.equal(exportCsv([{value: ''}], ['value']), 'value\r\n\r\n');
});

test('doubles embedded quotes in values and headers [EXP-004]', () => {
  assert.equal(exportCsv([{value: 'Say "hello"'}, {value: 'Say "hello", Ada'}, {value: '""'}], ['value']), 'value\r\n"Say ""hello"""\r\n"Say ""hello"", Ada"\r\n""""""\r\n');
  assert.equal(exportCsv([{'a"b': 'x'}], ['a"b']), '"a""b"\r\nx\r\n');
});

test('preserves LF, CR, and CRLF inside quoted fields [EXP-005]', () => {
  for (const newline of ['\n', '\r', '\r\n']) {
    assert.equal(exportCsv([{value: `first${newline}second`}], ['value']), `value\r\n"first${newline}second"\r\n`);
    assert.equal(exportCsv([{value: `"first",${newline}second`}], ['value']), `value\r\n"""first"",${newline}second"\r\n`);
    const header = `a${newline}b`;
    assert.equal(exportCsv([{[header]: 'x'}], [header]), `"${header}"\r\nx\r\n`);
  }
});

test('exports only the escaped header for an empty record list [EXP-006]', () => {
  assert.equal(exportCsv([], ['name', 'city']), 'name,city\r\n');
  assert.equal(exportCsv([], ['home,city', 'a"b', 'line\nbreak']), '"home,city","a""b","line\nbreak"\r\n');
});
