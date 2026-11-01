---
type: decision
category: architecture
status: accepted
---
# Serve user projects with a clear boundary for maintainer tooling

## Context

Cliewen extends OpenSpec for projects that adopt it. This repository also contains tools for developing and evaluating Cliewen itself. Without an explicit boundary, internal tools can become accidental user requirements, and successful package tests can be mistaken for validation of a user's system.

The owner approved this product boundary after the decision audit. It complements [002: Distinguish the shared base from selectable workflows](002-base-and-workflow-names.md), which defines the schema collection's internal structure.

## Decision

Schemas, installed instructions, and project configuration must work in an adopting project without access to this repository's checkout or development environment. Required resources must be delivered through the supported installation or declared dependencies.

Keep maintainer agent trials, regression fixtures, and documentation-site build tools separate from user requirements. Their providers, accounts, and toolchains are not prerequisites for adopting Cliewen. Making an internal tool a supported user feature requires an explicit product decision and a documented installation, configuration, and support boundary.

Documentation and command examples must identify the project in which a command runs, the files it changes, and the configuration that applies. Distinguish shipped features from internal checks and planned functionality. Preserve user-owned resources under [014: Own generated resources and recover failed installation changes](014-installer-ownership-and-recoverable-lifecycle.md).

Maintainer tests provide evidence about Cliewen's behavior in the tested fixtures. Validation of an adopting project's behavior requires that project's own specs, tests, and evidence under [008: Treat evidence as core without overstating what it proves](008-evidence-is-core-and-has-explicit-limits.md).

## Consequences and implementation status

Review new features against both contexts: what the adopting project receives and what maintainers need to build or evaluate it. Test installed behavior from a separate project fixture where independence from this checkout matters.

The alpha already installs standalone schema bundles and has separate maintainer evaluation and site tooling. This decision establishes the product boundary; it does not claim that every consumer environment or configuration has been validated. Future validators intended for user projects must be delivered as supported product features rather than inferred from checks in this repository.
