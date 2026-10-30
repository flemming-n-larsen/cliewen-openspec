# CSV export

## Purpose

Allow callers to export records as CSV with explicit column ordering and preserve fields containing delimiters, quotation marks, or line breaks.

## ADDED Requirements

### Requirement: Header and explicit columns

The function SHALL include a header row and serialize each record using the caller's explicit column order.

#### Scenario: Export a record with a header [EXP-001]
Test-type: Unit
- **WHEN** records `[{ name: "Ada" }]` are exported with columns `["name"]`
- **THEN** the parsed CSV contains the header `name` and one record containing `Ada`

#### Scenario: Respect explicit column order [EXP-002]
Test-type: Unit
- **WHEN** records `[{ name: "Ada", city: "London" }]` are exported with columns `["city", "name"]`
- **THEN** the header and record fields follow `city`, then `name`, regardless of object property order

### Requirement: Escape CSV fields

The function SHALL enclose fields containing commas, quotation marks, carriage returns, or line feeds in double quotation marks and double any embedded double quotation marks. Fields without those characters SHALL preserve their values without unnecessary quoting.

#### Scenario: Preserve a field containing a comma [EXP-003]
Test-type: Unit
- **WHEN** a field contains `London, UK`
- **THEN** it is serialized as `"London, UK"` and remains one field

#### Scenario: Preserve embedded quotation marks [EXP-004]
Test-type: Unit
- **WHEN** a field contains `Say "hello"`
- **THEN** it is serialized as `"Say ""hello"""` without losing the quotation marks

#### Scenario: Preserve line breaks within a field [EXP-005]
Test-type: Unit
- **WHEN** a field contains a carriage return, line feed, or CRLF pair
- **THEN** the field is quoted and its original line break characters are preserved within that field

### Requirement: Empty record list

The function SHALL emit only the header when the record list is empty.

#### Scenario: Export no records [EXP-006]
Test-type: Unit
- **WHEN** an empty record list is exported with columns `["name", "city"]`
- **THEN** the output contains exactly one CSV row with those header fields and no data rows
