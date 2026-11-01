# Spec Delta

## Purpose

Keep tests aligned with accepted behavior and explicit retirement while preserving active coverage and identity history.

## ADDED Requirements

### Requirement: Independent lifecycle policy
The system SHALL support off, review, and enforce lifecycle modes independently of quality policies, defaulting to review. Enforce SHALL require evidence enabled and complete disposition records against a declared baseline.

#### Scenario: Lifecycle opt-out
- **WHEN** lifecycle is off and coverage is enforce
- **THEN** lifecycle obligations are skipped while coverage enforcement remains active

### Requirement: Maintain affected assertions
The workflow SHALL review affected cases as retained, updated, remapped, or removed against accepted requirement changes.

#### Scenario: Refactoring
- **WHEN** implementation changes while required behavior stays the same
- **THEN** valid behavior assertions remain and implementation-specific test edits receive an explanation

#### Scenario: Changed behavior
- **WHEN** an accepted criterion changes its expected result
- **THEN** affected assertions are updated and verified against the new result

### Requirement: Explicit retirement
The workflow SHALL require accepted retirement and a reason before removing obsolete coverage obligations, preserve identity history, and retain assertions serving active criteria.

#### Scenario: Missing criterion without retirement
- **WHEN** a baseline criterion disappears without explicit retirement
- **THEN** review reports unresolved intent and does not authorize deleting its tests

#### Scenario: Partially retired shared test
- **WHEN** one criterion is retired but its test also serves an active criterion
- **THEN** active assertions survive through retention, splitting, or remapping

#### Scenario: Full retirement
- **WHEN** accepted retirement removes a criterion and its assertions serve no active obligations
- **THEN** obsolete assertions may be removed while its ID stays reserved and previous evidence remains historical
