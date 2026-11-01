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
