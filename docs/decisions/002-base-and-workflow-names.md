---
type: decision
category: architecture
status: accepted
---
# Distinguish the shared base from selectable workflows

## Context

The user asked whether `cliewen-discovery` should instead be named `cliewen-base`. The user accepted the distinction below in the project conversation. This clarifies the naming in [the shared-base decision](001-shared-base-and-schemas.md); it does not replace that decision.

## Considered options

- Rename discovery to base.
- Offer base as an additional minimal schema.
- Name the internal foundation base and retain the workflow names.

## Decision

Use `cliewen-base` for the internal shared foundation. It supplies common definitions, templates, documentation conventions, Decision Records, AC identities, evidence, and configuration to the generated standalone bundles.

Retain the selectable schema names:

- `cliewen-discovery`: investigation, alternatives, experiments, and decision handoff; may end without implementation.
- `cliewen-delivery`: implementation and verification of an understood change.
- `cliewen-all`: combined discovery and delivery with overlapping steps consolidated.

## Consequences

Do not publish or describe `cliewen-base` as a separately selectable OpenSpec schema. Bundles remain standalone because OpenSpec does not compose them at runtime. A future minimal selectable workflow would require a separate product decision.

The current alpha shares source-loading and writing guidance across delivery and discovery. The shared base is internal, not a separate package or selectable schema. The combined all workflow is also implemented as a standalone bundle using those shared sources.

[016: Serve user projects with a clear boundary for maintainer tooling](016-user-projects-and-maintainer-tooling.md) defines the separate boundary between the installed product and tools used to develop Cliewen itself.
