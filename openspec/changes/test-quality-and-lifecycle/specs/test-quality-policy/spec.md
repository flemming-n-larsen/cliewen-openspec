# Spec Delta

## Purpose

Assess distinct test cases and assertion effectiveness while keeping execution evidence separate from semantic review.

## ADDED Requirements

### Requirement: Independent quality policies
The system SHALL support independent coverage and effectiveness modes of off, review, and enforce, defaulting to review. Enforce SHALL require evidence enabled.

#### Scenario: Independent opt-out
- **WHEN** coverage is off and effectiveness is review
- **THEN** coverage obligations are skipped while effectiveness review remains active

#### Scenario: Contradictory configuration
- **WHEN** enforce is selected with evidence disabled
- **THEN** validation rejects the configuration with recovery instructions

### Requirement: Distinct category coverage
The system SHALL check configurable nonnegative case minima, defaulting to one positive, one negative, and zero boundary cases, using distinct passed, fresh, type-consistent automated cases. Scoped reviewed exceptions SHALL waive only their stated obligations.

#### Scenario: Missing negative case
- **WHEN** positive cases pass but no negative case or applicable exception exists
- **THEN** review mode warns and enforce mode blocks on the missing negative minimum

#### Scenario: Multiple distinct cases
- **WHEN** two distinct positive cases pass against a positive minimum of two
- **THEN** that minimum is satisfied

#### Scenario: Retries and skipped results
- **WHEN** one positive case is repeated and another is skipped against a minimum of two
- **THEN** only one passed case counts and the minimum remains unmet

#### Scenario: Scoped exception
- **WHEN** a reviewed exception waives one scenario's negative minimum
- **THEN** other obligations remain active and failed tests or stale evidence still fail their existing checks

### Requirement: Reviewed effectiveness
The system SHALL validate required effectiveness records without claiming to prove assertion meaning. Review SHALL assess whether an observed failure detects the intended behavior defect.

#### Scenario: Passing tests without effectiveness records
- **WHEN** execution passes but effectiveness records are missing in enforce mode
- **THEN** completion is blocked with an explanation of the missing review evidence

#### Scenario: Unrelated failure
- **WHEN** a missing dependency causes the recorded failure
- **THEN** review requires a relevant behavior failure before accepting the effectiveness claim

### Requirement: Review input freshness
The system SHALL validate review records against their declared inspected inputs, command scope, and available baseline. Editing a declared source or test input SHALL invalidate the review, while the review record SHALL NOT require its own content hash.

#### Scenario: Tests change after review
- **WHEN** an inspected test file differs from its recorded digest
- **THEN** review mode warns and enforce mode blocks until the changed input is reviewed

#### Scenario: Review wording changes
- **WHEN** only the review record's explanation changes and its inspected inputs stay the same
- **THEN** the review has no self-hash freshness failure, while execution evidence still requires recollection after a commit

#### Scenario: Archive changes review scope
- **WHEN** a change-scoped record is offered for a permanent-spec check after archive
- **THEN** the checker requests a permanent-spec record with reviewed inputs instead of silently carrying approval across scopes

### Requirement: Legacy report adoption
The system SHALL preserve version-1 execution checks and apply new metadata obligations according to independently configured policy modes.

#### Scenario: Old results with policies disabled
- **WHEN** all new policies are off and a valid version-1 report lacks case metadata
- **THEN** existing execution, linkage, type, and freshness checks retain their behavior

#### Scenario: Missing optional metadata in review mode
- **WHEN** a mapped test lacks case metadata while coverage uses review mode
- **THEN** collection retains its execution result and the coverage checker warns rather than causing a collection failure
