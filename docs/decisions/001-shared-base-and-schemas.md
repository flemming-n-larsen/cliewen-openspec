---
type: decision
category: architecture
status: accepted
---
# Share project knowledge across a small schema collection

## Context

The project needs different workflows for understood changes and investigations, while preserving documentation, decisions and evidence across change boundaries. The user confirmed this direction in the project planning conversation before implementation.

## Considered options

- A single workflow whose artifact graph changes through many feature flags.
- Independent schemas with their own documentation and evidence conventions.
- A small collection with a common base and an aggregated workflow.

## Decision

Use a common base and standalone cliewen-delivery, cliewen-discovery and cliewen-all bundles. Delivery is the recommended default; all combines discovery and delivery without duplicating steps. Produce bundles from shared source definitions because OpenSpec loads one schema per change and does not compose schemas at runtime.

Evidence is enabled by default. Configuration controls project settings and explicit facility opt-outs; schema selection controls the artifact graph. Local plans remain optional where a ticket system already owns planning information.

## Consequences

All workflows must preserve compatible document metadata, decision status, AC identities and evidence formats. Version base and schemas together initially. Discovery findings cannot count as proof of product behavior that has not been implemented. The alpha implements delivery, discovery, and all as standalone bundles from shared sources. Release-profile evaluation remains pending.
